-- ELSAS Database Schema
-- This file contains all the database tables and relationships for the ELSAS application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'partner', 'admin');
CREATE TYPE access_code_type AS ENUM ('qr', 'otp');
CREATE TYPE access_code_status AS ENUM ('pending', 'active', 'used', 'expired', 'revoked');
CREATE TYPE access_event_type AS ENUM ('requested', 'granted', 'denied', 'unlocked', 'expired', 'revoked');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    preferences JSONB DEFAULT '{"notifications": true, "email_alerts": true, "sms_alerts": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners table
CREATE TABLE partners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    website TEXT,
    logo_url TEXT,
    preferences JSONB DEFAULT '{"notifications": true, "email_alerts": true, "sms_alerts": false, "auto_approve": false}',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaces table
CREATE TABLE spaces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    lock_id TEXT NOT NULL,
    camera_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    open_hours JSONB DEFAULT '{"mon": {"start": "09:00", "end": "17:00"}, "tue": {"start": "09:00", "end": "17:00"}, "wed": {"start": "09:00", "end": "17:00"}, "thu": {"start": "09:00", "end": "17:00"}, "fri": {"start": "09:00", "end": "17:00"}}',
    max_duration_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access codes table
CREATE TABLE access_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    type access_code_type NOT NULL,
    status access_code_status DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access logs table
CREATE TABLE access_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    access_code_id UUID REFERENCES access_codes(id) ON DELETE SET NULL,
    event access_event_type NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_company_name ON partners(company_name);
CREATE INDEX idx_spaces_partner_id ON spaces(partner_id);
CREATE INDEX idx_spaces_is_active ON spaces(is_active);
CREATE INDEX idx_access_codes_user_id ON access_codes(user_id);
CREATE INDEX idx_access_codes_space_id ON access_codes(space_id);
CREATE INDEX idx_access_codes_status ON access_codes(status);
CREATE INDEX idx_access_codes_expires_at ON access_codes(expires_at);
CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_space_id ON access_logs(space_id);
CREATE INDEX idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_access_codes_updated_at BEFORE UPDATE ON access_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Partners policies
CREATE POLICY "Partners can view own profile" ON partners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Partners can update own profile" ON partners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Partners can insert own profile" ON partners FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view partner profiles" ON partners FOR SELECT USING (true);

-- Spaces policies
CREATE POLICY "Partners can manage own spaces" ON spaces FOR ALL USING (
    EXISTS (
        SELECT 1 FROM partners 
        WHERE partners.user_id = auth.uid() 
        AND partners.id = spaces.partner_id
    )
);
CREATE POLICY "Users can view active spaces" ON spaces FOR SELECT USING (is_active = true);

-- Access codes policies
CREATE POLICY "Users can view own access codes" ON access_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own access codes" ON access_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Partners can view access codes for their spaces" ON access_codes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM spaces 
        JOIN partners ON spaces.partner_id = partners.id 
        WHERE partners.user_id = auth.uid() 
        AND spaces.id = access_codes.space_id
    )
);

-- Access logs policies
CREATE POLICY "Users can view own access logs" ON access_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Partners can view logs for their spaces" ON access_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM spaces 
        JOIN partners ON spaces.partner_id = partners.id 
        WHERE partners.user_id = auth.uid() 
        AND spaces.id = access_logs.space_id
    )
);
CREATE POLICY "System can insert access logs" ON access_logs FOR INSERT WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Functions for common operations

-- Function to create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to generate access codes
CREATE OR REPLACE FUNCTION generate_access_code(
    p_user_id UUID,
    p_space_id UUID,
    p_type access_code_type,
    p_duration_minutes INTEGER DEFAULT 60
)
RETURNS UUID AS $$
DECLARE
    v_code TEXT;
    v_access_code_id UUID;
BEGIN
    -- Generate code based on type
    IF p_type = 'qr' THEN
        v_code := encode(gen_random_bytes(32), 'hex');
    ELSE
        v_code := lpad(floor(random() * 1000000)::text, 6, '0');
    END IF;
    
    -- Insert access code
    INSERT INTO access_codes (user_id, space_id, code, type, expires_at)
    VALUES (p_user_id, p_space_id, v_code, p_type, NOW() + (p_duration_minutes || ' minutes')::INTERVAL)
    RETURNING id INTO v_access_code_id;
    
    -- Log the access request
    INSERT INTO access_logs (user_id, space_id, access_code_id, event)
    VALUES (p_user_id, p_space_id, v_access_code_id, 'requested');
    
    RETURN v_access_code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and use access code
CREATE OR REPLACE FUNCTION validate_access_code(
    p_code TEXT,
    p_space_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_access_code access_codes%ROWTYPE;
    v_result JSONB;
BEGIN
    -- Find the access code
    SELECT * INTO v_access_code
    FROM access_codes
    WHERE code = p_code 
    AND space_id = p_space_id
    AND status = 'active'
    AND expires_at > NOW();
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid or expired access code'
        );
    END IF;
    
    -- Update access code status
    UPDATE access_codes 
    SET status = 'used', used_at = NOW()
    WHERE id = v_access_code.id;
    
    -- Log the access
    INSERT INTO access_logs (user_id, space_id, access_code_id, event)
    VALUES (v_access_code.user_id, p_space_id, v_access_code.id, 'unlocked');
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Access granted',
        'user_id', v_access_code.user_id,
        'access_code_id', v_access_code.id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired access codes
CREATE OR REPLACE FUNCTION cleanup_expired_access_codes()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE access_codes 
    SET status = 'expired'
    WHERE status = 'active' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired codes (if using pg_cron)
-- SELECT cron.schedule('cleanup-expired-codes', '*/15 * * * *', 'SELECT cleanup_expired_access_codes();');

-- Sample data for testing (optional)
-- INSERT INTO partners (user_id, company_name, email, is_verified) VALUES 
-- ('00000000-0000-0000-0000-000000000001', 'Sample Storage Co.', 'partner@samplestorage.com', true);

-- INSERT INTO spaces (partner_id, name, address, lock_id) VALUES 
-- ('00000000-0000-0000-0000-000000000001', 'Storage Unit A1', '123 Main St, City, State', 'lock-001'),
-- ('00000000-0000-0000-0000-000000000001', 'Storage Unit A2', '123 Main St, City, State', 'lock-002'); 