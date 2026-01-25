"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/guests", icon: Users, label: "Guests" },
  { href: "/budget", icon: Wallet, label: "Budget" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-white/10 bg-white/80 dark:bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-around px-6 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon
                className="h-6 w-6"
                fill={isActive ? "currentColor" : "none"}
              />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
