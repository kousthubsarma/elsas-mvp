// components/access/unlock-button.tsx
'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Unlock, Loader2 } from 'lucide-react'

interface UnlockButtonProps {
  accessCode: string
  spaceId: string
  onUnlock?: (success: boolean) => void
  disabled?: boolean
}

export function UnlockButton({ accessCode, spaceId, onUnlock, disabled }: UnlockButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleUnlock = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: accessCode,
          spaceId
        })
      })

      const result = await response.json()
      onUnlock?.(result.unlocked)
    } catch (error) {
      console.error('Unlock failed:', error)
      onUnlock?.(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleUnlock} 
      disabled={disabled || loading}
      className="w-full"
      size="lg"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
      ) : (
        <Unlock className="h-5 w-5 mr-2" />
      )}
      {loading ? 'Unlocking...' : 'Unlock Space'}
    </Button>
  )
}
