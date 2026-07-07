import { useState } from "react";
import { Handshake, Quote, Send } from "lucide-react";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

export default function Partner() {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", city: "", partnership_type: "Franchise", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/partner-enquiry", form);
      toast.success("Enquiry sent! Our partnership team will reach out within 24 hours.");
      setForm({ name: "", company: "", email: "", phone: "", city: "", partnership_type: "Franchise", message: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to submit");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24" data-testid="partner-page">
      <div className="max-w-3xl mb-14">
        <div className="hn-overline mb-4">Become a Partner</div>
        <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white">
          Grow with <span className="text-[#F26B21]">Hydranet.</span>
        </h1>
        <p className="mt-5 text-lg text-slate-300 leading-relaxed">
          Whether you're a local cable operator, a franchise investor, or a rural entrepreneur — partner with us to bring fiber-fast internet to your town.
        </p>
      </div>

      {/* Founder Quote */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 hn-glass p-10 lg:p-14 mb-14" data-testid="partner-founder-quote">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-[#F26B21]/15 blur-3xl" />
        <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2">
            <div className="aspect-square w-full max-w-[220px] rounded-2xl overflow-hidden border-2 border-[#F26B21]/40">
              <img src="https://images.unsplash.com/photo-1532170579297-281918c8ae72?w=500&auto=format&fit=crop&q=70" alt="Founder" className="w-full h-full object-cover" />
            </div>
            <div className="mt-5">
              <div className="font-display text-xl font-bold text-white">Subhadeep Pahari</div>
              <div className="text-xs uppercase tracking-widest font-mono-metric text-[#F26B21] mt-1">Founder & CEO</div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <Quote size={36} className="text-[#F26B21]/40 mb-4" />
            <blockquote className="font-display text-xl lg:text-2xl leading-snug text-white">
              "Our partners aren't just resellers — they're <span className="text-[#F26B21]">the reason</span> a village gets fiber before a metro upgrade does. We share the network, the training, the brand, and the profits. If you know your town and its people, we'll bring the technology. Together we <span className="text-[#F26B21]">unlock the last mile</span>."
            </blockquote>
            <div className="mt-4 font-mono-metric text-sm text-slate-400">— Subhadeep Pahari, on Hydranet's franchise model</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="hn-card rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#F26B21]/20 blur-3xl pointer-events-none" />
            <div className="relative w-20 h-20 rounded-2xl grid place-items-center bg-gradient-to-br from-[#F26B21]/30 to-[#0F2650]/60 text-[#F26B21] border border-[#F26B21]/40 mb-5 shadow-[0_0_40px_-10px_rgba(242,107,33,0.6)]">
              <Handshake size={40} strokeWidth={1.4} />
            </div>
            <div className="hn-overline mb-2">Why partner with us</div>
            <ul className="text-sm text-slate-300 space-y-2 mt-3">
              <li>✓ Ready-to-deploy fiber network</li>
              <li>✓ Branded router & installation kit</li>
              <li>✓ Billing & CRM software provided</li>
              <li>✓ Marketing & signage support</li>
              <li>✓ Dedicated partner success team</li>
              <li>✓ Attractive revenue share</li>
            </ul>
          </div>
        </div>

        <form onSubmit={submit} className="lg:col-span-2 hn-card rounded-xl p-8" data-testid="partner-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Full Name" value={form.name} onChange={upd("name")} required testId="partner-input-name" />
            <Field label="Company / Business Name" value={form.company} onChange={upd("company")} testId="partner-input-company" />
            <Field label="Email" type="email" value={form.email} onChange={upd("email")} required testId="partner-input-email" />
            <Field label="Phone" value={form.phone} onChange={upd("phone")} required testId="partner-input-phone" />
            <Field label="City / Town" value={form.city} onChange={upd("city")} testId="partner-input-city" />
            <div>
              <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">Partnership Type</label>
              <select value={form.partnership_type} onChange={upd("partnership_type")} data-testid="partner-input-type"
                className="w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-4 py-3 text-white">
                <option>Franchise</option>
                <option>Reseller</option>
                <option>Local Cable Operator</option>
                <option>Enterprise Referral</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="mt-5">
            <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">Tell us about yourself *</label>
            <textarea required rows={5} value={form.message} onChange={upd("message")} data-testid="partner-input-message"
              className="w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-4 py-3 text-white"
              placeholder="Share your background, target area, existing customer base (if any), and investment capacity…" />
          </div>
          <button type="submit" disabled={submitting} data-testid="partner-submit-btn"
            className="mt-6 hn-btn-primary inline-flex items-center gap-2 disabled:opacity-60">
            <Send size={16} /> {submitting ? "Submitting…" : "Submit Partner Enquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}

const Field = ({ label, type = "text", value, onChange, required, testId }) => (
  <div>
    <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">{label}{required && " *"}</label>
    <input type={type} required={required} value={value} onChange={onChange} data-testid={testId}
      className="w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-4 py-3 text-white" />
  </div>
);
