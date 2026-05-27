export type UserRole = "user" | "admin";

export type LicenceStatus =
  | "valid"
  | "renewal_soon"
  | "renewal_open"
  | "expired";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface StateGroup {
  id: string;
  name: string;
  expiration_months: number;
  renewal_processing_days: number;
  created_at: string;
  updated_at: string;
}

export interface State {
  id: string;
  name: string;
  code: string;
  group_id: string | null;
  expiration_months: number | null;
  renewal_processing_days: number | null;
  created_at: string;
  updated_at: string;
  state_groups?: StateGroup | null;
}

export interface StateRules {
  expiration_months: number;
  renewal_processing_days: number;
}

export interface Licence {
  id: string;
  user_id: string;
  state_id: string;
  last_renewed_at: string;
  licence_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  states?: State | null;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  notify_days_before: number[];
  created_at: string;
  updated_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  licence_id: string;
  channel: "email" | "push";
  notification_type: string;
  sent_at: string;
}

export interface LicenceWithStatus extends Licence {
  status: LicenceStatus;
  expiresAt: Date;
  startRenewalBy: Date;
  daysUntilRenewalWindow: number;
  daysUntilExpiry: number;
  rules: StateRules;
}
