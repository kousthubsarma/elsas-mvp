// lib/hooks/use-spaces.ts
'use client'

import { useState, useEffect } from 'react'
import { Space } from '../../shared/types/space'
import { supabase } from '../supabase/client'

export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSpaces()
  }, [])

  const fetchSpaces = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          partner:partners(company_name, verified)
        `)
        .eq('is_active', true)

      if (error) throw error
      setSpaces(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spaces')
    } finally {
      setLoading(false)
    }
  }

  return { spaces, loading, error, refetch: fetchSpaces }
}