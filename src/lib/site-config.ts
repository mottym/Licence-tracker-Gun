export const siteConfig = {
  name: "RenewMe",
  shortName: "RenewMe",
  tagline: "Never miss a gun license renewal again",
  description:
    "RenewMe helps firearm owners track license renewals across all US states. Get email and push reminders before expiry, manage gun courses, and stay compliant.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://renewmeapp.com",
  keywords: [
    "gun license tracker",
    "firearm license renewal",
    "gun permit renewal reminder",
    "concealed carry license tracker",
    "CCW renewal",
    "gun license expiry",
    "firearm permit management",
    "state gun license renewal",
    "renew gun license",
    "RenewMe",
  ],
  author: "RenewMe",
  locale: "en_US",
} as const;
