"use client"

import { FeatureCardType } from "@/src/types/landing-page-features-card"
import clsx from "clsx"

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

  return <div className="relative p-8 rounded-2xl border border-gray-200 transition-all duration-200 before:-z-10 hover:border-orange-200 hover:shadow-xl before:content-[''] before:absolute before:-top-40 before:-right-40
  before:w-60 before:h-60 before:rounded-full before:bg-orange-50/50 before:transition-transform before:duration-300
    hover:before:scale-150 overflow-clip">


    <div className={clsx("p-4 rounded-xl text-3xl text-slate-900 mb-6 w-fit", styles.bg)}>
      <Icon size={36} className={clsx(styles.text)} />
    </div>
    <h3 className="text-3xl text-slate-900 mb-4">{title}</h3>
    <p className="text-lg text-slate-500 ">{description}</p>
  </div >
}
