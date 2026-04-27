import { Shield, BadgeCheck, MessageSquare } from "lucide-react";
import SectionHeader, { SectionTag, Title, SubTitle } from "../components/section-header";

const WHY = [
  {
    icon: Shield,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    title: "Escrow protection on every job",
    description:
      "Your money is held by ServiHub until the work is done to your satisfaction. No completion — no payment. It's that simple.",
  },
  {
    icon: BadgeCheck,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    title: "Background-checked professionals",
    description:
      "Every provider is vetted — credentials confirmed, trade licences checked, and reviewed by real customers before going live.",
  },
  {
    icon: MessageSquare,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    title: "Coordinate everything in-app",
    description:
      "Message, share photos, and confirm job details — all inside ServiHub. No need to share private phone numbers with strangers.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-14 md:py-20 bg-slate-50">
      <SectionHeader>
        <SectionTag color="orange" text="WHY SERVIHUB" />
        <Title text="Built around your protection" />
        <SubTitle text="Three things that separate ServiHub from WhatsApp referrals and random marketplace listings" />
      </SectionHeader>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-5">
          {WHY.map((item) => (
            <div
              key={item.title}
              className="bg-white p-7 rounded-2xl border border-slate-100 hover:border-orange-100 hover:shadow-sm transition-all duration-200"
            >
              <div
                className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center mb-5`}
              >
                <item.icon size={22} className={item.iconColor} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
