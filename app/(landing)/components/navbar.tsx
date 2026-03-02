"use client"
import Link from "next/link";

export default function NavigationBar() {
  const navRoutes: { routeName: string; routeLink: string }[] = [
    { routeName: "Features", routeLink: "" },
    { routeName: "Services", routeLink: "" },
    { routeName: "How it works", routeLink: "" },
    { routeName: "Testimonials", routeLink: "" },
    { routeName: "FAQ", routeLink: "" },

  ];
  return (
    <nav className="border-b-2 border-b-gray-100 sticky top-0">
      <div className="mx-auto container flex justify-between items-center px-4 py-6">
        <Link href="/">Logo</Link>
        <ul className="flex justify-between list-none">
          {navRoutes.map((route, index) => (
            <li key={index}>
              <Link className="transistion-colors duration-200 hover:text-orange-600 px-4 py-2" href={route.routeLink}>{route.routeName}</Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-8 text-sm">
          <Link href={"/signin"}>Sign in</Link>
          <Link
            href="/get-started"
            className="px-4 py-2 rounded-lg inline-block text-white bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-[length:200%_100%] bg-left hover:bg-right transition-all duration-500"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
