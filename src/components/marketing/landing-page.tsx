import Link from "next/link";
import {
  Bell,
  Calendar,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { LandingHeader } from "./landing-header";

const features = [
  {
    icon: Target,
    title: "Gun licence tracking",
    description:
      "Add every permit with issue and expiry dates. See renewal windows and status at a glance.",
  },
  {
    icon: MapPin,
    title: "Multi-state support",
    description:
      "Built-in rules for all US states. Renewal timelines adapt to where each licence was issued.",
  },
  {
    icon: Bell,
    title: "Email & push reminders",
    description:
      "Get notified well before deadlines so you always have time to renew on schedule.",
  },
  {
    icon: GraduationCap,
    title: "Gun courses",
    description:
      "Track safety courses and certifications alongside your licences in one dashboard.",
  },
  {
    icon: Calendar,
    title: "Renewal windows",
    description:
      "Know exactly when you can renew — not just when it expires. Plan ahead with confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Stay compliant",
    description:
      "Avoid lapses that could affect your rights. RenewMe keeps you informed and prepared.",
  },
];

const steps = [
  {
    step: "1",
    title: "Create your free account",
    description: "Sign up in seconds with email or Google. No credit card required.",
  },
  {
    step: "2",
    title: "Add your licences",
    description: "Enter your gun permits, courses, and any custom credentials you need to track.",
  },
  {
    step: "3",
    title: "Get reminded on time",
    description: "Receive alerts before renewal windows open and before anything expires.",
  },
];

export function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHeader />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200/60 via-transparent to-transparent"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
                Gun licence renewal tracker for all 50 states
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {siteConfig.tagline}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                {siteConfig.description}
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/signup">Get started free</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Free to use. Email or Google sign-in.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Everything you need to stay current
              </h2>
              <p className="mt-4 text-slate-600">
                One dashboard for all your firearm licences, courses, and renewal deadlines.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 ring-1 ring-slate-900/5 transition-shadow hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Up and running in minutes
              </h2>
              <p className="mt-4 text-slate-600">
                No complicated setup. Add your licences and let RenewMe handle the rest.
              </p>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map((item) => (
                <div key={item.step} className="text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                    {item.step}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-900 py-20 text-white sm:py-24">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to take control of your renewals?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Join RenewMe today and never worry about a missed gun licence renewal again.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-white text-slate-900 hover:bg-slate-100 sm:w-auto"
              >
                <Link href="/signup">Create free account</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-slate-600 text-white hover:bg-slate-800 sm:w-auto"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
              RM
            </span>
            <span className="text-sm font-semibold text-slate-900">{siteConfig.name}</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Track gun licence renewals with confidence.
          </p>
        </div>
      </footer>
    </>
  );
}
