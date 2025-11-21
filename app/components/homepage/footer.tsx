import { Link } from "react-router";
import { Logo } from "~/components/logo";

const quickLinks = [
  { label: "Home", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "Sign In", href: "/sign-in" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const supportLinks = [
  { label: "Status", href: "https://superlearn.openstatus.dev", external: true },
];

export default function FooterSection() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="space-y-6">
            <Link
              to="/"
              className="flex items-center gap-2"
              aria-label="XAM home"
            >
              <Logo className="h-6 w-auto" uniColor />
              <span className="text-muted-foreground text-sm">by</span>
              <img
                src="/Superlearn.png"
                alt="Superlearn"
                className="h-5 w-auto opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              />
            </Link>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              Create better assessments for your students. Design engaging
              exams, quizzes, and assignments with AI assistance. Built for
              teachers by Superlearn.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
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

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
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

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Support
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className="transition-colors hover:text-foreground"
                      prefetch="viewport"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} Superlearn. All rights reserved.
          </span>
          <span className="text-muted-foreground">
            Empowering teachers everywhere.
          </span>
        </div>
      </div>
    </footer>
  );
}
