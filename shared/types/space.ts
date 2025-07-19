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

export interface AccessCode {
  id: string;
  user_id: string;
  space_id: string;
  code: string;
  type: "qr" | "otp";
  status: "pending" | "active" | "used" | "expired" | "revoked";
  expires_at: string;
  used_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  space?: Space;
}

export interface AccessLog {
  id: string;
  user_id: string;
  space_id: string;
  access_code_id?: string;
  event: "requested" | "granted" | "denied" | "unlocked" | "expired" | "revoked";
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  space?: Space;
  user?: {
    full_name: string;
    email: string;
  };
}
