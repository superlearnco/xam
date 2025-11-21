"use client";

import { useCallback, useEffect, useState } from "react";
import { UserButton } from "@clerk/react-router";
import { Link } from "react-router";
import { Menu, X, ArrowUpRight } from "lucide-react";

import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "#hero" },
  { label: "Features", href: "#features" },
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
    ? { label: "Settings", href: "/dashboard/settings" }
    : { label: "Sign In", href: "/sign-in" };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b border-transparent transition-all duration-200",
        isScrolled 
          ? "border-border/40 bg-background/80 backdrop-blur-md" 
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="Go to homepage"
          prefetch="viewport"
        >
          <Logo className="h-6 w-auto" uniColor />
          <span className="text-muted-foreground text-sm">by</span>
          <img 
            src="/Superlearn.png" 
            alt="Superlearn" 
            className="h-5 w-auto opacity-80 hover:opacity-100 transition-opacity" 
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => handleNavClick(href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link to={secondaryCta.href} prefetch="viewport">
                {secondaryCta.label}
              </Link>
            </Button>
            <Button size="sm" asChild className="rounded-full px-5">
              <Link
                to={primaryCta.href}
                prefetch="viewport"
                className="gap-1.5"
              >
                {primaryCta.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            {isSignedIn && <UserButton afterSignOutUrl="/" />}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden",
          isMenuOpen
            ? "max-h-[420px] border-b border-border"
            : "max-h-0 overflow-hidden border-transparent",
          "transition-all duration-300 ease-in-out bg-background/95 backdrop-blur-md"
        )}
      >
        <div className="space-y-4 px-4 py-6">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => handleNavClick(href)}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex flex-col gap-3 pt-4">
            <Button variant="outline" asChild className="w-full justify-center">
              <Link to={secondaryCta.href} prefetch="viewport">
                {secondaryCta.label}
              </Link>
            </Button>
            <Button asChild className="w-full justify-center rounded-full">
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
              <div className="flex items-center justify-center p-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
