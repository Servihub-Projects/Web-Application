import Link from "next/link";
import { Star, MapPin, ArrowRight, BadgeCheck } from "lucide-react";
import SectionHeader, { SectionTag, Title, SubTitle } from "../components/section-header";

const PROVIDERS = [
  {
    initials: "VA",
    name: "Victor Adeyemi",
    trade: "Master Electrician",
    specialty: "Wiring · Solar · CCTV",
    rating: 4.92,
    reviews: 94,
    location: "Lagos",
    rate: "₦9,000",
    gradient: "from-orange-400 to-orange-600",
  },
  {
    initials: "AS",
    name: "Aisha Sule",
    trade: "Interior Designer",
    specialty: "Space Planning · Lighting · Kitchen",
    rating: 4.88,
    reviews: 49,
    location: "Abuja",
    rate: "₦15,000",
    gradient: "from-purple-400 to-purple-600",
  },
  {
    initials: "EO",
    name: "Emmanuel Okonkwo",
    trade: "Carpenter",
    specialty: "Kitchens · Wardrobes · Furniture",
    rating: 4.85,
    reviews: 67,
    location: "Abuja",
    rate: "₦8,000",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    initials: "TO",
    name: "Taiwo Ogundimu",
    trade: "Painter & Decorator",
    specialty: "Emulsion · Epoxy · Textured Finishes",
    rating: 4.78,
    reviews: 53,
    location: "Lagos",
    rate: "₦6,000",
    gradient: "from-green-400 to-green-600",
  },
];

export default function FeaturedProviders() {
  return (
    <section id="providers" className="py-14 md:py-20 bg-white">
      <SectionHeader>
        <SectionTag color="orange" text="TOP PROVIDERS" />
        <Title text="Meet some of our best" />
        <SubTitle text="Verified professionals with proven track records and real customer reviews from across Nigeria" />
      </SectionHeader>

      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {PROVIDERS.map((p) => (
            <div
              key={p.name}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-orange-100 transition-all duration-200"
            >
              {/* Avatar + name */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {p.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                    <BadgeCheck size={13} className="text-blue-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500">{p.trade}</p>
                </div>
              </div>

              {/* Specialty */}
              <p className="text-xs text-slate-400 mb-3 truncate">{p.specialty}</p>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-3">
                <Star size={12} className="text-orange-400 fill-orange-400" />
                <span className="text-sm font-semibold text-slate-700">{p.rating}</span>
                <span className="text-xs text-slate-400">({p.reviews})</span>
              </div>

              {/* Location + rate */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={11} />
                  {p.location}
                </div>
                <span className="text-sm font-bold text-orange-600">
                  {p.rate}
                  <span className="font-normal text-slate-400 text-xs">/hr</span>
                </span>
              </div>

              {/* CTA */}
              <Link
                href="/dashboard/discover"
                className="block w-full text-center py-2 rounded-xl border border-orange-200 text-orange-600 text-xs font-semibold hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/dashboard/discover"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            Browse all providers <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
