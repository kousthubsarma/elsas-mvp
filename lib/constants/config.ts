// lib/constants/config.ts
export const APP_CONFIG = {
  name: 'ELSAS',
  description: 'Every Life Software as a Service - Smart Access Management',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  links: {
    github: 'https://github.com/elsas/elsas-mvp',
    docs: '/docs',
    support: '/support'
  },
  defaults: {
    maxDurationMinutes: 60,
    qrExpiryMinutes: 15,
    otpExpiryMinutes: 5,
    maxActiveCodesPerUser: 3
  }
}