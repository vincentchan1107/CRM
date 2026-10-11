"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", match: "exact" as const },
  { href: "/admin/board", label: "Kanban", match: "prefix" as const },
  { href: "/admin/cases", label: "列表", match: "prefix" as const },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-lg font-extrabold text-ink">
            見客通
          </Link>
          <nav className="flex items-center gap-1 rounded-full bg-paper p-1">
            {links.map((link) => {
              const active =
                link.match === "exact"
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                    active
                      ? "bg-ink text-white"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Link
          href="/portal"
          className="rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white sm:px-4 sm:text-sm"
        >
          手機 Portal
        </Link>
      </div>
    </header>
  );
}
