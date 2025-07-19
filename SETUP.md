# ELSAS Setup Guide

This guide will help you set up and deploy the ELSAS (Every Life Software as a Service) application.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Supabase account (free tier available)
- Modern web browser

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd elsas-mvp
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Run the database schema:

```bash
# Copy the schema to your Supabase SQL editor
cat database/schema.sql
```

4. Execute the schema in your Supabase SQL editor

### 4. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Manual Setup

1. **Create Tables**: Execute the SQL schema in `database/schema.sql`
2. **Set up RLS**: Row Level Security is automatically configured
3. **Create Storage Buckets**: 
   - `avatars` for user profile pictures
   - `logos` for partner company logos

### Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push the schema
supabase db push
```

## Authentication Setup

### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`
6. Add to `.env.local`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Storage Setup

### Supabase Storage

1. Go to Storage in your Supabase dashboard
2. Create buckets:
   - `avatars` (public)
   - `logos` (public)
3. Set up policies for public access

### Storage Policies

```sql
-- Allow public read access to avatars
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Similar policies for logos bucket
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_production_secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Other Platforms

- **Netlify**: Similar to Vercel setup
- **Railway**: Use Railway's environment variable system
- **Docker**: Use the provided Dockerfile

## Testing

### Run Tests

```bash
npm run test
# or
yarn test
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Partner registration and verification
- [ ] Space creation and management
- [ ] Access code generation (QR/OTP)
- [ ] Access code validation
- [ ] Camera feed integration
- [ ] Real-time notifications
- [ ] Profile management
- [ ] Access logs and history

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check Supabase URL and keys
   - Verify database schema is applied
   - Check RLS policies

2. **Authentication Issues**
   - Verify OAuth configuration
   - Check redirect URIs
   - Ensure environment variables are set

3. **Storage Upload Failures**
   - Verify storage bucket exists
   - Check storage policies
   - Ensure proper file permissions

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG=true
```

### Support

- Check the [API Documentation](API_README.md)
- Review [Supabase Documentation](https://supabase.com/docs)
- Open an issue in the repository

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **API Keys**: Rotate keys regularly
3. **RLS Policies**: Review and test all database policies
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Implement rate limiting for API endpoints

## Performance Optimization

1. **Database Indexes**: Ensure proper indexing on frequently queried columns
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Image Optimization**: Use Next.js Image component for optimized images
4. **Code Splitting**: Leverage Next.js automatic code splitting

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **Supabase Dashboard**: Database and API monitoring
- **Google Analytics**: User behavior tracking

### Health Checks

Implement health check endpoints:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
}
```

## Backup and Recovery

### Database Backups

1. **Supabase**: Automatic daily backups
2. **Manual**: Export data using Supabase CLI
3. **Schema**: Version control your database schema

### File Storage

1. **Supabase Storage**: Automatic redundancy
2. **Manual**: Download important files regularly
3. **CDN**: Use CDN for static assets

## Scaling Considerations

1. **Database**: Upgrade Supabase plan as needed
2. **CDN**: Implement CDN for global performance
3. **Caching**: Add Redis for session and data caching
4. **Load Balancing**: Use multiple regions for global users

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 