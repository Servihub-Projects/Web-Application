"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function WaitlistInline() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      toast.success("You're on the list! We'll be in touch before launch.");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <section className="py-14 md:py-16 bg-orange-50 border-y border-orange-100">
      <div className="container mx-auto px-4 text-center max-w-xl">
        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-3">
          Early Access
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Be first in your city when we launch
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Lagos · Abuja · Port Harcourt · Enugu — launching soon. Join the waitlist
          and get priority access plus launch perks.
        </p>

        {status === "success" ? (
          <div className="inline-flex items-center gap-2 text-green-700 font-semibold text-sm bg-green-50 border border-green-200 px-5 py-3 rounded-xl">
            ✓ You&apos;re on the list — we&apos;ll reach out before launch.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 rounded-xl border border-orange-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === "loading" ? (
                "Joining…"
              ) : (
                <>
                  Get Early Access <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-xs text-slate-400 mt-4">
          No spam. Just the launch announcement and priority onboarding details.
        </p>
      </div>
    </section>
  );
}
