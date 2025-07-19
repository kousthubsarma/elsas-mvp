// shared/types/space.ts
export interface Space {
  id: string;
  partner_id: string;
  name: string;
  description?: string;
  address: string;
  lock_id: string;
  camera_url?: string;
  is_active: boolean;
  open_hours: Record<string, { start: string; end: string }>;
  max_duration_minutes: number;
  created_at: string;
  updated_at: string;
  partner?: {
    company_name: string;
    verified: boolean;
  };
}
