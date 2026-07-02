import type { LicenceStatus, RecordType, State, StateRules } from "@/types/database";

type RenewalRuleSource = {
  expiration_months: number | null;
  renewal_processing_days: number | null;
};

export function resolveRenewalRules(source: RenewalRuleSource): StateRules | null {
  if (
    source.expiration_months != null &&
    source.renewal_processing_days != null
  ) {
    return {
      expiration_months: source.expiration_months,
      renewal_processing_days: source.renewal_processing_days,
    };
  }

  return null;
}

/** @deprecated Use resolveGunLicenceRules — expiry is defined per licence type. */
export function resolveStateRules(state: State): StateRules | null {
  return resolveRenewalRules(state);
}

export function resolveGunLicenceRules(
  recordType: RecordType | null | undefined,
  state: State | null | undefined,
): StateRules | null {
  const fromType = recordType ? resolveRenewalRules(recordType) : null;
  if (fromType) return fromType;
  return state ? resolveRenewalRules(state) : null;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((to.getTime() - from.getTime()) / msPerDay);
}

export function getExpiresAt(lastRenewedAt: Date, rules: StateRules): Date {
  return addMonths(lastRenewedAt, rules.expiration_months);
}

function getBirthdayExpiry(
  lastRenewedAt: Date,
  rules: StateRules,
  birthMonth: number,
  birthDay: number,
): Date {
  const yearsToAdd = Math.max(1, Math.floor(rules.expiration_months / 12));
  let year = lastRenewedAt.getFullYear() + yearsToAdd;
  let candidate = new Date(year, birthMonth - 1, birthDay);
  if (candidate <= lastRenewedAt) {
    year += 1;
    candidate = new Date(year, birthMonth - 1, birthDay);
  }
  return candidate;
}

export function getStartRenewalBy(expiresAt: Date, rules: StateRules): Date {
  const result = new Date(expiresAt);
  result.setDate(result.getDate() - rules.renewal_processing_days);
  return result;
}

type RenewalDateOptions = {
  expiresOnBirthday?: boolean;
  birthMonth?: number | null;
  birthDay?: number | null;
};

function computeExpiry(
  lastRenewedAt: Date,
  rules: StateRules,
  options: RenewalDateOptions,
): Date {
  return options.expiresOnBirthday && options.birthMonth && options.birthDay
    ? getBirthdayExpiry(lastRenewedAt, rules, options.birthMonth, options.birthDay)
    : getExpiresAt(lastRenewedAt, rules);
}

// For auto-renew licences, advance the last-renewed date forward one cycle at a
// time until the resulting expiry is in the future. Returns the effective
// last-renewed date for the current active period.
export function rollForwardLastRenewed(
  lastRenewedAt: Date,
  rules: StateRules,
  options: RenewalDateOptions = {},
  now: Date = new Date(),
): Date {
  let current = new Date(lastRenewedAt);
  for (let i = 0; i < 1200; i += 1) {
    const expiresAt = computeExpiry(current, rules, options);
    if (expiresAt > now) break;
    current = expiresAt;
  }
  return current;
}

export function getLicenceStatus(
  lastRenewedAt: Date,
  rules: StateRules,
  options: {
    manuallyMarkedExpired?: boolean;
    expiresOnBirthday?: boolean;
    birthMonth?: number | null;
    birthDay?: number | null;
  } = {},
  now: Date = new Date(),
): {
  status: LicenceStatus;
  expiresAt: Date;
  startRenewalBy: Date;
  daysUntilRenewalWindow: number;
  daysUntilExpiry: number;
} {
  const expiresAt =
    options.expiresOnBirthday && options.birthMonth && options.birthDay
      ? getBirthdayExpiry(lastRenewedAt, rules, options.birthMonth, options.birthDay)
      : getExpiresAt(lastRenewedAt, rules);
  const startRenewalBy = getStartRenewalBy(expiresAt, rules);
  const daysUntilRenewalWindow = daysBetween(now, startRenewalBy);
  const daysUntilExpiry = daysBetween(now, expiresAt);

  let status: LicenceStatus;

  if (options.manuallyMarkedExpired) {
    status = "expired";
  } else if (now > expiresAt) {
    status = "expired";
  } else if (now >= startRenewalBy) {
    status = "renewal_open";
  } else if (daysUntilRenewalWindow <= 60) {
    status = "renewal_soon";
  } else {
    status = "valid";
  }

  return {
    status,
    expiresAt,
    startRenewalBy,
    daysUntilRenewalWindow,
    daysUntilExpiry,
  };
}

export const DEFAULT_NOTIFY_DAYS = [60, 30, 14, 7, 1];

export function shouldNotifyToday(
  daysUntilRenewalWindow: number,
  notifyDaysBefore: number[],
): string | null {
  const match = notifyDaysBefore.find((days) => days === daysUntilRenewalWindow);
  return match != null ? `${match}_days_before` : null;
}

export function statusLabel(status: LicenceStatus): string {
  switch (status) {
    case "valid":
      return "Valid";
    case "renewal_soon":
      return "Renewal soon";
    case "renewal_open":
      return "Renewal window open";
    case "expired":
      return "Expired";
  }
}

// For auto-renew custom licences, advance the expiry forward by the original
// issued -> expires period until it lands in the future. Without an issue date
// there's no period to derive, so the expiry is returned unchanged.
export function rollForwardCustomExpiry(
  issuedAt: Date | null,
  expiresAt: Date,
  now: Date = new Date(),
): Date {
  if (!issuedAt) return expiresAt;
  const periodMs = expiresAt.getTime() - issuedAt.getTime();
  if (periodMs <= 0) return expiresAt;

  let current = new Date(expiresAt);
  for (let i = 0; i < 1200; i += 1) {
    if (current > now) break;
    current = new Date(current.getTime() + periodMs);
  }
  return current;
}

export function getCustomLicenceStatus(
  expiresAt: Date,
  reminderDays: number,
  options: { manuallyMarkedExpired?: boolean } = {},
  now: Date = new Date(),
): {
  status: LicenceStatus;
  expiresAt: Date;
  daysUntilExpiry: number;
} {
  const daysUntilExpiry = daysBetween(now, expiresAt);

  let status: LicenceStatus;
  if (options.manuallyMarkedExpired || now > expiresAt) {
    status = "expired";
  } else if (daysUntilExpiry <= Math.max(0, reminderDays)) {
    status = "renewal_soon";
  } else {
    status = "valid";
  }

  return { status, expiresAt, daysUntilExpiry };
}

export function statusColor(status: LicenceStatus): string {
  switch (status) {
    case "valid":
      return "bg-emerald-100 text-emerald-800";
    case "renewal_soon":
      return "bg-amber-100 text-amber-800";
    case "renewal_open":
      return "bg-orange-100 text-orange-800";
    case "expired":
      return "bg-red-100 text-red-800";
  }
}
