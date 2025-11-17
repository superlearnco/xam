"use client";

import { useCallback, useEffect, useState } from "react";
import { UserButton } from "@clerk/react-router";
import { Link } from "react-router";
import { Github, Menu, X, ArrowUpRight } from "lucide-react";

import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "Team", href: "#team" },
  { label: "Pricing", href: "#pricing" },
];

type NavbarProps = {
  loaderData?: {
    isSignedIn: boolean;
  };
};

export const Navbar = ({ loaderData }: NavbarProps) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback((href: string) => {
    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setMenuOpen(false);
  }, []);

  const isSignedIn = Boolean(loaderData?.isSignedIn);

  const primaryCta = isSignedIn
    ? { label: "Dashboard", href: "/dashboard" }
    : { label: "Get Started", href: "/sign-up" };

  const secondaryCta = isSignedIn
    ? { label: "Pricing", href: "/pricing" }
    : { label: "Sign In", href: "/sign-in" };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b border-transparent transition-colors",
        isScrolled && "border-border bg-background/95 backdrop-blur"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-3 font-semibold"
          aria-label="Go to homepage"
          prefetch="viewport"
        >
          <Logo className="h-5 w-auto" uniColor />
          <span className="text-sm tracking-tight text-muted-foreground">
            XAM by Superlearn
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => handleNavClick(href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="hidden md:inline-flex"
          >
            <Link
              to="https://github.com/superlearn/xam"
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub"
            >
              <Github className="h-4 w-4" />
            </Link>
          </Button>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" size="sm" asChild>
              <Link to={secondaryCta.href} prefetch="viewport">
                {secondaryCta.label}
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link
                to={primaryCta.href}
                prefetch="viewport"
                className="gap-1.5"
              >
                {primaryCta.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            {isSignedIn && <UserButton afterSignOutUrl="/" />}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden",
          isMenuOpen
            ? "max-h-[420px] border-t border-border"
            : "max-h-0 overflow-hidden border-t border-transparent",
          "transition-all duration-200 ease-out bg-background"
        )}
      >
        <div className="space-y-4 px-4 py-6">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => handleNavClick(href)}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <Button variant="outline" asChild>
              <Link to={secondaryCta.href} prefetch="viewport">
                {secondaryCta.label}
              </Link>
            </Button>
            <Button asChild>
              <Link
                to={primaryCta.href}
                prefetch="viewport"
                className="gap-1.5"
              >
                {primaryCta.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            {isSignedIn && (
              <div className="flex items-center justify-center rounded-md border p-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
          </div>

          <Button variant="ghost" className="w-full gap-2" asChild>
            <Link
              to="https://github.com/superlearn/xam"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
