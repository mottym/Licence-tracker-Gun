import type { LicenceStatus, State, StateRules } from "@/types/database";

export function resolveStateRules(state: State): StateRules | null {
  if (state.expiration_months != null && state.renewal_processing_days != null) {
    return {
      expiration_months: state.expiration_months,
      renewal_processing_days: state.renewal_processing_days,
    };
  }
  if (state.state_groups) {
    return {
      expiration_months: state.state_groups.expiration_months,
      renewal_processing_days: state.state_groups.renewal_processing_days,
    };
  }
  return null;
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
) {
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

  return { status, expiresAt, startRenewalBy, daysUntilRenewalWindow, daysUntilExpiry };
}

export function statusLabel(status: LicenceStatus): string {
  switch (status) {
    case "valid":
      return "Valid";
    case "renewal_soon":
      return "Renewal soon";
    case "renewal_open":
      return "Renewal open";
    case "expired":
      return "Expired";
  }
}

export type StatusTone = "success" | "warning" | "info" | "error";

export function statusTone(status: LicenceStatus): StatusTone {
  switch (status) {
    case "valid":
      return "success";
    case "renewal_soon":
      return "warning";
    case "renewal_open":
      return "info";
    case "expired":
      return "error";
  }
}

export function statusColors(status: LicenceStatus): {
  background: string;
  text: string;
} {
  switch (status) {
    case "valid":
      return { background: "#d1fae5", text: "#065f46" };
    case "renewal_soon":
      return { background: "#fef3c7", text: "#92400e" };
    case "renewal_open":
      return { background: "#ffedd5", text: "#9a3412" };
    case "expired":
      return { background: "#fee2e2", text: "#991b1b" };
  }
}
