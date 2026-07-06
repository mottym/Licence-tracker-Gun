export type ExpiryMode = "standard" | "birthday" | "never";

export function expiryModeForType(type: {
  requires_renewal: boolean;
  expires_on_birthday: boolean;
}): ExpiryMode {
  if (!type.requires_renewal) return "never";
  if (type.expires_on_birthday) return "birthday";
  return "standard";
}
