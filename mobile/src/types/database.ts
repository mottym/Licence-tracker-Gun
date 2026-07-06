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
  birth_month: number | null;
  birth_day: number | null;
  created_at: string;
  updated_at: string;
}

export interface StateGroup {
  id: string;
  name: string;
  expiration_months: number;
  renewal_processing_days: number;
}

export interface State {
  id: string;
  name: string;
  code: string;
  group_id: string | null;
  expires_on_birthday: boolean;
  expiration_months: number | null;
  renewal_processing_days: number | null;
  state_groups?: StateGroup | null;
}

export interface RecordCategory {
  id: string;
  key: "gun_licence" | "gun_course";
  name: string;
}

export interface Jurisdiction {
  id: string;
  name: string;
  code: string;
  state_id: string | null;
  is_city: boolean;
  states?: State | null;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
}

export interface RecordType {
  id: string;
  category_id: string;
  jurisdiction_id: string | null;
  organization_id: string | null;
  state_id: string | null;
  key: string;
  name: string;
  requires_renewal: boolean;
  expires_on_birthday: boolean;
  expiration_months: number | null;
  renewal_processing_days: number | null;
  is_active: boolean;
  record_categories?: RecordCategory | null;
  jurisdictions?: Jurisdiction | null;
  organizations?: Organization | null;
  states?: State | null;
}

export interface StateRules {
  expiration_months: number;
  renewal_processing_days: number;
}

export interface GunLicence {
  id: string;
  user_id: string;
  state_id: string | null;
  jurisdiction_id: string | null;
  record_type_id: string;
  issued_at: string | null;
  last_renewed_at: string;
  licence_number: string | null;
  notes: string | null;
  photo_url: string | null;
  birth_month: number | null;
  birth_day: number | null;
  auto_renew: boolean;
  manually_marked_expired: boolean;
  jurisdictions?: Jurisdiction | null;
  states?: State | null;
  record_types?: RecordType | null;
}

export interface GunLicenceWithStatus extends GunLicence {
  status: LicenceStatus;
  expiresAt: Date | null;
  startRenewalBy: Date | null;
  daysUntilRenewalWindow: number | null;
  daysUntilExpiry: number | null;
  rules: StateRules | null;
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
