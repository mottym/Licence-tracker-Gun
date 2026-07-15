export const siteConfig = {
  name: "RenewMe",
  shortName: "RenewMe",
  tagline: "Never miss a gun licence renewal again",
  description:
    "RenewMe helps firearm owners track licence renewals across all US states. Get email and push reminders before expiry, manage gun courses, and stay compliant.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://renewmeapp.com",
  keywords: [
    "gun licence tracker",
    "firearm licence renewal",
    "gun permit renewal reminder",
    "concealed carry licence tracker",
    "CCW renewal",
    "gun licence expiry",
    "firearm permit management",
    "state gun licence renewal",
    "renew gun licence",
    "RenewMe",
  ],
  author: "RenewMe",
  locale: "en_US",
} as const;
