"use client";

import { MapPin, ArrowRight, Zap, Wrench, Hammer, Paintbrush, Layers, Sofa, Star, BadgeCheck } from "lucide-react";
import ProtectedNavButton from "../components/protected-nav-button";

const CATEGORIES = [
  { label: "Electrical", icon: Zap, href: "/dashboard/discover?category=Electrical" },
  { label: "Plumbing", icon: Wrench, href: "/dashboard/discover?category=Plumbing" },
  { label: "Carpentry", icon: Hammer, href: "/dashboard/discover?category=Carpentry" },
  { label: "Painting", icon: Paintbrush, href: "/dashboard/discover?category=Painting" },
  { label: "Masonry", icon: Layers, href: "/dashboard/discover?category=Masonry" },
  { label: "Interior Design", icon: Sofa, href: "/dashboard/discover?category=Interior+Design" },
];

export default function HeroSection() {
  return (
    <section className="bg-white overflow-hidden border-b border-slate-100">
      <div className="container mx-auto px-4 py-14 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* ── Left column ─────────────────────────────────── */}
          <div>
            {/* Location badge */}
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-3 py-1.5 text-xs font-medium mb-6">
              <MapPin size={12} />
              Now active in Lagos · Abuja · Port Harcourt
            </div>

            {/* H1 */}
            <h1 className="text-[2rem] md:text-[2.75rem] font-bold text-slate-900 leading-tight mb-4">
              Find trusted{" "}
              <span className="text-orange-500">tradespeople</span>
              <br className="hidden sm:block" />
              {" "}in your city
            </h1>

            {/* Subtext */}
            <p className="text-base md:text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
              Book verified electricians, plumbers, carpenters, and more.
              Every job protected by escrow — you pay only when you&apos;re satisfied.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <ProtectedNavButton
                destination="/dashboard/discover"
                fallback="/login"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                Find a Provider <ArrowRight size={16} />
              </ProtectedNavButton>
              <ProtectedNavButton
                destination="/dashboard"
                fallback="/register"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 text-slate-700 hover:border-orange-300 hover:text-orange-600 font-semibold text-sm transition-colors"
              >
                Are you a provider? Join here
              </ProtectedNavButton>
            </div>

            {/* Category chips */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Popular trades
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <ProtectedNavButton
                    key={cat.label}
                    destination={cat.href}
                    fallback="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    <cat.icon size={12} />
                    {cat.label}
                  </ProtectedNavButton>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column — provider card visual ─────────── */}
          <div className="hidden md:flex justify-center lg:justify-end">
            <ProviderCardVisual />
          </div>

        </div>
      </div>
    </section>
  );
}

function ProviderCardVisual() {
  return (
    <div className="relative w-full max-w-[340px]">
      {/* Stacked shadow cards */}
      <div className="absolute top-6 left-6 right-0 bottom-0 bg-orange-50 border border-orange-100 rounded-2xl" />
      <div className="absolute top-3 left-3 right-0 bottom-0 bg-slate-50 border border-slate-100 rounded-2xl" />

      {/* Main card */}
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-400">Top rated in Lagos</span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Available now
          </span>
        </div>

        {/* Provider identity */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            VA
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="font-bold text-slate-900 text-sm">Victor Adeyemi</p>
              <BadgeCheck size={14} className="text-blue-500" />
            </div>
            <p className="text-xs text-slate-500">Master Electrician · NERC Certified</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="text-orange-400 fill-orange-400" />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-700">4.92</span>
          <span className="text-xs text-slate-400">· 94 reviews</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-base font-bold text-orange-600">₦9,000</p>
            <p className="text-[10px] text-slate-500">per hour</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-base font-bold text-slate-800">38</p>
            <p className="text-[10px] text-slate-500">jobs done</p>
          </div>
        </div>

        {/* Skills */}
        <div className="flex gap-2 mb-4">
          {["Wiring", "Solar", "CCTV"].map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {s}
            </span>
          ))}
        </div>

        {/* CTA */}
        <ProtectedNavButton
          destination="/dashboard/discover"
          fallback="/login"
          className="block w-full text-center py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
        >
          Book Victor →
        </ProtectedNavButton>
      </div>

      {/* Floating escrow badge */}
      <div className="absolute -bottom-5 -left-5 bg-white border border-slate-100 shadow-lg rounded-xl px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          ME
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800">Job completed ✓</p>
          <p className="text-[10px] text-slate-400">Escrow released · just now</p>
        </div>
      </div>
    </div>
  );
}
