const STATS = [
  { value: "1,200+", label: "Verified Providers", sub: "across Nigeria" },
  { value: "8",      label: "Cities Active",       sub: "and expanding" },
  { value: "4.9★",  label: "Average Rating",      sub: "from real customers" },
  { value: "₦0",    label: "Upfront Risk",         sub: "escrow on every job" },
];

export default function StatsBar() {
  return (
    <section className="bg-slate-900 py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white mb-0.5">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-slate-300">{stat.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
