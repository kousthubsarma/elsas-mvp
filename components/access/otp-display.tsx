// components/access/otp-display.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Copy, RefreshCw, Eye, EyeOff } from 'lucide-react'

interface OTPDisplayProps {
  code: string
  spaceName: string
  expiresAt: string
  onRefresh?: () => void
}

export function OTPDisplay({ code, spaceName, expiresAt, onRefresh }: OTPDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
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
        <div className="text-center">
          <div className="text-3xl font-mono font-bold bg-gray-100 p-6 rounded-lg border">
            {showCode ? code : '••••••'}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            One-time password
          </p>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowCode(!showCode)} 
            variant="outline" 
            size="sm"
          >
            {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button onClick={copyToClipboard} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy'}
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
