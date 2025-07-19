# ELSAS - Every Life Software as a Service

## 🚀 Product Vision

ELSAS is a revolutionary access management platform that bridges the gap between physical spaces and digital security. Our vision is to create a world where any physical space - from trailers and storage units to kiosks and private rooms - can be securely accessed through digital authentication, eliminating the need for physical keys while providing comprehensive access control and monitoring.

### What We're Building

ELSAS enables property owners to transform their physical spaces into smart, digitally-managed assets that can be accessed on-demand by verified users. Think of it as "Airbnb meets smart locks" - but focused on secure, temporary access rather than accommodation.

## 🎯 Core Functionality (MVP)

### For Space Partners (Property Owners)
- **Space Registration**: Register physical locations with addresses and access parameters
- **Smart Lock Integration**: Connect spaces to smart locks (real or simulated)
- **Camera Integration**: Optional camera feed monitoring via Ring/Verkada or static feeds
- **Access Control**: Set operating hours and duration limits
- **Real-time Monitoring**: View live access logs and space usage analytics
- **Revenue Tracking**: Monitor space utilization and potential revenue (future)

### For Users
- **Identity Verification**: Multi-step verification including email, phone, and ID upload
- **Space Discovery**: Find nearby available spaces using geolocation
- **Instant Access**: Request and receive QR codes or OTP for immediate access
- **Access History**: Track personal usage history and active access codes
- **Mobile-First Experience**: Optimized for on-the-go access via smartphones

### System Features
- **QR Code Generation**: Unique, time-limited QR codes for each access request
- **OTP Support**: Alternative one-time passwords for devices without cameras
- **Real-time Updates**: WebSocket connections for live status updates
- **Comprehensive Logging**: Every access attempt logged with metadata
- **JWT Authentication**: Secure, token-based auth ready for mobile apps

## 🏗️ Technical Architecture

### Current Stack
- **Frontend**: Next.js 14 (App Router) with TypeScript
- **UI/UX**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth with JWT tokens
- **QR/OTP**: qrcode + otplib packages
- **Maps**: Leaflet (no API key required)
- **Deployment**: Optimized for Vercel/Railway

### Architecture Decisions
- **API-First Design**: All functionality exposed via REST APIs for future mobile apps
- **Mobile-Ready**: Responsive design with touch-optimized interfaces
- **Real-time Capable**: WebSocket infrastructure for live updates
- **Scalable**: Stateless architecture ready for horizontal scaling

## 🎨 Demo Scenarios

### Scenario 1: Self-Storage Access
A storage facility owner registers 50 units. Customers verify their identity once, then can access their unit 24/7 using QR codes, with all access logged for security.

### Scenario 2: Construction Site Trailers
A construction company manages tool trailers across multiple sites. Authorized workers can access specific trailers during work hours, with camera feeds for security.

### Scenario 3: Pop-up Retail Kiosks
Retail brands deploy unmanned kiosks in high-traffic areas. Customers verify identity to access premium products, with duration limits and camera monitoring.

## 🚧 Current Development Status

### ✅ Completed
- Project structure and architecture
- Database schema design
- Authentication flow setup
- Basic UI component library
- Mobile-responsive layouts

### 🔄 In Progress
- Partner dashboard implementation
- QR/OTP generation system
- Access request workflow
- Real-time status updates
- Camera feed integration

### 📋 Pending
- Smart lock API integration
- Geolocation-based discovery
- Push notifications
- Analytics dashboard
- Payment integration

## 🔮 Future Enhancements

### Phase 2: Enhanced Security
- **Biometric Authentication**: Face ID/fingerprint for mobile apps
- **AI-Powered Monitoring**: Anomaly detection in access patterns
- **Multi-factor Authentication**: Additional security layers
- **Blockchain Logging**: Immutable access records

### Phase 3: Smart Features
- **Predictive Access**: ML-based access prediction and pre-authorization
- **Dynamic Pricing**: Time-based pricing for commercial spaces
- **Integration Hub**: Connect with existing property management systems
- **IoT Sensors**: Temperature, humidity, motion detection
- **Energy Management**: Smart power control for spaces

### Phase 4: Platform Expansion
- **White-Label Solution**: Customizable for enterprise clients
- **Marketplace**: Users can list and monetize their spaces
- **Insurance Integration**: Automated insurance for space usage
- **Multi-language Support**: Global expansion ready
- **Compliance Tools**: GDPR, CCPA, and industry-specific compliance

### Phase 5: Advanced Features
- **AR Navigation**: Augmented reality guidance to spaces
- **Voice Commands**: Alexa/Google Assistant integration
- **Automated Contracts**: Smart contracts for space rental
- **Social Features**: Space sharing and recommendations
- **Carbon Tracking**: Environmental impact monitoring

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL (local or Supabase)
- WSL (for Windows users) or Unix-based system
- Git

### Step-by-Step Setup

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/elsas-mvp.git
cd elsas-mvp
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Set up Supabase

**Option A: Cloud Supabase (Recommended for quick start)**
1. Go to app.supabase.com
2. Create a new project (free tier)
3. Save your database password
4. Wait for project to initialize (~2 minutes)
5. Go to Settings → API
6. Copy:
   - Project URL
   - anon (public) key
   - service_role (secret) key

**Option B: Local Supabase (For offline development)**
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase init
supabase start

# This will output your local credentials
```

#### 4. Configure environment variables
```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your favorite editor
nano .env.local
```

Update these values:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 5. Set up the database

**For Cloud Supabase:**
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of supabase/migrations/001_initial_schema.sql
3. Run the query
4. Copy contents of supabase/seed.sql
5. Run the seed query

**For Local Development:**
```bash
# Apply migrations
supabase db push

# Seed the database
supabase db seed
```

#### 6. Start the development server
```bash
npm run dev
```

#### 7. Access the application
- Desktop: http://localhost:3000
- Mobile (same network): http://[YOUR-LOCAL-IP]:3000

To find your local IP:
```bash
# On Linux/Mac
hostname -I | awk '{print $1}'

# On Windows (in WSL)
ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}'
```

## 📱 Mobile Testing Guide

### Testing on Physical Devices

**Android**
1. Ensure phone is on same WiFi network
2. Open Chrome/Firefox
3. Navigate to http://[YOUR-LOCAL-IP]:3000
4. For HTTPS testing, use ngrok:
   ```bash
   npx ngrok http 3000
   ```

**iOS**
1. Same network requirement
2. Safari works best
3. For app-like experience:
   - Open in Safari
   - Tap Share button
   - Select "Add to Home Screen"

### Browser DevTools Testing
```bash
# Chrome/Edge
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device preset
4. Refresh page

# Firefox
1. Open Responsive Design Mode (Ctrl+Shift+M)
2. Select device
3. Test touch events
```

## 🔧 Development Guide

### Project Structure
```
elsas-mvp/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard
│   ├── api/               # API endpoints
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── spaces/           # Space-specific
│   └── access/           # Access management
├── lib/                   # Utilities
│   ├── supabase/         # Database client
│   ├── utils/            # Helper functions
│   └── hooks/            # Custom hooks
└── shared/               # Mobile app shared code
```

### Key Commands
```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript check

# Database
npm run db:push         # Apply migrations
npm run db:seed         # Seed demo data
npm run db:reset        # Reset database
```e
npm run db:generate     # Generate types

# Testing
npm run test            # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
Environment Variables
bash# Required
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Public anonymous key
SUPABASE_SERVICE_ROLE_KEY=         # Service role key (secret)

# Optional
NEXT_PUBLIC_APP_URL=               # Your app URL (default: http://localhost:3000)
NEXT_PUBLIC_APP_NAME=              # App name (default: ELSAS Demo)
NEXT_PUBLIC_MOCK_CAMERA_URL=       # Mock camera feed URL
NEXT_PUBLIC_MAPBOX_TOKEN=          # For advanced map features
NEXT_PUBLIC_ENABLE_ANALYTICS=      # Enable analytics (true/false)
🚀 Deployment
Vercel (Recommended - Free)
bash# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project name? elsas-mvp
# - In which directory? ./
# - Override settings? No

# Add environment variables in Vercel Dashboard
Railway (Alternative - Free tier available)
bash# Install Railway CLI
npm i -g @railway/cli

# Login and init
railway login
railway init

# Deploy
railway up

# Add environment variables
railway variables set NEXT_PUBLIC_SUPABASE_URL=xxx
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
railway variables set SUPABASE_SERVICE_ROLE_KEY=xxx
Netlify
bash# Build command
npm run build

# Publish directory
.next

# Add environment variables in Netlify UI
Docker Deployment
bash# Build image
docker build -t elsas-mvp .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=xxx \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  -e SUPABASE_SERVICE_ROLE_KEY=xxx \
  elsas-mvp
Self-Hosted (VPS)
bash# SSH into your server
ssh user@your-server.com

# Clone and setup
git clone https://github.com/yourusername/elsas-mvp.git
cd elsas-mvp
npm install
npm run build

# Use PM2 for process management
npm i -g pm2
pm2 start npm --name "elsas" -- start
pm2 save
pm2 startup
🧪 Testing
Unit Tests
bash# Run all tests
npm test

# Test specific file
npm test -- auth.test.ts

# Watch mode
npm test -- --watch
E2E Tests
bash# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e

# Open Playwright UI
npm run test:e2e:ui
Manual Testing Checklist

 User registration flow
 Partner registration flow
 Space creation
 QR code generation
 OTP generation
 Access request workflow
 Mobile responsiveness
 Camera feed display
 Real-time updates
 Access logs

🐛 Troubleshooting
Common Issues
Supabase Connection Error
bash# Check your .env.local file
cat .env.local

# Verify Supabase is running (local)
supabase status

# Test connection
npx supabase db remote list
Build Errors
bash# Clear cache
rm -rf .next node_modules
npm install
npm run build
Mobile Access Issues
bash# Check firewall
sudo ufw allow 3000

# Verify IP address
hostname -I

# Try using ngrok for HTTPS
npx ngrok http 3000
Database Migration Errors
bash# Reset database (WARNING: Deletes all data)
npx supabase db reset

# Manual migration
npx supabase migration up
📊 Monitoring & Analytics
Application Monitoring
javascript// Add to app/layout.tsx for basic analytics
useEffect(() => {
  // Page view tracking
  const handleRouteChange = () => {
    console.log('Page viewed:', window.location.pathname)
  }
  
  window.addEventListener('popstate', handleRouteChange)
  return () => window.removeEventListener('popstate', handleRouteChange)
}, [])
Error Tracking
bash# Install Sentry (optional)
npm install @sentry/nextjs

# Configure in sentry.client.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
Performance Monitoring

Use Vercel Analytics (automatic with Vercel deployment)
Or integrate Google Analytics
Monitor Core Web Vitals in Chrome DevTools

🔐 Security Best Practices
Environment Security
bash# Never commit .env.local
echo ".env.local" >> .gitignore

# Use different keys for different environments
# Production: Strong, unique keys
# Development: Separate test keys
API Security

All API routes require authentication
Rate limiting implemented on sensitive endpoints
Input validation on all forms
SQL injection protection via Supabase

Access Control

Row Level Security (RLS) enabled on all tables
JWT tokens expire after 1 hour
Refresh tokens handled automatically
Session management via Supabase Auth

🤝 Contributing
Getting Started

Fork the repository
Create your feature branch
bashgit checkout -b feature/amazing-feature

Commit your changes
bashgit commit -m 'Add some amazing feature'

Push to the branch
bashgit push origin feature/amazing-feature

Open a Pull Request

Code Style

Use TypeScript for type safety
Follow ESLint rules
Write meaningful commit messages
Add tests for new features
Update documentation

Pull Request Template
markdown## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.logs left
📚 Resources
Documentation

Next.js Documentation
Supabase Documentation
Tailwind CSS
shadcn/ui

Tutorials

Next.js + Supabase Tutorial
Building Mobile Apps with Capacitor
QR Code Best Practices

Community

Discord Server
GitHub Discussions
Twitter Updates

📄 License
This project is licensed under the MIT License:
MIT License

Copyright (c) 2024 ELSAS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Made with ❤️ by the ELSAS Team
Building the future of access management, one space at a time

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
