"use client"

import { workflowType } from "@/src/types/landing-page-workflow"
import clsx from "clsx"
const colorVariants = {
  blue: "bg-blue-600",
  orange: "bg-orange-600",
  green: "bg-green-600"
}
export default function Workflow({ number, icon: Icon, iconColor, title, description }: workflowType) {
  return <div className="relative bg-white p-8 rounded-2xl shadow-xl transition-transform duration-200 hover:scale-105">
    <span className="absolute h-12 w-12 bg-blue-600 -top-6 -right-6 rounded-xl text-xl text-white flex justify-center items-center font-semibold">0{number}</span>
    <div className={clsx("p-4 rounded-xl w-fit mb-4", colorVariants[iconColor])}>
      <Icon color="white" size={32} />
    </div>
    <h3 className="text-slate-800 text-3xl mb-4">{title}</h3>
    <p className="text-slate-500 text-lg">{description}</p>
  </div>
}
