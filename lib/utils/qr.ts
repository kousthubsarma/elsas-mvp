// lib/utils/otp.ts
import { authenticator } from 'otplib'

export function generateOTP(): string {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateTOTP(secret: string): string {
  return authenticator.generate(secret)
}

export function verifyTOTP(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret })
}

export function generateSecret(): string {
  return authenticator.generateSecret()
}
