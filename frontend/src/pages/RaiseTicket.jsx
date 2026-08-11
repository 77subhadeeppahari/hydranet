import { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import { Ticket, Send, CheckCircle2, Phone, Mail, MapPin, User, Hash, Wifi } from "lucide-react";

const SERVICE_TYPES = [
  { value: "fiber", label: "Fiber Broadband" },
  { value: "wireless", label: "Wireless Internet" },
  { value: "ott", label: "OTT / Streaming Bundle" },
  { value: "other", label: "Other" },
];

const inputCls = "w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-4 py-3 text-white placeholder:text-slate-600 transition-colors text-sm";
const selectCls = `${inputCls} cursor-pointer`;

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">
      {label}{required && <span className="text-[#F26B21] ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default function RaiseTicket() {
  const [categories, setCategories] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_id: "",
    area: "",
    service_type: "",
  });

  useEffect(() => {
    api.get("/ticket-categories")
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/tickets", form);
      setTicketNumber(data.ticket_number || "");
      setSubmitted(true);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Could not submit your ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setTicketNumber("");
    setForm({ title: "", description: "", category: "", customer_name: "", customer_email: "", customer_phone: "", customer_id: "", area: "", service_type: "" });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24">
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 grid place-items-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">Ticket Submitted!</h2>
          {ticketNumber && (
            <div className="inline-flex items-center gap-2 bg-[#0F172A] border border-white/10 rounded-full px-5 py-2 mb-4">
              <Hash size={14} className="text-[#F26B21]" />
              <span className="font-mono-metric text-white text-sm">{ticketNumber}</span>
            </div>
          )}
          <p className="text-slate-400 mb-2">Your support request has been received. Our team will review it and get back to you shortly.</p>
          <p className="text-slate-500 text-sm mb-8">Save your ticket number for future reference.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={reset} className="hn-btn-secondary">Raise Another Ticket</button>
            <a href="/contact" className="hn-btn-primary">Contact Us</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-24" data-testid="raise-ticket-page">
      {/* Header */}
      <div className="max-w-3xl mb-14">
        <div className="hn-overline mb-4">Customer Support</div>
        <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter text-white">
          Raise a <span className="text-[#F26B21]">Ticket.</span>
        </h1>
        <p className="mt-5 text-lg text-slate-300">
          Facing an issue? Fill out the form below and our support team will get back to you promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info sidebar */}
        <div className="space-y-4">
          <InfoBlock icon={Phone} label="Phone Support" value="+91 7864068605" />
          <InfoBlock icon={Mail} label="Email Support" value="help@hydranetbroadband.in" />
          <InfoBlock icon={MapPin} label="Coverage Area" value="East & West Midnapore, West Bengal" />
          <div className="hn-card rounded-xl p-6">
            <div className="hn-overline mb-3">Support Hours</div>
            <div className="text-white font-mono-metric text-lg">24 × 7 × 365</div>
            <div className="text-slate-400 text-sm mt-1">Real humans, always on.</div>
          </div>
          <div className="hn-card rounded-xl p-6">
            <div className="hn-overline mb-3">How it works</div>
            <ol className="space-y-3">
              {["Fill in the form with your details", "Submit — you'll get a ticket number", "Our team reviews & contacts you", "Issue resolved!"].map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-[#F26B21]/10 border border-[#F26B21]/30 text-[#F26B21] text-xs font-mono-metric grid place-items-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-2 hn-card rounded-xl p-8 space-y-5" data-testid="raise-ticket-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Customer details */}
            <Field label="Full Name" required>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required value={form.customer_name} onChange={upd("customer_name")}
                  className={`${inputCls} pl-9`} placeholder="Your full name" data-testid="rt-name" />
              </div>
            </Field>
            <Field label="Customer / Subscriber ID">
              <div className="relative">
                <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={form.customer_id} onChange={upd("customer_id")}
                  className={`${inputCls} pl-9`} placeholder="e.g. HN-001234" data-testid="rt-cid" />
              </div>
            </Field>
            <Field label="Phone" required>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required value={form.customer_phone} onChange={upd("customer_phone")}
                  className={`${inputCls} pl-9`} placeholder="+91 xxxxx xxxxx" data-testid="rt-phone" />
              </div>
            </Field>
            <Field label="Email">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={form.customer_email} onChange={upd("customer_email")}
                  className={`${inputCls} pl-9`} placeholder="your@email.com" data-testid="rt-email" />
              </div>
            </Field>
            <Field label="Area / Locality" required>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required value={form.area} onChange={upd("area")}
                  className={`${inputCls} pl-9`} placeholder="e.g. Mohanpur, Midnapore" data-testid="rt-area" />
              </div>
            </Field>
            <Field label="Which Service">
              <div className="relative">
                <Wifi size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <select value={form.service_type} onChange={upd("service_type")}
                  className={`${selectCls} pl-9`} data-testid="rt-service">
                  <option value="">Select service…</option>
                  {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Issue Category">
              <select value={form.category} onChange={upd("category")} className={selectCls} data-testid="rt-category">
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </Field>
          </div>

          {/* Issue title */}
          <Field label="Issue Summary" required>
            <input required value={form.title} onChange={upd("title")}
              className={inputCls} placeholder="Brief one-line description of your issue" data-testid="rt-title" />
          </Field>

          {/* Description */}
          <Field label="Detailed Description" required>
            <textarea required rows={5} value={form.description} onChange={upd("description")}
              className={inputCls} data-testid="rt-description"
              placeholder="Describe your issue in detail — when it started, what you've tried, any error messages…" />
          </Field>

          <button type="submit" disabled={submitting} data-testid="rt-submit"
            className="hn-btn-primary inline-flex items-center gap-2 disabled:opacity-60 !px-8">
            <Send size={16} /> {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}

const InfoBlock = ({ icon: Icon, label, value }) => (
  <div className="hn-card rounded-xl p-5 flex items-start gap-4">
    <div className="w-10 h-10 rounded-md grid place-items-center bg-[#F26B21]/10 text-[#F26B21] border border-[#F26B21]/20 flex-shrink-0">
      <Icon size={18} strokeWidth={1.5} />
    </div>
    <div>
      <div className="hn-overline text-[10px]">{label}</div>
      <div className="mt-1 text-white text-sm">{value}</div>
    </div>
  </div>
);
