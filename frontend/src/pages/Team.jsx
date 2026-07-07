import { useEffect, useState } from "react";
import { Linkedin, Twitter, Mail } from "lucide-react";
import { api } from "../lib/api";

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/team").then(({ data }) => setMembers(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24" data-testid="team-page">
      <div className="max-w-3xl mb-14">
        <div className="hn-overline mb-4">The People</div>
        <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white">
          Real humans behind <span className="text-[#F26B21]">every packet.</span>
        </h1>
        <p className="mt-5 text-lg text-slate-300 leading-relaxed">
          A small, obsessive team of engineers, technicians, and support specialists who take your connection personally.
        </p>
      </div>

      {loading ? <div className="text-slate-400">Loading team…</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((m, i) => (
            <div key={m.id} className="hn-card rounded-xl p-5 group" data-testid={`team-member-${i}`}>
              <div className="aspect-[4/5] overflow-hidden rounded-lg bg-[#020617] border border-white/5">
                {m.image_url ? (
                  <img src={m.image_url} alt={m.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-slate-600">No image</div>
                )}
              </div>
              <div className="mt-5">
                <div className="font-display text-lg font-semibold text-white">{m.name}</div>
                <div className="text-xs uppercase tracking-widest text-[#F26B21] font-mono-metric mt-1">{m.role}</div>
                {m.bio && <div className="text-slate-400 text-sm mt-3 leading-relaxed">{m.bio}</div>}
                <div className="mt-4 flex items-center gap-3 text-slate-500">
                  {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={15} className="hover:text-white" /></a>}
                  {m.twitter && <a href={m.twitter} target="_blank" rel="noopener noreferrer"><Twitter size={15} className="hover:text-white" /></a>}
                  {m.email && <a href={`mailto:${m.email}`}><Mail size={15} className="hover:text-white" /></a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
