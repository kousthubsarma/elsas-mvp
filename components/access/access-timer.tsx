// components/access/access-timer.tsx
'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface AccessTimerProps {
  expiresAt: string
  className?: string
}

export function AccessTimer({ expiresAt, className }: AccessTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number
    seconds: number
    expired: boolean
  }>({ minutes: 0, seconds: 0, expired: false })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const difference = expiry - now

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        setTimeLeft({ minutes, seconds, expired: false })
      } else {
        setTimeLeft({ minutes: 0, seconds: 0, expired: true })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt])

  const isUrgent = timeLeft.minutes < 2 && !timeLeft.expired

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {timeLeft.expired ? (
        <AlertTriangle className="h-4 w-4 text-red-500" />
      ) : (
        <Clock className={`h-4 w-4 ${isUrgent ? 'text-orange-500' : 'text-gray-500'}`} />
      )}
      <span className={`font-mono text-sm ${
        timeLeft.expired 
          ? 'text-red-500 font-bold' 
          : isUrgent 
          ? 'text-orange-500 font-bold' 
          : 'text-gray-600'
      }`}>
        {timeLeft.expired 
          ? 'Expired' 
          : `${timeLeft.minutes}:${timeLeft.seconds.toString().padStart(2, '0')}`
        }
      </span>
    </div>
  )
}