"use client"

import { Bell } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function AppNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/app" className="flex items-center gap-3">
            <Image src="/images/xam-favicon.png" alt="Xam" width={32} height={32} className="w-8 h-8" />
            <span className="text-xl font-bold">Xam</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/app" className="text-sm font-medium hover:text-primary transition-colors">
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
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
            <span className="text-sm font-medium">250 / 500</span>
            <span className="text-xs text-muted-foreground">credits</span>
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>TC</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help Center</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
