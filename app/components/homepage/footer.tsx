import { Link } from "react-router";
import { Github, Linkedin, Twitter } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Team", href: "#team" },
  { label: "Sign in", href: "/sign-in" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Security", href: "/security" },
];

const socialLinks = [
  {
    label: "GitHub",
    icon: Github,
    href: "https://github.com/michaelshimeles/react-starter-kit",
  },
  {
    label: "LinkedIn",
    icon: Linkedin,
    href: "https://www.linkedin.com",
  },
  {
    label: "X",
    icon: Twitter,
    href: "https://x.com",
  },
];

export default function FooterSection() {
  return (
    <footer className="border-t bg-card/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
              aria-label="XAM home"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background font-bold">
                X
              </span>
              XAM by Superlearn
            </Link>
            <p className="max-w-md text-sm text-muted-foreground">
              AI-native assessment workspace for designing, versioning, and publishing credible assessments with collaborative tooling built for modern learning teams.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={link.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Product
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="transition-colors hover:text-foreground"
                    prefetch="viewport"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Company
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="transition-colors hover:text-foreground"
                    prefetch="viewport"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} XAM Labs, Inc. All rights reserved.
          </span>
          <span className="text-muted-foreground">
            Built with care in distributed teams across the globe.
          </span>
        </div>
      </div>
    </footer>
  );
}
