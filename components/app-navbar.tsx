"use client";

import { Bell, Coins, User, Settings, LogOut, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export function AppNavbar() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUserQuery);
  const creditBalance = useQuery(api.users.getCreditBalance);

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = () => {
    if (!currentUser?.name) return "U";
    return currentUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCreditDisplay = () => {
    if (!creditBalance) return "...";
    return creditBalance.totalCredits;
  };

  const isLowCredits = creditBalance && creditBalance.totalCredits < 50;

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/app" className="flex items-center gap-3">
            <Image
              src="/images/xam-favicon.png"
              alt="Xam"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold">Xam</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/app"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              My Tests
            </Link>
            <button
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-not-allowed"
              disabled
            >
              Analytics
            </button>
            <button
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-not-allowed"
              disabled
            >
              Resources
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/app/billing">
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                isLowCredits
                  ? "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <Coins
                className={`w-4 h-4 ${isLowCredits ? "text-amber-600 dark:text-amber-400" : ""}`}
              />
              <span className="text-sm font-medium">{getCreditDisplay()}</span>
              <span className="text-xs text-muted-foreground">credits</span>
              {isLowCredits && (
                <Badge
                  variant="secondary"
                  className="ml-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                >
                  Low
                </Badge>
              )}
            </div>
          </Link>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                  />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">
                  {currentUser?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentUser?.email || ""}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/app/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/app/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/app/billing")}>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
