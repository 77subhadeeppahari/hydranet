import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X, ExternalLink, Users, User } from "lucide-react";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/plans", label: "Plans" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/team", label: "Team" },
  { to: "/partner", label: "Partner" },
  { to: "/support", label: "Support" },
  { to: "/contact", label: "Contact" },
];

const EXTERNAL_LINKS = [
  { href: "https://one.hydranetbroadband.in/", label: "Partner Login", icon: Users },
  { href: "https://selfcare.hydranetbroadband.in/", label: "Customer Login", icon: User },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 hn-glass" data-testid="site-navbar">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              data-testid={`nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive ? "text-[#F26B21] bg-white/5" : "text-slate-300 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          {EXTERNAL_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`nav-ext-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md text-slate-300 hover:text-[#F26B21] hover:bg-white/5 transition-colors"
            >
              <l.icon size={13} strokeWidth={1.5} /> {l.label} <ExternalLink size={11} className="opacity-60" />
            </a>
          ))}
          <Link to="/plans" className="hn-btn-primary text-sm" data-testid="nav-subscribe-btn">Subscribe</Link>
        </div>
        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 rounded-md hover:bg-white/5 text-white"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-white/5 bg-[#0a0f1e]/95">
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                data-testid={`mnav-${n.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-md ${
                    isActive ? "text-[#F26B21] bg-white/5" : "text-slate-300"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1">
              {EXTERNAL_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`mnav-ext-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-[#F26B21]"
                >
                  <l.icon size={14} strokeWidth={1.5} /> {l.label} <ExternalLink size={11} className="opacity-60" />
                </a>
              ))}
            </div>
            <Link to="/plans" onClick={() => setOpen(false)} className="hn-btn-primary text-center mt-2">Subscribe</Link>
          </div>
        </div>
      )}
    </header>
  );
};
