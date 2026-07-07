const MILESTONES = [
  { year: "2019", title: "Hydranet Founded", desc: "Started with a single fiber loop connecting 50 homes." },
  { year: "2021", title: "10x Growth", desc: "Crossed 5,000 subscribers and expanded coverage to 3 cities." },
  { year: "2023", title: "OTT Launch", desc: "Rolled out bundled OTT plans with 26+ streaming partners." },
  { year: "2025", title: "12k+ Homes", desc: "Serving 12,000+ homes with 99.9% uptime and 24/7 support." },
];

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
          <p>
            Hydranet Broadband was born out of frustration — with dropped calls, buffering movies, and support hotlines that never picked up. We asked one question: <span className="text-white">what if a local ISP could actually be great?</span>
          </p>
          <p>
            Since 2019, we've been laying our own fiber, hiring our own engineers, and answering our own phones. No outsourced call centers. No hidden fees. Just fast, reliable internet.
          </p>
        </div>
      </div>

      {/* Mission / Vision */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="hn-card rounded-xl p-10" data-testid="about-mission">
          <div className="hn-overline mb-3">Mission</div>
          <p className="text-2xl font-display text-white leading-snug">
            Deliver honest, fast internet to every home and business we serve — with a service standard we'd want for our own family.
          </p>
        </div>
        <div className="hn-card rounded-xl p-10" data-testid="about-vision">
          <div className="hn-overline mb-3">Vision</div>
          <p className="text-2xl font-display text-white leading-snug">
            Be the most trusted local broadband provider in India — known for reliability, transparency, and human support.
          </p>
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-20">
        <div className="hn-overline mb-6">Milestones</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {MILESTONES.map((m, i) => (
            <div key={i} className="hn-card rounded-xl p-6" data-testid={`milestone-${i}`}>
              <div className="font-mono-metric text-3xl font-bold text-[#F26B21]">{m.year}</div>
              <div className="mt-3 font-display text-lg font-semibold text-white">{m.title}</div>
              <div className="mt-2 text-sm text-slate-400 leading-relaxed">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
