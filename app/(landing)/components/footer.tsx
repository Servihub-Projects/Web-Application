import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Link
                href="/"
                className="text-white font-semibold text-2xl tracking-tight"
              >
                ServiHub
              </Link>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Connecting local service providers with customers who need them. Your trusted platform for all home and business services.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Customers</h3>
            <ul className="space-y-3">
              <li><Link href="/#services" className="hover:text-orange-400 transition-colors">Find Services</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-orange-400 transition-colors">How It Works</Link></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Reviews</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Providers</h3>
            <ul className="space-y-3">
              <li><Link href="/waitlist" className="hover:text-orange-400 transition-colors">Become a Provider</Link></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Provider Benefits</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Resources</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Provider Login</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-orange-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="text-orange-500 mt-1 shrink-0" size={20} />
              <div>
                <div className="text-white font-medium">Email</div>
                <div className="text-gray-400">support@servihub.com</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-orange-500 mt-1 shrink-0" size={20} />
              <div>
                <div className="text-white font-medium">Phone</div>
                <div className="text-gray-400">1-800-SERVIHUB</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-orange-500 mt-1 shrink-0" size={20} />
              <div>
                <div className="text-white font-medium">Address</div>
                <div className="text-gray-400">123 Service St, City, ST 12345</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm">
            © 2026 ServiHub. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
