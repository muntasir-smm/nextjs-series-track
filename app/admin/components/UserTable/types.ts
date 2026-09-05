// app/admin/components/UserTable/types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string;
  is_banned: boolean;
  is_active: boolean;
  is_approved?: boolean;
  approved_at?: string;
  ban_reason?: string;
  avatar_url?: string | null;
}

export type FilterType = "all" | "pending" | "active" | "banned" | "admins";
