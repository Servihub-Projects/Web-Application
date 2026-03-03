"use client"

import { FeatureCardType } from "@/src/types/landing-page-features-card"
import clsx from "clsx"
import { LucideIcon } from "lucide-react"

const featureCardIconStyles: Record<FeatureCardType["iconColor"], { bg: string; text: string }> = {
  orange: { bg: "bg-orange-50", text: "text-orange-500" },
  green: { bg: "bg-green-50", text: "text-green-500" },
  blue: { bg: "bg-blue-50", text: "text-blue-500" },
  pink: { bg: "bg-pink-50", text: "text-pink-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-500" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-500" },
};
export default function FeaturesCard({ icon: Icon, iconColor, title, description }: FeatureCardType) {
  const styles = featureCardIconStyles[iconColor];

  return <div className="p-8 rounded-2xl border-1 border-gray-200 transition-colors duration-200 hover:border-orange-200 hover:shadow-xl">
    <div className={clsx("p-4 rounded-xl text-3xl text-slate-900 mb-6 w-fit", styles.bg)}>
      <Icon size={36} className={clsx(styles.text)} />
    </div>
    <h3 className="text-3xl text-slate-900 mb-4">{title}</h3>
    <p className="text-lg text-slate-500 ">{description}</p>
  </div>
}
