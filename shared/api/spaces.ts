// shared/api/spaces.ts
import { supabase } from '../../lib/supabase/client'
import { Space } from '../types/space'

export async function getSpaces(): Promise<Space[]> {
  const { data, error } = await supabase
    .from('spaces')
    .select(`
      *,
      partner:partners(company_name, verified)
    `)
    .eq('is_active', true)
    
  if (error) throw error
  return data || []
}

export async function getSpaceById(id: string): Promise<Space | null> {
  const { data, error } = await supabase
    .from('spaces')
    .select(`
      *,
      partner:partners(company_name, verified)
    `)
    .eq('id', id)
    .single()
    
  if (error) throw error
  return data
}

export async function getNearbySpaces(lat: number, lng: number, radius = 5): Promise<Space[]> {
  // For now, return all spaces - in production you'd use PostGIS for geospatial queries
  const spaces = await getSpaces()
  return spaces
}

export async function createSpace(space: Partial<Space>): Promise<Space> {
  const { data, error } = await supabase
    .from('spaces')
    .insert(space)
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function updateSpace(id: string, updates: Partial<Space>): Promise<Space> {
  const { data, error } = await supabase
    .from('spaces')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
    
  if (error) throw error
  return data
}
