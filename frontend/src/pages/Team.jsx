import { Linkedin, Twitter, Mail } from "lucide-react";

const TEAM = [
  { name: "Subhadeep Pahari", role: "Founder & CEO", img: "https://images.unsplash.com/photo-1532170579297-281918c8ae72?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwyfHxwZW9wbGUlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMG5ldXRyYWwlMjBiYWNrZ3JvdW5kJTIwZGFya3xlbnwwfHx8fDE3ODMzOTkxMjd8MA&ixlib=rb-4.1.0&q=85" },
  { name: "Riya Sharma", role: "Chief Technology Officer", img: "https://images.unsplash.com/photo-1574281570877-bd815ebb50a4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHw0fHxwZW9wbGUlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMG5ldXRyYWwlMjBiYWNrZ3JvdW5kJTIwZGFya3xlbnwwfHx8fDE3ODMzOTkxMjd8MA&ixlib=rb-4.1.0&q=85" },
  { name: "Arjun Verma", role: "Head of Network Ops", img: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwzfHxwZW9wbGUlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMG5ldXRyYWwlMjBiYWNrZ3JvdW5kJTIwZGFya3xlbnwwfHx8fDE3ODMzOTkxMjd8MA&ixlib=rb-4.1.0&q=85" },
  { name: "Priya Nair", role: "Head of Customer Success", img: "https://images.unsplash.com/photo-1532171875345-9712d9d4f65a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMG5ldXRyYWwlMjBiYWNrZ3JvdW5kJTIwZGFya3xlbnwwfHx8fDE3ODMzOTkxMjd8MA&ixlib=rb-4.1.0&q=85" },
  { name: "Rohan Das", role: "Lead Field Engineer", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60" },
  { name: "Ananya Roy", role: "Marketing & Growth", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60" },
  { name: "Karan Mehta", role: "Business Development", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=60" },
  { name: "Sneha Iyer", role: "Support Team Lead", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60" },
];

export default function Team() {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEAM.map((m, i) => (
          <div key={i} className="hn-card rounded-xl p-5 group" data-testid={`team-member-${i}`}>
            <div className="aspect-[4/5] overflow-hidden rounded-lg bg-[#020617] border border-white/5">
              <img src={m.img} alt={m.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="mt-5">
              <div className="font-display text-lg font-semibold text-white">{m.name}</div>
              <div className="text-xs uppercase tracking-widest text-[#F26B21] font-mono-metric mt-1">{m.role}</div>
              <div className="mt-4 flex items-center gap-3 text-slate-500">
                <Linkedin size={15} className="hover:text-white cursor-pointer" />
                <Twitter size={15} className="hover:text-white cursor-pointer" />
                <Mail size={15} className="hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
