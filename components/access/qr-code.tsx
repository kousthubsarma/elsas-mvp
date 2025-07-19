// components/access/qr-code.tsx
'use client'

import { useEffect, useState } from 'react'
import { generateQR, generateQRData } from '../../lib/utils/qr'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Loader2, Download, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'

interface QRCodeProps {
  accessCode: string
  spaceId: string
  spaceName: string
  expiresAt: string
  onRefresh?: () => void
}

export function QRCode({ accessCode, spaceId, spaceName, expiresAt, onRefresh }: QRCodeProps) {
  const [qrDataURL, setQrDataURL] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    generateQRCode()
  }, [accessCode, spaceId])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const difference = expiry - now

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setTimeLeft('Expired')
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt])

  const generateQRCode = async () => {
    try {
      setLoading(true)
      const qrData = generateQRData(accessCode, spaceId)
      const dataURL = await generateQR(qrData)
      setQrDataURL(dataURL)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.download = `access-${spaceName}-${accessCode}.png`
    link.href = qrDataURL
    link.click()
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg">{spaceName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Expires in: <span className="font-mono font-bold">{timeLeft}</span>
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative">
          {loading ? (
            <div className="w-64 h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <img
              src={qrDataURL}
              alt="Access QR Code"
              className="w-64 h-64 border rounded-lg"
            />
          )}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-mono bg-gray-100 p-2 rounded">
            Code: {accessCode}
          </p>
        </div>

        <div className="flex space-x-2">
          <Button onClick={downloadQR} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
