import Link from "next/link";
import { Bell, MapPin, ShieldCheck, Target } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const highlights = [
  {
    icon: Target,
    title: "Track every licence",
    description: "Gun permits, courses, and custom credentials in one place.",
  },
  {
    icon: MapPin,
    title: "All 50 states",
    description: "State-specific renewal windows and expiry rules built in.",
  },
  {
    icon: Bell,
    title: "Smart reminders",
    description: "Email and browser push alerts before deadlines hit.",
  },
  {
    icon: ShieldCheck,
    title: "Stay compliant",
    description: "Know exactly when to renew — no surprises, no lapses.",
  },
];

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-slate-900 px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-12">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-700/40 via-transparent to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-slate-800/50 blur-3xl"
          aria-hidden
        />

        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-900">
            RM
          </span>
          <span className="text-lg font-semibold tracking-tight">{siteConfig.name}</span>
        </Link>

        <div className="relative my-10 max-w-md lg:my-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            {siteConfig.description}
          </p>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-4 w-4 text-slate-200" />
                </span>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-slate-500">
          Trusted by responsible firearm owners nationwide.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg ring-1 ring-slate-900/5 sm:p-8">
            <div className="mb-6 hidden lg:block">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
