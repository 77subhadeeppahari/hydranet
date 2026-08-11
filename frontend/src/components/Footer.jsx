import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-white/5 mt-24 bg-[#020617]" data-testid="site-footer">
    <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
      <div className="md:col-span-2">
        <Logo />
        <p className="mt-5 text-slate-400 text-sm max-w-md leading-relaxed">
          Hydranet Broadband delivers blazing-fast fiber internet with rock-solid uptime, curated OTT bundles, and 24/7 human support. Built for streamers, gamers, and remote workers.
        </p>
        <div className="mt-6 flex items-center gap-3">
          {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
            <a key={i} href="#" className="w-9 h-9 grid place-items-center rounded-md border border-white/10 hover:border-[#F26B21] hover:text-[#F26B21] text-slate-400 transition-colors" data-testid={`footer-social-${i}`}>
              <Icon size={16} strokeWidth={1.5} />
            </a>
          ))}
        </div>
      </div>
      <div>
        <div className="hn-overline mb-4">Company</div>
        <ul className="space-y-2 text-sm text-slate-400">
          <li><Link to="/about" className="hover:text-white">About Us</Link></li>
          <li><Link to="/team" className="hover:text-white">Team</Link></li>
          <li><Link to="/services" className="hover:text-white">Services</Link></li>
          <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
        </ul>
      </div>
      <div>
        <div className="hn-overline mb-4">Plans</div>
        <ul className="space-y-2 text-sm text-slate-400">
          <li><Link to="/plans?tab=monthly" className="hover:text-white">Monthly</Link></li>
          <li><Link to="/plans?tab=six_month" className="hover:text-white">6-Month</Link></li>
          <li><Link to="/plans?tab=twelve_month" className="hover:text-white">Yearly</Link></li>
          <li><Link to="/plans?tab=welcome" className="hover:text-white">Welcome</Link></li>
          <li><Link to="/plans?tab=ott" className="hover:text-white">OTT Bundles</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Hydranet Broadband. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/admin/login" className="hover:text-[#F26B21]" data-testid="footer-admin-link">Admin</Link>
          <Link to="/privacy-policy" className="hover:text-[#F26B21]" data-testid="footer-privacy-link">Privacy</Link>
          <Link to="/terms-and-conditions" className="hover:text-[#F26B21]" data-testid="footer-terms-link">Terms</Link>
          <Link to="/cancellation-policy" className="hover:text-[#F26B21]" data-testid="footer-cancellation-link">Cancellation</Link>
        </div>
      </div>
    </div>
  </footer>
);
