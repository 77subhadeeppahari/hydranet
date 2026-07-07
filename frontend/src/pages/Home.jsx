import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Headphones, Wifi, Tv, Router, Check, Sparkles, Star, Quote } from "lucide-react";
import { api } from "../lib/api";
import { LogoMarquee } from "../components/LogoMarquee";

const HERO_IMG = "https://images.unsplash.com/photo-1534312527009-56c7016453e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxmaWJlciUyMG9wdGljJTIwY2FibGVzJTIwZGFyayUyMGFic3RyYWN0JTIwdGVjaCUyMG9yYW5nZSUyMGJsdWV8ZW58MHx8fHwxNzgzMzk5MTI3fDA&ixlib=rb-4.1.0&q=85";

const STATS = [
  { k: "99.9%", v: "Network Uptime" },
  { k: "24/7", v: "Human Support" },
  { k: "12k+", v: "Happy Homes" },
  { k: "1 Gbps", v: "Max Speed" },
];

const FEATURES = [
  { icon: Zap, title: "Blazing Fiber Speeds", desc: "Up to 1 Gbps symmetric fiber straight to your home. Perfect for 4K streams and lag-free gaming." },
  { icon: Router, title: "Free Router", desc: "Welcome plans include a free Single or Dual Band router — installed & configured on day one." },
  { icon: Tv, title: "26+ OTT Bundles", desc: "Watch Zee5, SonyLIV, Amazon Prime, Jiohotstar & more — bundled with your broadband." },
  { icon: Shield, title: "Enterprise-Grade Reliability", desc: "Redundant links, active monitoring, and rapid restoration keep you online 24/7." },
  { icon: Headphones, title: "24/7 Local Support", desc: "Real humans, real answers. On-ground technicians and a support line that actually picks up." },
  { icon: Wifi, title: "Whole-Home Coverage", desc: "Dual-band routers and mesh options ensure Wi-Fi in every corner of your house." },
];

const OTT_LOGOS = [
  { label: "JioHotstar", color: "#1F80E0" },
  { label: "Amazon Prime", color: "#00A8E1" },
  { label: "Zee5", color: "#8228E9" },
  { label: "SonyLIV", color: "#EE1D46" },
  { label: "Hoichoi", color: "#E31E24" },
  { label: "PlayBox TV", color: "#F26B21" },
  { label: "Shemaroo", color: "#F5A623" },
  { label: "Aao Nxt", color: "#00C2A8" },
  { label: "Saavan", color: "#2BC5B4" },
];

export default function Home() {
  const [featuredPlans, setFeaturedPlans] = useState([]);
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    api.get("/plans", { params: { category: "monthly" } }).then(({ data }) => setFeaturedPlans(data.slice(0, 4)));
    api.get("/testimonials").then(({ data }) => setReviews(data));
  }, []);

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
              Fiber-fast internet up to <span className="font-mono-metric text-white">1 Gbps</span>, curated OTT bundles, and a free router — starting at <span className="font-mono-metric text-white">₹347/mo</span>. No throttling, no surprises.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/plans" className="hn-btn-primary inline-flex items-center gap-2" data-testid="hero-cta-plans">
                View Plans <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="hn-btn-secondary" data-testid="hero-cta-contact">Talk to Us</Link>
            </div>
          </div>

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
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24" data-testid="home-features">
        <div className="max-w-2xl mb-16">
          <div className="hn-overline mb-4">Why Hydranet</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Built for people who <span className="text-[#F26B21]">don't tolerate buffering.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="hn-card rounded-xl p-8" data-testid={`feature-card-${i}`}>
              <div className="w-11 h-11 rounded-md grid place-items-center bg-[#F26B21]/10 text-[#F26B21] border border-[#F26B21]/20 mb-6">
                <f.icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">{f.title}</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans preview */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16" data-testid="home-plans-section">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="hn-overline mb-3">Popular Plans</div>
            <h2 className="font-display text-4xl font-bold text-white">Pick your <span className="text-[#F26B21]">speed.</span></h2>
          </div>
          <Link to="/plans" className="text-sm text-[#F26B21] hover:underline inline-flex items-center gap-1" data-testid="home-view-all-plans">
            View all plans <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredPlans.map((p) => (
            <div key={p.id} className={`relative rounded-2xl p-6 flex flex-col ${p.popular ? "border border-[#F26B21]/60 bg-[#0F2650]/40" : "border border-white/10 bg-[#0F172A]"}`} data-testid={`home-plan-${p.id}`}>
              {p.popular && (
                <div className="absolute -top-3 left-6 inline-flex items-center gap-1 font-mono-metric text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#F26B21] text-white">
                  <Sparkles size={10} /> Popular
                </div>
              )}
              <div className="hn-overline mb-2">{p.validity_label}</div>
              <div className="font-display text-xl font-bold text-white">{p.name}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-slate-400 font-mono-metric">₹</span>
                <span className="font-mono-metric text-3xl font-bold text-white">{p.price.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest font-mono-metric text-[#F26B21] mt-1">+18% GST Extra</div>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-mono-metric text-2xl font-bold text-[#F26B21]">{p.speed_mbps}</span>
                <span className="text-xs uppercase tracking-widest text-slate-400">Mbps</span>
              </div>
              <Link to="/plans" className={`mt-5 text-center text-sm ${p.popular ? "hn-btn-primary" : "hn-btn-secondary"}`}>Choose</Link>
            </div>
          ))}
        </div>
      </section>

      {/* OTT carousel */}
      <section className="py-16 border-y border-white/5 bg-[#020617]/40" data-testid="home-ott-section">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 mb-8">
          <div className="hn-overline mb-3">OTT Bundles Included</div>
          <h2 className="font-display text-3xl font-bold text-white">Watch <span className="text-[#F26B21]">everything</span> on us.</h2>
          <p className="text-slate-400 mt-2 text-sm">Pick a Welcome or OTT plan and get access to 30+ streaming services.</p>
        </div>
        <LogoMarquee items={OTT_LOGOS} testId="home-ott-marquee" speed={45} />
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24" data-testid="home-reviews-section">
        <div className="max-w-2xl mb-12">
          <div className="hn-overline mb-3">Customer Love</div>
          <h2 className="font-display text-4xl font-bold text-white">What our <span className="text-[#F26B21]">customers say.</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={r.id} className="hn-card rounded-xl p-8 relative" data-testid={`home-review-${i}`}>
              <Quote size={28} className="text-[#F26B21]/30 absolute top-6 right-6" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={14} className="fill-[#F26B21] text-[#F26B21]" />)}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">"{r.quote}"</p>
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
                {r.image_url && <img src={r.image_url} alt={r.name} className="w-11 h-11 rounded-full object-cover border border-white/10" />}
                <div>
                  <div className="font-display font-semibold text-white">{r.name}</div>
                  {r.location && <div className="text-xs uppercase tracking-widest font-mono-metric text-[#F26B21] mt-0.5">{r.location}</div>}
                </div>
              </div>
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
