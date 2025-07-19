// shared/types/user.ts
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'user' | 'partner' | 'admin';
  id_verified: boolean;
  id_document_url?: string;
  created_at: string;
  updated_at: string;
}