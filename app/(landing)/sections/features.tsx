"use client"

import { Clock, CreditCard, MessageSquare, Shield, Star, Tag } from "lucide-react";
import FeaturesCard from "../components/features-card";
import SectionHeader, { SectionTag, SubTitle, Title } from "../components/section-header";
import { FeatureCardType } from "@/src/types/landing-page-features-card";
const FeaturesData: FeatureCardType[] = [
  {
    icon: Shield,
    iconColor: "orange",
    title: "Verified Professional",
    description: "Rigorous vetting process with international background checks, license verification, and insurance validation for complete peace of mind.",
  },
  {
    icon: Clock,
    iconColor: "blue",
    title: "Instant Booking",
    description: "Real-time availability across time zones. Book services in seconds with instant confirmation and automated scheduling.",
  },
  {
    icon: CreditCard,
    iconColor: "green",
    title: "Secure Global Payments",
    description: "Multi-currency support with bank-level encryption. Funds held in escrow with buyer protection guarantee.",
  },
  {
    icon: Star,
    iconColor: "yellow",
    title: "Quality Assurance",
    description: "Comprehensive review system with verified ratings.Our satisfaction guarantee and dispute resolution protect every transaction.",
  },
  {
    icon: MessageSquare,
    iconColor: "pink",
    title: "Real-Time Communication",
    description: "Built-in chat with translation support. Share files, photos, and collaborate seamlessly with providers worldwide.",
  },
  {
    icon: Tag,
    iconColor: "purple",
    title: "Global-Local Service",
    description: "International platform connecting you with trusted local professionals. Support local businesses with global standards.",
  },
]
export default function Features() {
  return (
    <section>
      <SectionHeader>
        <SectionTag color="orange" text="WHY CHOOSE SERVIHUB" />
        <Title text="World-Class Service Platform" />
        <SubTitle text="Built for the global market with enterprise-grade security, compliance, and customer support that never sleeps" />
      </SectionHeader>
      <div className="grid grid-cols-3 gap-8 container mx-auto">
        {FeaturesData.map((data, index) => (
          <FeaturesCard key={index} {...data} />
        ))}
      </div>
    </section>
  );
}
