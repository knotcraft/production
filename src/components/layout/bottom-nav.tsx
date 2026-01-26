
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Timeline", icon: "calendar_month" },
  { href: "/tasks", label: "Tasks", icon: "checklist" },
  { href: "/guests", label: "Guests", icon: "group" },
  { href: "/budget", label: "Budget", icon: "account_balance_wallet" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md bg-white/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pt-2">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 transition-colors duration-200",
                isActive ? "text-primary" : "text-slate-400 hover:text-primary/80"
              )}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
              >
                {item.icon}
              </span>
              <span className={cn(
                "text-[10px] uppercase tracking-tighter",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

    