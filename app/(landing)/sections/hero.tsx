"use client"

import { Globe } from "lucide-react";




export default function HeroSection() {
  return (
    <section className="bg-linear-to-b from-orange-50  to-blue-50">
      <div className="container px-4 mx-auto py-16 flex gap-12">
        <div className="md:flex-1">
          <p className="flex items-center gap-2 py-2 px-3 md:py-3 md:px-4 bg-white text-orange-500 outline-1 outline-orange-200 w-fit rounded-2xl mb-6 shadow-lg text-xs md:text-sm"> <span><Globe /></span> Trusted by 100+ customers worldwide</p>
          <h1 className="text-5xl md:text-8xl text-slate-800 mb-6 font-500">Your Global Marketplace for <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-500 to-orange-700">Professional</span> <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-700 to-blue-900 ">Services</span> </h1>
          <p className="text-lg md:text-xl text-slate-500"> Connect with verified local professionals worldwide. From home repairs to business solutions - book, track, and pay securely in one seamless platform.</p>
        </div>
        <div className="hidden flex-1 md:flex justify-center items-center">
          <div className="w-150 h-150 rounded-lg bg-white p-1">
            {/*<Image src="/hero-image.png" alt="Hero Image" width={500} height={500} />*/}
          </div>
        </div>
      </div>
    </section>
  );
}
