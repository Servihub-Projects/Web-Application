import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const SOCIALS = [
  { icon: Facebook, label: "Facebook" },
  { icon: Twitter, label: "Twitter" },
  { icon: Instagram, label: "Instagram" },
  { icon: Linkedin, label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="container mx-auto px-4 py-14 md:py-16">

        {/* Main grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-white font-bold text-xl tracking-tight mb-4 block">
              ServiHub
            </Link>
            <p className="text-slate-400 mb-6 max-w-xs text-sm leading-relaxed">
              Nigeria&apos;s trusted marketplace for skilled tradespeople. Find verified
              electricians, plumbers, carpenters, and more across Lagos, Abuja, Port
              Harcourt, and beyond.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">For Customers</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/#services" className="hover:text-orange-400 transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-orange-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-orange-400 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/dashboard/discover" className="hover:text-orange-400 transition-colors">
                  Find Providers
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">For Providers</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/waitlist" className="hover:text-orange-400 transition-colors">
                  Join as Provider
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Provider Benefits
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  How Payments Work
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-orange-400 transition-colors">
                  Provider Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <Link
                  href="mailto:support@servihub.com"
                  className="hover:text-orange-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact info */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="text-orange-500 mt-0.5 shrink-0" size={16} />
              <div>
                <div className="text-white font-medium mb-0.5">Email</div>
                <div>support@servihub.com</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-orange-500 mt-0.5 shrink-0" size={16} />
              <div>
                <div className="text-white font-medium mb-0.5">Phone</div>
                <div>+234 900 000 0000</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-orange-500 mt-0.5 shrink-0" size={16} />
              <div>
                <div className="text-white font-medium mb-0.5">Office</div>
                <div>Victoria Island, Lagos, Nigeria</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div>© 2026 ServiHub Technologies Ltd. All rights reserved.</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-orange-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-orange-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-orange-400 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
