import { Star } from "lucide-react";
import SectionHeader, { SectionTag, Title, SubTitle } from "../components/section-header";

const TESTIMONIALS = [
  {
    initials: "ME",
    name: "Mubarak Eze",
    location: "Victoria Island, Lagos",
    service: "Electrical Rewiring",
    quote:
      "Victor and his team rewired my entire 4-bedroom duplex in 7 days. Every socket, every light point — done cleanly with a NERC certificate on completion. I paid nothing until I was satisfied. Outstanding.",
    rating: 5,
    gradient: "from-orange-400 to-orange-600",
  },
  {
    initials: "CO",
    name: "Chukwuma Obi",
    location: "GRA, Enugu",
    service: "Perimeter Fence Construction",
    quote:
      "Emeka built an 80-metre fence around my hotel annex in 10 days. Gate pillars perfectly aligned, plastering was clean. The escrow system meant I had zero risk from the first day on site.",
    rating: 5,
    gradient: "from-slate-500 to-slate-700",
  },
  {
    initials: "IB",
    name: "Ibiso Bankole",
    location: "Ikeja, Lagos",
    service: "Custom Kitchen Cabinets",
    quote:
      "Emmanuel built 22 kitchen units for our showroom to exact specification. I paid into escrow and didn't release a kobo until I was fully satisfied. That's exactly how a platform should work.",
    rating: 5,
    gradient: "from-blue-400 to-blue-600",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-14 md:py-20 bg-white">
      <SectionHeader>
        <SectionTag color="orange" text="CUSTOMER REVIEWS" />
        <Title text="Real jobs. Real results." />
        <SubTitle text="What clients say after using ServiHub to find and hire verified professionals across Nigeria" />
      </SectionHeader>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col hover:shadow-sm transition-shadow duration-200"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="text-orange-400 fill-orange-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-400">
                    {t.location} · {t.service}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
