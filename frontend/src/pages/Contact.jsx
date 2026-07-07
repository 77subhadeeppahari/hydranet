import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      toast.success("Message sent! Our team will reach out shortly.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24" data-testid="contact-page">
      <div className="max-w-3xl mb-14">
        <div className="hn-overline mb-4">Get in Touch</div>
        <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white">Talk to <span className="text-[#F26B21]">Hydranet.</span></h1>
        <p className="mt-5 text-lg text-slate-300">Have a question, want to check coverage, or ready to subscribe? Drop us a line.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="space-y-4">
          <InfoBlock icon={Mail} label="Email" value="hello@hydranet.in" testId="contact-info-email" />
          <InfoBlock icon={Phone} label="Phone" value="+91 90000 00000" testId="contact-info-phone" />
          <InfoBlock icon={MapPin} label="Office" value="Fiber Hub, Sector 12, Kolkata — 700094, India" testId="contact-info-address" />
          <div className="hn-card rounded-xl p-6">
            <div className="hn-overline mb-3">Support Hours</div>
            <div className="text-white font-mono-metric">24 × 7 × 365</div>
            <div className="text-slate-400 text-sm mt-1">Real humans, always on.</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-2 hn-card rounded-xl p-8" data-testid="contact-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Full Name" value={form.name} onChange={update("name")} required testId="contact-input-name" />
            <Field label="Email" type="email" value={form.email} onChange={update("email")} required testId="contact-input-email" />
            <Field label="Phone" value={form.phone} onChange={update("phone")} required testId="contact-input-phone" />
            <Field label="Subject" value={form.subject} onChange={update("subject")} testId="contact-input-subject" />
          </div>
          <div className="mt-5">
            <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={update("message")}
              data-testid="contact-input-message"
              className="w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-4 py-3 text-white placeholder:text-slate-600 transition-colors"
              placeholder="Tell us about your requirement, location, and preferred plan…"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            data-testid="contact-submit-btn"
            className="mt-6 hn-btn-primary inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Send size={16} /> {submitting ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>

      {/* Map */}
      <div className="mt-10" data-testid="contact-map-section">
        <div className="hn-overline mb-4">Find Us</div>
        <div className="rounded-2xl overflow-hidden border border-white/10 hn-card p-0">
          <div className="relative w-full" style={{ paddingBottom: "40%" }}>
            <iframe
              title="Hydranet Broadband Location"
              data-testid="contact-map-iframe"
              src="https://www.openstreetmap.org/export/embed.html?bbox=88.3200%2C22.5000%2C88.4400%2C22.6000&layer=mapnik&marker=22.5500%2C88.3800"
              className="absolute inset-0 w-full h-full grayscale-[0.4] contrast-125"
              style={{ border: 0, filter: "invert(0.92) hue-rotate(180deg)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 bg-[#020617]">
            <div className="text-sm text-slate-300">
              <span className="text-[#F26B21] font-mono-metric text-xs uppercase tracking-widest mr-2">HQ</span>
              Fiber Hub, Sector 12, Kolkata — 700094, India
            </div>
            <a
              href="https://www.openstreetmap.org/?mlat=22.5500&mlon=88.3800#map=13/22.5500/88.3800"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="contact-open-map-link"
              className="hn-btn-secondary !py-2 !px-4 text-xs"
            >
              Open in Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, type = "text", value, onChange, required, testId }) => (
  <div>
    <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">{label}{required && " *"}</label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      data-testid={testId}
      className="w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-4 py-3 text-white placeholder:text-slate-600 transition-colors"
    />
  </div>
);

const InfoBlock = ({ icon: Icon, label, value, testId }) => (
  <div className="hn-card rounded-xl p-6 flex items-start gap-4" data-testid={testId}>
    <div className="w-10 h-10 rounded-md grid place-items-center bg-[#F26B21]/10 text-[#F26B21] border border-[#F26B21]/20 flex-shrink-0">
      <Icon size={18} strokeWidth={1.5} />
    </div>
    <div>
      <div className="hn-overline">{label}</div>
      <div className="mt-1 text-white">{value}</div>
    </div>
  </div>
);
