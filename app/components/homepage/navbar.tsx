"use client";

import { useCallback, useEffect, useState } from "react";
import { UserButton } from "@clerk/react-router";
import { Link } from "react-router";
import { Menu, X, ArrowUpRight } from "lucide-react";

import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
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
        "fixed inset-x-0 top-0 z-40 border-b transition-all duration-300",
        isScrolled 
          ? "border-border/60 bg-background/95 backdrop-blur-xl shadow-sm" 
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          aria-label="Go to homepage"
          prefetch="viewport"
        >
          <div className="relative">
            <Logo className="h-7 w-auto transition-transform group-hover:scale-105" uniColor />
          </div>
          <span className="text-muted-foreground text-xs font-medium hidden sm:inline">by</span>
          <img 
            src="/Superlearn.png" 
            alt="Superlearn" 
            className="h-5 w-auto opacity-70 group-hover:opacity-100 transition-opacity hidden sm:block" 
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ label, href }) => {
            const isExternal = !href.startsWith("#");
            return isExternal ? (
              <Link
                key={href}
                to={href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-all hover:text-foreground hover:bg-muted/50"
                prefetch="viewport"
              >
                {label}
              </Link>
            ) : (
              <button
                key={href}
                onClick={() => handleNavClick(href)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-all hover:text-foreground hover:bg-muted/50"
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="text-muted-foreground hover:text-foreground"
            >
              <Link to={secondaryCta.href} prefetch="viewport">
                {secondaryCta.label}
              </Link>
            </Button>
            <Button 
              size="sm" 
              asChild 
              className="rounded-full px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25 border-0"
            >
              <Link
                to={primaryCta.href}
                prefetch="viewport"
                className="gap-1.5 font-medium"
              >
                {primaryCta.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            {isSignedIn && (
              <div className="ml-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors md:hidden"
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
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMenuOpen
            ? "max-h-[500px] border-b border-border bg-background/98 backdrop-blur-xl"
            : "max-h-0 border-transparent"
        )}
      >
        <div className="space-y-4 px-4 py-6">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, href }) => {
              const isExternal = !href.startsWith("#");
              return isExternal ? (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  prefetch="viewport"
                >
                  {label}
                </Link>
              ) : (
                <button
                  key={href}
                  onClick={() => handleNavClick(href)}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              asChild 
              className="w-full justify-center"
            >
              <Link to={secondaryCta.href} prefetch="viewport">
                {secondaryCta.label}
              </Link>
            </Button>
            <Button 
              asChild 
              className="w-full justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25"
            >
              <Link
                to={primaryCta.href}
                prefetch="viewport"
                className="gap-1.5 font-medium"
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
