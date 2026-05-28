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

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  accepted_at: string | null;
  created_at: string;
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
  is_custom: boolean;
  gun_renewal_url: string | null;
  expires_on_birthday: boolean;
  expiration_months: number | null;
  renewal_processing_days: number | null;
  created_at: string;
  updated_at: string;
  state_groups?: StateGroup | null;
}

export interface RecordCategory {
  id: string;
  key: "gun_licence" | "gun_course";
  name: string;
  created_at: string;
}

export interface Jurisdiction {
  id: string;
  name: string;
  code: string;
  state_id: string | null;
  is_city: boolean;
  created_at: string;
  updated_at: string;
  states?: State | null;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface RecordType {
  id: string;
  category_id: string;
  jurisdiction_id: string | null;
  organization_id: string | null;
  key: string;
  name: string;
  requires_renewal: boolean;
  expiration_months: number | null;
  renewal_processing_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  record_categories?: RecordCategory | null;
  jurisdictions?: Jurisdiction | null;
  organizations?: Organization | null;
}

export interface StateRules {
  expiration_months: number;
  renewal_processing_days: number;
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

export interface GunLicence {
  id: string;
  legacy_licence_id: string | null;
  user_id: string;
  state_id: string | null;
  jurisdiction_id: string;
  record_type_id: string;
  issued_at: string | null;
  last_renewed_at: string;
  licence_number: string | null;
  notes: string | null;
  photo_url: string | null;
  birth_month: number | null;
  birth_day: number | null;
  manually_marked_expired: boolean;
  created_at: string;
  updated_at: string;
  jurisdictions?: Jurisdiction | null;
  states?: State | null;
  record_types?: RecordType | null;
}

export interface GunLicenceWithStatus extends GunLicence {
  status: LicenceStatus;
  expiresAt: Date;
  startRenewalBy: Date;
  daysUntilRenewalWindow: number;
  daysUntilExpiry: number;
  rules: StateRules;
  photo_signed_url?: string | null;
}

export interface GunCourse {
  id: string;
  user_id: string;
  organization_id: string;
  record_type_id: string;
  completed_at: string;
  renewed_at: string | null;
  certificate_url: string | null;
  notes: string | null;
  manually_marked_expired: boolean;
  created_at: string;
  updated_at: string;
  organizations?: Organization | null;
  record_types?: RecordType | null;
}

export interface GunCourseWithStatus extends GunCourse {
  status: LicenceStatus;
  expiresAt: Date | null;
  startRenewalBy: Date | null;
  daysUntilRenewalWindow: number | null;
  daysUntilExpiry: number | null;
  certificate_signed_url?: string | null;
}
