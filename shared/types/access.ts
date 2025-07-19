// shared/types/access.ts
export interface AccessCode {
  id: string;
  user_id: string;
  space_id: string;
  code: string;
  type: 'qr' | 'otp';
  expires_at: string;
  used_at?: string;
  status: 'pending' | 'active' | 'used' | 'expired';
  created_at: string;
  space?: Space;
}

export interface AccessLog {
  id: string;
  access_code_id?: string;
  user_id: string;
  space_id: string;
  event: 'requested' | 'granted' | 'denied' | 'unlocked' | 'locked' | 'expired';
  metadata?: Record<string, any>;
  created_at: string;
  space?: Space;
  user?: User;
}

export interface Partner {
  id: string;
  user_id: string;
  company_name: string;
  business_license?: string;
  verified: boolean;
  created_at: string;
}