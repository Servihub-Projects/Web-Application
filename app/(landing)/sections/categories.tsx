import Link from "next/link";
import { Zap, Droplets, Hammer, Paintbrush, Layers, Sofa, LayoutGrid, Sparkles } from "lucide-react";
import SectionHeader, { SectionTag, Title, SubTitle } from "../components/section-header";

const CATEGORIES = [
  { name: "Electrical",       icon: Zap,        bg: "bg-yellow-50 text-yellow-600",   href: "/dashboard/discover?category=Electrical" },
  { name: "Plumbing",         icon: Droplets,   bg: "bg-blue-50 text-blue-600",       href: "/dashboard/discover?category=Plumbing" },
  { name: "Carpentry",        icon: Hammer,     bg: "bg-amber-50 text-amber-700",     href: "/dashboard/discover?category=Carpentry" },
  { name: "Painting",         icon: Paintbrush, bg: "bg-pink-50 text-pink-600",       href: "/dashboard/discover?category=Painting" },
  { name: "Masonry",          icon: Layers,     bg: "bg-slate-100 text-slate-700",    href: "/dashboard/discover?category=Masonry" },
  { name: "Interior Design",  icon: Sofa,       bg: "bg-purple-50 text-purple-600",   href: "/dashboard/discover?category=Interior+Design" },
  { name: "Tiling",           icon: LayoutGrid, bg: "bg-teal-50 text-teal-600",       href: "/dashboard/discover?category=Tiling" },
  { name: "Cleaning",         icon: Sparkles,   bg: "bg-green-50 text-green-600",     href: "/dashboard/discover?category=Cleaning" },
];

export default function Categories() {
  return (
    <section id="services" className="py-14 md:py-20 bg-slate-50">
      <SectionHeader>
        <SectionTag color="orange" text="BROWSE BY TRADE" />
        <Title text="What do you need done?" />
        <SubTitle text="Find skilled professionals across all trades. Click a category to see available providers in your city." />
      </SectionHeader>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border border-transparent hover:border-orange-200 hover:shadow-sm hover:bg-white transition-all duration-200 ${cat.bg}`}
            >
              <cat.icon size={26} />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
