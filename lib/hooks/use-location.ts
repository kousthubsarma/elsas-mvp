// lib/hooks/use-location.ts
'use client'

import { useState, useEffect } from 'react'

interface LocationState {
  lat: number | null
  lng: number | null
  loading: boolean
  error: string | null
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    lat: null,
    lng: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        lat: null,
        lng: null,
        loading: false,
        error: 'Geolocation is not supported'
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null
        })
      },
      (error) => {
        setState({
          lat: null,
          lng: null,
          loading: false,
          error: error.message
        })
      },
      {
        timeout: 10000,
        enableHighAccuracy: true
      }
    )
  }, [])

  return state
}