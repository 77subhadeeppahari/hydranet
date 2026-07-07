import { LogoMarquee } from "../components/LogoMarquee";
import { Quote } from "lucide-react";

const MILESTONES = [
  { year: "Apr 2022", title: "BSNL Franchise Launch", desc: "Launched as a BSNL Franchise Partner with our first 30 customers." },
  { year: "Jan 2023", title: "Hydracom Infocom Pvt Ltd", desc: "Officially incorporated as Hydracom Infocom Private Limited. Crossed 200+ customers." },
  { year: "Jan 2024", title: "Hydranet Brand Launch", desc: "Launched our own brand — Hydranet Broadband — with 350+ customers." },
  { year: "Jan 2025", title: "OTT & IPTV", desc: "Rolled out bundled OTT & IPTV services across all plans." },
  { year: "Jan 2026", title: "Welcome & New Plans", desc: "Introduced Welcome plans and refreshed our pricing tiers." },
];

const PARTNERS = [
  { label: "Syrotech", color: "#F26B21" },
  { label: "Digisol", color: "#00A8E1" },
  { label: "Mikrotik", color: "#293C4A" },
  { label: "Cisco", color: "#1BA0D7" },
  { label: "ZTE", color: "#0067B1" },
  { label: "Huawei", color: "#E60012" },
];
// Brighten dark colors for dark theme visibility
const PARTNER_ITEMS = PARTNERS.map(p => ({ ...p, color: p.color === "#293C4A" ? "#94A3B8" : p.color }));

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24" data-testid="about-page">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
        <div>
          <div className="hn-overline mb-4">About Us</div>
          <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white">
            The internet you <span className="text-[#F26B21]">deserve</span>, built by people who care.
          </h1>
        </div>
        <div className="text-slate-300 leading-relaxed space-y-5 text-lg">
          <p>Hydranet Broadband was born out of frustration — with dropped calls, buffering movies, and support hotlines that never picked up. We asked one question: <span className="text-white">what if a local ISP could actually be great?</span></p>
          <p>Since 2022, we've been laying our own fiber, hiring our own engineers, and answering our own phones. No outsourced call centers. No hidden fees. Just fast, reliable internet.</p>
        </div>
      </div>

      {/* Mission / Vision */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="hn-card rounded-xl p-10" data-testid="about-mission">
          <div className="hn-overline mb-3">Mission</div>
          <p className="text-2xl font-display text-white leading-snug">Deliver honest, fast internet to every home and business we serve — with a service standard we'd want for our own family.</p>
        </div>
        <div className="hn-card rounded-xl p-10" data-testid="about-vision">
          <div className="hn-overline mb-3">Vision</div>
          <p className="text-2xl font-display text-white leading-snug">Be the most trusted local broadband provider in India — known for reliability, transparency, and human support.</p>
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-20">
        <div className="hn-overline mb-6">Our Journey</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {MILESTONES.map((m, i) => (
            <div key={i} className="hn-card rounded-xl p-6 relative" data-testid={`milestone-${i}`}>
              <div className="absolute -top-3 left-6 font-mono-metric text-[10px] uppercase tracking-widest bg-[#F26B21] text-white px-2.5 py-1 rounded-full">{m.year}</div>
              <div className="mt-4 font-display text-lg font-semibold text-white">{m.title}</div>
              <div className="mt-2 text-sm text-slate-400 leading-relaxed">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Founder Say */}
      <div className="mt-24 relative overflow-hidden rounded-2xl border border-white/10 hn-glass p-10 lg:p-16" data-testid="about-founder-say">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-[#F26B21]/15 blur-3xl" />
        <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2">
            <div className="aspect-square w-full max-w-xs rounded-2xl overflow-hidden border-2 border-[#F26B21]/40">
              <img src="https://images.unsplash.com/photo-1532170579297-281918c8ae72?w=600&auto=format&fit=crop&q=70" alt="Subhadeep Pahari" className="w-full h-full object-cover" />
            </div>
            <div className="mt-6">
              <div className="font-display text-2xl font-bold text-white">Subhadeep Pahari</div>
              <div className="text-xs uppercase tracking-widest font-mono-metric text-[#F26B21] mt-1">Founder & CEO · Hydranet Broadband</div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="hn-overline mb-4">Founder Say</div>
            <Quote size={40} className="text-[#F26B21]/40 mb-4" />
            <blockquote className="font-display text-2xl lg:text-3xl leading-snug text-white">
              "The internet is no longer a luxury — it's the lifeline of every home, every classroom, every small business. My mission with Hydranet is simple: bring <span className="text-[#F26B21]">world-class fiber</span> to the towns and villages the big players forgot, at a price that respects every family's budget. When our fiber reaches your door, it's not just cable — it's <span className="text-[#F26B21]">opportunity</span>, and we take that seriously."
            </blockquote>
            <div className="mt-6 font-mono-metric text-sm text-slate-400">— Subhadeep Pahari</div>
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className="mt-24" data-testid="about-partners">
        <div className="text-center mb-4">
          <div className="hn-overline mb-3">Technology Partners</div>
          <h2 className="font-display text-3xl font-bold text-white">Powered by <span className="text-[#F26B21]">industry leaders.</span></h2>
        </div>
        <LogoMarquee items={PARTNER_ITEMS} testId="about-partners-marquee" speed={35} />
      </div>
    </div>
  );
}
