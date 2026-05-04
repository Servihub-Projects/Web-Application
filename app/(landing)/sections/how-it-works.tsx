import { Search, ShieldCheck, ThumbsUp } from "lucide-react";
import SectionHeader, { SectionTag, Title, SubTitle } from "../components/section-header";

const STEPS = [
  {
    icon: Search,
    number: "01",
    title: "Search by trade and city",
    description:
      "Browse verified electricians, plumbers, carpenters, and more in Lagos, Abuja, Port Harcourt, Enugu, and across Nigeria.",
  },
  {
    icon: ShieldCheck,
    number: "02",
    title: "Book and pay into escrow",
    description:
      "Your payment is held securely by ServiHub — not the provider. Funds don't move until you confirm the job is done right.",
  },
  {
    icon: ThumbsUp,
    number: "03",
    title: "Job done — you release payment",
    description:
      "Satisfied? Confirm completion and funds are released to the provider. Not happy? Raise a dispute and our team steps in.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-14 md:py-20 bg-white">
      <SectionHeader>
        <SectionTag color="blue" text="HOW IT WORKS" />
        <Title text="Simple. Secure. Sorted." />
        <SubTitle text="From search to payment in three clear steps. No hidden fees, no guesswork, no risk." />
      </SectionHeader>

      <div className="container mx-auto px-4">
        <div className="relative grid md:grid-cols-3 gap-10 md:gap-8">
          {/*
           * Connector line — passes through the center of each step icon.
           * The icon circle is w-20 h-20 (80px), so its center sits 40px = top-10
           * from the top of the card. left/right = 1/6 of container width
           * positions the line between column-1 center and column-3 center.
           */}
          <div
            className="hidden md:block absolute top-10 h-px bg-orange-100"
            style={{ left: "calc(100% / 6)", right: "calc(100% / 6)" }}
          />

          {STEPS.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              {/* Number + icon circle */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-white border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center mb-6">
                <step.icon size={26} className="text-orange-500" />
                <span className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-widest">
                  {step.number}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
