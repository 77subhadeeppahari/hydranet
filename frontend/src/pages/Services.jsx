import { Wifi, Router, Tv, Building2, Wrench, Headphones, ShieldCheck, Zap, Camera, Server, Network, Activity } from "lucide-react";

const SERVICES = [
  { icon: Wifi, title: "Fiber Broadband", desc: "Symmetric fiber connections from 15 Mbps up to 100 Mbps for homes and offices.", tag: "Core" },
  { icon: Tv, title: "OTT Bundles", desc: "Bundle Amazon Prime, Zee5, SonyLIV, Jiohotstar, Saavan & more with your plan.", tag: "Entertainment" },
  { icon: Router, title: "Free Router Installation", desc: "Welcome plans include a free Single or Dual Band router — installed by our technician.", tag: "Included" },
  { icon: Building2, title: "Business & Enterprise", desc: "Static IPs, dedicated bandwidth, SLA-backed uptime for shops, offices, and cafés.", tag: "For Business" },
  { icon: Camera, title: "CCTV / BMS", desc: "End-to-end CCTV surveillance and Building Management Systems — design, install, monitor.", tag: "Security" },
  { icon: Server, title: "Server Management", desc: "On-prem & cloud server provisioning, patching, backups and 24×7 monitoring by our engineers.", tag: "Infrastructure" },
  { icon: Network, title: "Network Management", desc: "LAN/WAN design, structured cabling, VLANs, firewalls, and end-to-end managed network services.", tag: "Enterprise" },
  { icon: Activity, title: "NMS Provider", desc: "Network Monitoring System deployment with real-time alerts, SLA dashboards, and incident response.", tag: "Monitoring" },
  { icon: Wrench, title: "Onsite Installation", desc: "Same-day or next-day installation in serviceable areas by our field team.", tag: "Setup" },
  { icon: Headphones, title: "24/7 Customer Support", desc: "Local support line, live chat, and rapid on-ground assistance whenever you need it.", tag: "Support" },
  { icon: ShieldCheck, title: "Secure Network", desc: "Managed DNS, firewalled backbone, and protection against common threats.", tag: "Security" },
  { icon: Zap, title: "Performance Monitoring", desc: "Proactive monitoring keeps latency low and detects issues before you do.", tag: "Ops" },
];

export default function Services() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24" data-testid="services-page">
      <div className="max-w-3xl mb-14">
        <div className="hn-overline mb-4">What we offer</div>
        <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white">Services designed for <span className="text-[#F26B21]">real usage.</span></h1>
        <p className="mt-5 text-lg text-slate-300 leading-relaxed">From family homes streaming 4K on multiple TVs to businesses running critical operations — Hydranet gives you the right pipe, the right hardware, and the right support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((s, i) => (
          <div key={i} className="hn-card rounded-xl p-8 relative overflow-hidden" data-testid={`service-card-${i}`}>
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-md grid place-items-center bg-[#F26B21]/10 text-[#F26B21] border border-[#F26B21]/20">
                <s.icon size={20} strokeWidth={1.5} />
              </div>
              <span className="font-mono-metric text-[10px] uppercase tracking-widest text-slate-500 border border-white/10 rounded-full px-2.5 py-1">{s.tag}</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-white">{s.title}</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
