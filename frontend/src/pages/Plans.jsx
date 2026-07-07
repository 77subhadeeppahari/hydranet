import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Check, Sparkles, Wifi } from "lucide-react";

const CATEGORIES = [
  { key: "monthly", label: "Monthly" },
  { key: "six_month", label: "6-Month" },
  { key: "twelve_month", label: "Yearly" },
  { key: "welcome", label: "Welcome" },
  { key: "ott", label: "OTT" },
];

export default function Plans() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "monthly";
  const [tab, setTab] = useState(initialTab);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/plans", { params: { category: tab } })
      .then(({ data }) => setPlans(data))
      .finally(() => setLoading(false));
    setSearchParams({ tab }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24" data-testid="plans-page">
      <div className="max-w-3xl mb-10">
        <div className="hn-overline mb-4">Pricing</div>
        <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white">Pick a plan that <span className="text-[#F26B21]">fits your speed.</span></h1>
        <p className="mt-5 text-lg text-slate-300">All prices in <span className="font-mono-metric text-white">₹ INR</span>. <span className="text-[#F26B21] font-medium">+18% GST extra</span> on every plan. Longer validity plans include bonus months.</p>
      </div>

      {/* Category toggle */}
      <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-full border border-white/10 bg-[#0F172A]/60 mb-10" data-testid="plans-category-toggle">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            data-testid={`plans-tab-${c.key}`}
            onClick={() => setTab(c.key)}
            className={`px-5 py-2 text-sm rounded-full font-medium transition-all ${
              tab === c.key ? "bg-[#F26B21] text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400" data-testid="plans-loading">Loading plans…</div>
      ) : plans.length === 0 ? (
        <div className="text-slate-400" data-testid="plans-empty">No plans available in this category yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="plans-grid">
          {plans.map((p) => (
            <PlanCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ p }) {
  const isPopular = p.popular;
  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
        isPopular
          ? "border border-[#F26B21]/60 bg-[#0F2650]/40 backdrop-blur-lg shadow-[0_0_60px_-20px_rgba(242,107,33,0.4)]"
          : "border border-white/10 bg-[#0F172A]"
      }`}
      data-testid={`plan-card-${p.id}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-8 inline-flex items-center gap-1 font-mono-metric text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#F26B21] text-white">
          <Sparkles size={11} /> Popular
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className="hn-overline mb-2">{p.validity_label}</div>
          <h3 className="font-display text-2xl font-bold text-white">{p.name}</h3>
        </div>
        <div className="w-10 h-10 rounded-md grid place-items-center bg-white/5 text-[#F26B21] border border-white/10">
          <Wifi size={18} strokeWidth={1.5} />
        </div>
      </div>

      <div className="mt-8 flex items-baseline gap-1">
        <span className="text-slate-400 font-mono-metric text-lg">₹</span>
        <span className="font-mono-metric text-5xl font-bold text-white tracking-tight">{p.price.toLocaleString("en-IN")}</span>
      </div>
      <div className="mt-2 text-slate-400 text-sm">for {p.validity_label.toLowerCase()}</div>
      <div className="mt-1 font-mono-metric text-[10px] uppercase tracking-widest text-[#F26B21]">+18% GST Extra</div>

      <div className="mt-6 p-4 rounded-lg bg-black/30 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="font-mono-metric text-3xl font-bold text-[#F26B21] leading-none">{p.speed_mbps}</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Mbps</div>
            <div className="text-xs text-slate-500">symmetric fiber</div>
          </div>
        </div>
      </div>

      {p.benefits && (
        <ul className="mt-6 space-y-2 text-sm text-slate-300 leading-relaxed">
          {p.benefits.split(/\n|(?<=Free)\s+(?=OTT)/).map((b, i) => (
            <li key={i} className="flex gap-2">
              <Check size={16} className="text-[#F26B21] mt-0.5 flex-shrink-0" strokeWidth={2} />
              <span>{b.trim()}</span>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/contact"
        data-testid={`plan-subscribe-${p.id}`}
        className={`mt-8 text-center ${isPopular ? "hn-btn-primary" : "hn-btn-secondary"}`}
      >
        Subscribe
      </Link>
    </div>
  );
}
