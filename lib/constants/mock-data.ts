// lib/constants/mock-data.ts
import { Space, AccessCode, AccessLog } from '../../shared/types/space'

export const MOCK_SPACES: Space[] = [
  {
    id: '1',
    partner_id: 'partner-1',
    name: 'Storage Unit A-42',
    description: 'Climate controlled storage unit in downtown facility',
    address: '123 Storage Lane, Downtown, City',
    lock_id: 'LOCK_001',
    camera_url: 'https://picsum.photos/640/480?random=1',
    is_active: true,
    open_hours: {
      mon: { start: '06:00', end: '22:00' },
      tue: { start: '06:00', end: '22:00' },
      wed: { start: '06:00', end: '22:00' },
      thu: { start: '06:00', end: '22:00' },
      fri: { start: '06:00', end: '22:00' },
      sat: { start: '08:00', end: '20:00' },
      sun: { start: '08:00', end: '20:00' }
    },
    max_duration_minutes: 120,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    partner: {
      company_name: 'SecureStore Inc',
      verified: true
    }
  },
  {
    id: '2',
    partner_id: 'partner-2',
    name: 'Tool Trailer #5',
    description: 'Construction tool trailer at Oak Street site',
    address: '456 Oak Street Construction Site',
    lock_id: 'LOCK_002',
    camera_url: 'https://picsum.photos/640/480?random=2',
    is_active: true,
    open_hours: {
      mon: { start: '07:00', end: '18:00' },
      tue: { start: '07:00', end: '18:00' },
      wed: { start: '07:00', end: '18:00' },
      thu: { start: '07:00', end: '18:00' },
      fri: { start: '07:00', end: '18:00' }
    },
    max_duration_minutes: 60,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    partner: {
      company_name: 'BuildCorp',
      verified: true
    }
  }
]

export const MOCK_ACCESS_CODES: AccessCode[] = [
  {
    id: 'code-1',
    user_id: 'user-1',
    space_id: '1',
    code: 'QR123456',
    type: 'qr',
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    space: MOCK_SPACES[0]
  }
]