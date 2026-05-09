"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Providers", href: "/#providers" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
];

export default function NavigationBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm dark:border-[var(--dash-border)] dark:bg-[var(--dash-card)]/95">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt="ServiHub"
            width={64}
            height={64}
            className="w-12 h-auto"
          />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-0.5 list-none">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-[var(--dash-text-muted)] dark:hover:bg-[var(--dash-bg)] dark:hover:text-orange-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-orange-600 dark:text-[var(--dash-text-muted)] dark:hover:text-orange-400"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile toggle — hidden on md+ where inline nav and actions are shown */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden dark:text-[var(--dash-text)] dark:hover:bg-[var(--dash-bg)]"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu — slide down with CSS transition */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-100 bg-white dark:border-[var(--dash-border)] dark:bg-[var(--dash-card)] ${
          open ? "max-h-[min(24rem,70vh)] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="app-scrollbar container mx-auto max-h-[min(24rem,70vh)] overflow-y-auto overscroll-contain px-4 py-3">
          <div className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-[var(--dash-text-muted)] dark:hover:bg-[var(--dash-bg)] dark:hover:text-orange-400"
              >
                {link.label}
              </Link>
            ))}
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 mt-1 dark:border-[var(--dash-border)]">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-center text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors dark:text-[var(--dash-text-muted)]"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block rounded-lg bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
