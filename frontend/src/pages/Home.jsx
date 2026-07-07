import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Headphones, Wifi, Tv, Router } from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1534312527009-56c7016453e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxmaWJlciUyMG9wdGljJTIwY2FibGVzJTIwZGFyayUyMGFic3RyYWN0JTIwdGVjaCUyMG9yYW5nZSUyMGJsdWV8ZW58MHx8fHwxNzgzMzk5MTI3fDA&ixlib=rb-4.1.0&q=85";

const STATS = [
  { k: "99.9%", v: "Network Uptime" },
  { k: "24/7", v: "Human Support" },
  { k: "12k+", v: "Happy Homes" },
  { k: "100", v: "Mbps Max Speed" },
];

const FEATURES = [
  { icon: Zap, title: "Blazing Fiber Speeds", desc: "Up to 100 Mbps symmetric fiber straight to your home. Perfect for 4K streams and lag-free gaming." },
  { icon: Router, title: "Free Router", desc: "Welcome plans include a free Single or Dual Band router — installed & configured on day one." },
  { icon: Tv, title: "26+ OTT Bundles", desc: "Watch Zee5, SonyLIV, Amazon Prime, Jiohotstar & more — bundled with your broadband." },
  { icon: Shield, title: "Enterprise-Grade Reliability", desc: "Redundant links, active monitoring, and rapid restoration keep you online 24/7." },
  { icon: Headphones, title: "24/7 Local Support", desc: "Real humans, real answers. On-ground technicians and a support line that actually picks up." },
  { icon: Wifi, title: "Whole-Home Coverage", desc: "Dual-band routers and mesh options ensure Wi-Fi in every corner of your house." },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <img src={HERO_IMG} alt="fiber" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-24 pb-32 lg:pt-32 lg:pb-40">
          <div className="max-w-3xl hn-fade-up">
            <div className="hn-overline mb-6 flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-[#F26B21] hn-pulse-ring"></span>
              Fiber · Live in your city
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-white">
              Broadband that <span className="hn-gradient-text">actually flies.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl leading-relaxed">
              Fiber-fast internet, curated OTT bundles, and a free router — starting at <span className="font-mono-metric text-white">₹347/mo</span>. No throttling, no surprises.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/plans" className="hn-btn-primary inline-flex items-center gap-2" data-testid="hero-cta-plans">
                View Plans <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="hn-btn-secondary" data-testid="hero-cta-contact">Talk to Us</Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden hn-glass">
            {STATS.map((s, i) => (
              <div key={i} className="p-6 bg-[#0F172A]/60" data-testid={`hero-stat-${i}`}>
                <div className="font-mono-metric text-3xl lg:text-4xl font-bold text-white">{s.k}</div>
                <div className="text-xs uppercase tracking-widest text-slate-400 mt-2">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32" data-testid="home-features">
        <div className="max-w-2xl mb-16">
          <div className="hn-overline mb-4">Why Hydranet</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Built for people who <span className="text-[#F26B21]">don't tolerate buffering.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="hn-card rounded-xl p-8 group" data-testid={`feature-card-${i}`}>
              <div className="w-11 h-11 rounded-md grid place-items-center bg-[#F26B21]/10 text-[#F26B21] border border-[#F26B21]/20 mb-6">
                <f.icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">{f.title}</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 p-10 lg:p-16 hn-glass" data-testid="home-cta">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#F26B21]/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Ready to upgrade your internet?</h2>
            <p className="mt-4 text-slate-300">Pick a plan in under 60 seconds. Installation within 24 hours in serviceable areas.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/plans" className="hn-btn-primary">See All Plans</Link>
              <Link to="/contact" className="hn-btn-secondary">Check Coverage</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
