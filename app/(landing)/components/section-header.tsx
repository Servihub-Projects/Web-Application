"use client"

import clsx from "clsx";

export default function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <header className="text-center py-8 md:py-12 container mx-auto px-4">
      {children}
    </header>
  );
}



const colorVariants = {
  orange: "text-orange-500 bg-orange-100/60",
  blue: "text-blue-500 bg-blue-100/60",
};


export const SectionTag = ({ color, text }: { color: "blue" | "orange", text: string }) => {
  return <p className={clsx("w-fit mx-auto rounded-2xl py-2 px-4 text-xs md:text-sm font-semibold mb-2", colorVariants[color])}>
    {text}
  </p>
}
export const Title = ({ text }: { text: string }) => {
  return <h2 className="font-semibold text-slate-800 text-3xl md:text-6xl mb-4">
    {text}
  </h2>
}

export const SubTitle = ({ text }: { text: string }) => {
  return <p className="text-slate-500 md:text-lg max-w-2xl mx-auto leading-relaxed">
    {text}
  </p>
}
