// lib/utils/qr.ts
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

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

export async function generateQR(data: string, options?: QRCode.QRCodeToDataURLOptions): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  }
  
  return QRCode.toDataURL(data, defaultOptions)
}

export function generateQRData(accessCode: string, spaceId: string): string {
  return JSON.stringify({
    code: accessCode,
    space_id: spaceId,
    timestamp: Date.now()
  })
}
