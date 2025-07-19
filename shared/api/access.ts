// shared/api/access.ts
import { supabase } from '../../lib/supabase/client'
import { AccessCode, AccessLog } from '../types/access'
import { generateAccessCode } from '../../lib/utils/crypto'

export async function requestAccess(
  spaceId: string, 
  type: 'qr' | 'otp' = 'qr'
): Promise<AccessCode> {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error('Not authenticated')
  
  const code = generateAccessCode()
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + (type === 'qr' ? 15 : 5))
  
  const { data, error } = await supabase
    .from('access_codes')
    .insert({
      user_id: user.data.user.id,
      space_id: spaceId,
      code,
      type,
      expires_at: expiresAt.toISOString(),
      status: 'active'
    })
    .select(`
      *,
      space:spaces(
        *,
        partner:partners(company_name, verified)
      )
    `)
    .single()
    
  if (error) throw error
  
  // Log the access request
  await logAccess(data.id, user.data.user.id, spaceId, 'requested')
  
  return data
}

export async function getActiveCodes(): Promise<AccessCode[]> {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('access_codes')
    .select(`
      *,
      space:spaces(
        *,
        partner:partners(company_name, verified)
      )
    `)
    .eq('user_id', user.data.user.id)
    .in('status', ['active', 'pending'])
    .gt('expires_at', new Date().toISOString())
    
  if (error) throw error
  return data || []
}

export async function validateCode(code: string, spaceId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('access_codes')
    .select('*')
    .eq('code', code)
    .eq('space_id', spaceId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .is('used_at', null)
    .single()
    
  if (error || !data) return false
  
  // Mark as used
  await supabase
    .from('access_codes')
    .update({ 
      status: 'used',
      used_at: new Date().toISOString()
    })
    .eq('id', data.id)
    
  return true
}

export async function logAccess(
  accessCodeId: string | null,
  userId: string,
  spaceId: string,
  event: AccessLog['event'],
  metadata?: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from('access_logs')
    .insert({
      access_code_id: accessCodeId,
      user_id: userId,
      space_id: spaceId,
      event,
      metadata
    })
    
  if (error) throw error
}

export async function getAccessLogs(spaceId?: string): Promise<AccessLog[]> {
  let query = supabase
    .from('access_logs')
    .select(`
      *,
      space:spaces(name, address),
      user:profiles(full_name, email)
    `)
    .order('created_at', { ascending: false })
    
  if (spaceId) {
    query = query.eq('space_id', spaceId)
  }
    
  const { data, error } = await query
  if (error) throw error
  return data || []
}