export const LICENCE_TYPES = [
  { value: "drivers_licence", label: "Driver's licence" },
  { value: "gun_licence", label: "Gun licence" },
  { value: "gun_course", label: "Gun course" },
  { value: "other", label: "Other" },
] as const;

export type LicenceType = (typeof LICENCE_TYPES)[number]["value"];

export function isGunRelatedType(value: string | null | undefined): boolean {
  return value === "gun_licence" || value === "gun_course";
}
