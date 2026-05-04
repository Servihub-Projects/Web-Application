import { ArrowRight, Briefcase, DollarSign } from "lucide-react";
import ProtectedNavButton from "../components/protected-nav-button";

export default function ProviderCTA() {
  return (
    <section className="bg-slate-900 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 md:gap-0 md:divide-x md:divide-slate-700/60">

          {/* ── Hiring side ───────────────────── */}
          <div className="md:pr-14">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
              <Briefcase size={22} className="text-orange-500" />
            </div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">
              Hiring?
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
              Find the right professional, first time
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Browse verified providers, compare profiles, and book with escrow
              protection. Your money doesn&apos;t move until you&apos;re satisfied.
            </p>
            <ProtectedNavButton
              destination="/dashboard/discover"
              fallback="/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors"
            >
              Find a Provider <ArrowRight size={15} />
            </ProtectedNavButton>
          </div>

          {/* ── Provider side ─────────────────── */}
          <div className="md:pl-14">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <DollarSign size={22} className="text-green-400" />
            </div>
            <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-2">
              Skilled professional?
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
              Earn more with a platform that protects you
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Set your own rates. Get paid securely via escrow. Build your
              reputation with verified reviews. No cold calling — clients come to
              you.
            </p>
            <ProtectedNavButton
              destination="/dashboard"
              fallback="/register"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-green-500/60 text-green-400 hover:bg-green-500 hover:text-white hover:border-green-500 font-semibold text-sm transition-colors"
            >
              Join as Provider <ArrowRight size={15} />
            </ProtectedNavButton>
          </div>

        </div>
      </div>
    </section>
  );
}
