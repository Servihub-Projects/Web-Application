"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);

  const navRoutes: { routeName: string; routeLink: string }[] = [
    { routeName: "Home", routeLink: "/" },
    { routeName: "Features", routeLink: "/#features" },
    { routeName: "Services", routeLink: "/#services" },
    { routeName: "How it works", routeLink: "/#how-it-works" },
    { routeName: "Testimonials", routeLink: "/#testimonials" },
    { routeName: "FAQ", routeLink: "/#faq" },
  ];

  return (
    <nav className="border-b border-b-gray-100 sticky top-0 z-50 bg-white">
      <div className="mx-auto container flex justify-between items-center px-4 py-4 md:py-5">
        <Link href="/"><Image className="w-16" src={"/logo.png"} alt="logo" width={192} height={192}>

        </Image></Link>
        <ul className="md:flex justify-between list-none hidden">
          {navRoutes.map((route, index) => (
            <li key={index}>
              <Link className="transistion-colors duration-200 hover:text-orange-600 px-4 py-2" href={route.routeLink}>{route.routeName}</Link>
            </li>
          ))}
        </ul>
        <div className="md:flex hidden items-center gap-4 text-sm">
          <Link href="/login" className="transition-colors duration-200 hover:text-orange-600 hover:border-orange-600 px-3 py-1.5 border border-gray-300 rounded-lg">
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg inline-block text-white bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-[length:200%_100%] bg-left hover:bg-right transition-all duration-500"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:ring-offset-1"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav panel */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <ul className="flex flex-col gap-2 list-none">
              {navRoutes.map((route, index) => (
                <li key={index}>
                  <Link
                    href={route.routeLink}
                    className="block px-2 py-2 text-sm transition-colors duration-200 hover:text-orange-600"
                    onClick={() => setIsOpen(false)}
                  >
                    {route.routeName}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 text-sm">
              <Link
                href="/login"
                className="text-center px-3 py-2 transition-colors duration-200 hover:text-orange-600 hover:border-orange-600 border border-gray-300 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-center px-4 py-2 rounded-lg inline-block text-white bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-[length:200%_100%] bg-left hover:bg-right transition-all duration-500"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
