import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Gun Licence Renewal Tracker`,
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: `${siteConfig.name} — Gun Licence Renewal Tracker`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
};

export default function Home() {
  return <LandingPage />;
}
