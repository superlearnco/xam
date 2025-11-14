import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface SidebarLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  sidebarPosition?: "left" | "right";
  sidebarWidth?: "sm" | "md" | "lg";
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
}

const sidebarWidthClasses = {
  sm: "w-64",
  md: "w-80",
  lg: "w-96",
};

export function SidebarLayout({
  sidebar,
  children,
  sidebarPosition = "left",
  sidebarWidth = "md",
  className,
  sidebarClassName,
  contentClassName,
}: SidebarLayoutProps) {
  return (
    <div className={cn("flex h-full gap-6", className)}>
      {sidebarPosition === "left" && (
        <aside
          className={cn(
            "shrink-0 border-r bg-muted/20",
            sidebarWidthClasses[sidebarWidth],
            sidebarClassName
          )}
        >
          {sidebar}
        </aside>
      )}
      <main className={cn("flex-1 min-w-0", contentClassName)}>{children}</main>
      {sidebarPosition === "right" && (
        <aside
          className={cn(
            "shrink-0 border-l bg-muted/20",
            sidebarWidthClasses[sidebarWidth],
            sidebarClassName
          )}
        >
          {sidebar}
        </aside>
      )}
    </div>
  );
}
