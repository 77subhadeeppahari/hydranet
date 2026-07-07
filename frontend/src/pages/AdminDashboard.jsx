import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { LogOut, Plus, Edit3, Trash2, Mail, X, CheckCircle2, Package, Users, Star, Handshake } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadField } from "../components/ImageUploadField";

const CATEGORIES = ["monthly", "six_month", "twelve_month", "welcome", "ott"];
const EMPTY_PLAN = {
  name: "", category: "monthly", speed_mbps: 50, price: 500,
  validity_days: 30, validity_label: "30 Days", benefits: "",
  popular: false, display_order: 0, active: true,
};
const EMPTY_MEMBER = {
  name: "", role: "", image_url: "", bio: "",
  linkedin: "", twitter: "", email: "",
  display_order: 0, active: true,
};
const EMPTY_TESTIMONIAL = {
  name: "", location: "", rating: 5, quote: "", image_url: "",
  display_order: 0, active: true,
};

export default function AdminDashboard() {
  const { admin, loading: authLoading, logout } = useAuth();
  const [tab, setTab] = useState("plans");
  const [plans, setPlans] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [editingT, setEditingT] = useState(null);
  const [showTForm, setShowTForm] = useState(false);
  const [partnerEnquiries, setPartnerEnquiries] = useState([]);

  useEffect(() => {
    if (!admin) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const reload = async () => {
    setLoading(true);
    try {
      const [plansRes, contactsRes, teamRes, tRes, pRes] = await Promise.all([
        api.get("/admin/plans"),
        api.get("/admin/contacts"),
        api.get("/admin/team"),
        api.get("/admin/testimonials"),
        api.get("/admin/partner-enquiries"),
      ]);
      setPlans(plansRes.data); setContacts(contactsRes.data); setTeam(teamRes.data); setTestimonials(tRes.data); setPartnerEnquiries(pRes.data);
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to load"); }
    finally { setLoading(false); }
  };

  const markPartnerRead = async (id) => { try { await api.patch(`/admin/partner-enquiries/${id}/read`); reload(); } catch { toast.error("Failed"); } };
  const deletePartner = async (id) => { if (!window.confirm("Delete this enquiry?")) return; try { await api.delete(`/admin/partner-enquiries/${id}`); reload(); toast.success("Deleted"); } catch { toast.error("Failed"); } };

  if (authLoading) return <div className="min-h-screen grid place-items-center text-slate-400">Loading…</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  const savePlan = async (data) => {
    try {
      if (editing?.id) {
        await api.patch(`/admin/plans/${editing.id}`, data);
        toast.success("Plan updated");
      } else {
        await api.post("/admin/plans", data);
        toast.success("Plan created");
      }
      setShowForm(false); setEditing(null); reload();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Delete this plan permanently?")) return;
    try {
      await api.delete(`/admin/plans/${id}`);
      toast.success("Plan deleted"); reload();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Delete failed"); }
  };

  const markRead = async (id) => {
    try { await api.patch(`/admin/contacts/${id}/read`); reload(); }
    catch (err) { toast.error("Failed"); }
  };
  const deleteContact = async (id) => {
    if (!window.confirm("Delete this enquiry?")) return;
    try { await api.delete(`/admin/contacts/${id}`); reload(); toast.success("Deleted"); }
    catch (err) { toast.error("Failed"); }
  };

  const saveMember = async (data) => {
    try {
      if (editingMember?.id) {
        await api.patch(`/admin/team/${editingMember.id}`, data);
        toast.success("Team member updated");
      } else {
        await api.post("/admin/team", data);
        toast.success("Team member added");
      }
      setShowMemberForm(false); setEditingMember(null); reload();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };
  const deleteMember = async (id) => {
    if (!window.confirm("Remove this team member?")) return;
    try { await api.delete(`/admin/team/${id}`); reload(); toast.success("Member removed"); }
    catch (err) { toast.error("Failed"); }
  };

  const saveTestimonial = async (data) => {
    try {
      if (editingT?.id) { await api.patch(`/admin/testimonials/${editingT.id}`, data); toast.success("Testimonial updated"); }
      else { await api.post("/admin/testimonials", data); toast.success("Testimonial added"); }
      setShowTForm(false); setEditingT(null); reload();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };
  const deleteTestimonial = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try { await api.delete(`/admin/testimonials/${id}`); reload(); toast.success("Deleted"); }
    catch (err) { toast.error("Failed"); }
  };

  const unreadCount = contacts.filter((c) => !c.read).length;

  return (
    <div className="min-h-screen bg-[#020617]" data-testid="admin-dashboard">
      {/* Top bar */}
      <div className="border-b border-white/5 hn-glass sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="hn-overline hidden sm:block">Admin · Control Room</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-slate-400 hover:text-white">View Site</Link>
            <button onClick={logout} data-testid="admin-logout-btn" className="hn-btn-secondary inline-flex items-center gap-2 !py-2 !px-4 text-sm">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Welcome, {admin.username}</h1>
            <p className="text-slate-400 text-sm mt-1">Manage plan pricing and customer enquiries.</p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full border border-white/10 bg-[#0F172A]/60">
            <TabBtn active={tab === "plans"} onClick={() => setTab("plans")} testId="admin-tab-plans">
              <Package size={14} /> Plans <span className="font-mono-metric text-xs text-slate-500">({plans.length})</span>
            </TabBtn>
            <TabBtn active={tab === "team"} onClick={() => setTab("team")} testId="admin-tab-team">
              <Users size={14} /> Team <span className="font-mono-metric text-xs text-slate-500">({team.length})</span>
            </TabBtn>
            <TabBtn active={tab === "testimonials"} onClick={() => setTab("testimonials")} testId="admin-tab-testimonials">
              <Star size={14} /> Reviews <span className="font-mono-metric text-xs text-slate-500">({testimonials.length})</span>
            </TabBtn>
            <TabBtn active={tab === "partners"} onClick={() => setTab("partners")} testId="admin-tab-partners">
              <Handshake size={14} /> Partners {partnerEnquiries.filter(p => !p.read).length > 0 && <span className="ml-1 font-mono-metric text-xs bg-[#F26B21] text-white px-1.5 rounded-full">{partnerEnquiries.filter(p => !p.read).length}</span>}
            </TabBtn>
            <TabBtn active={tab === "contacts"} onClick={() => setTab("contacts")} testId="admin-tab-contacts">
              <Mail size={14} /> Enquiries {unreadCount > 0 && <span className="ml-1 font-mono-metric text-xs bg-[#F26B21] text-white px-1.5 rounded-full">{unreadCount}</span>}
            </TabBtn>
          </div>
        </div>

        {loading ? <div className="text-slate-400">Loading…</div> : (
          tab === "plans" ? (
            <PlansTable plans={plans} onEdit={(p) => { setEditing(p); setShowForm(true); }} onDelete={deletePlan} onNew={() => { setEditing(null); setShowForm(true); }} />
          ) : tab === "team" ? (
            <TeamTable team={team} onEdit={(m) => { setEditingMember(m); setShowMemberForm(true); }} onDelete={deleteMember} onNew={() => { setEditingMember(null); setShowMemberForm(true); }} />
          ) : tab === "testimonials" ? (
            <TestimonialsTable items={testimonials} onEdit={(t) => { setEditingT(t); setShowTForm(true); }} onDelete={deleteTestimonial} onNew={() => { setEditingT(null); setShowTForm(true); }} />
          ) : tab === "partners" ? (
            <PartnerEnquiriesTable items={partnerEnquiries} onRead={markPartnerRead} onDelete={deletePartner} />
          ) : (
            <ContactsTable contacts={contacts} onRead={markRead} onDelete={deleteContact} />
          )
        )}
      </div>

      {showForm && <PlanForm initial={editing} onSave={savePlan} onClose={() => { setShowForm(false); setEditing(null); }} />}
      {showMemberForm && <MemberForm initial={editingMember} onSave={saveMember} onClose={() => { setShowMemberForm(false); setEditingMember(null); }} />}
      {showTForm && <TestimonialForm initial={editingT} onSave={saveTestimonial} onClose={() => { setShowTForm(false); setEditingT(null); }} />}
    </div>
  );
}

const TabBtn = ({ active, onClick, children, testId }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className={`px-4 py-2 text-sm rounded-full font-medium inline-flex items-center gap-2 transition-all ${active ? "bg-[#F26B21] text-white" : "text-slate-300 hover:text-white"}`}
  >{children}</button>
);

function PlansTable({ plans, onEdit, onDelete, onNew }) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={onNew} data-testid="admin-new-plan-btn" className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2">
          <Plus size={14} /> New Plan
        </button>
      </div>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm" data-testid="admin-plans-table">
          <thead className="bg-[#0F172A] text-slate-400">
            <tr>
              <Th>Name</Th><Th>Category</Th><Th>Speed</Th><Th>Price ₹</Th><Th>Validity</Th><Th>Popular</Th><Th>Active</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02]" data-testid={`admin-plan-row-${p.id}`}>
                <Td className="font-medium text-white">{p.name}</Td>
                <Td className="font-mono-metric text-xs uppercase text-[#F26B21]">{p.category}</Td>
                <Td className="font-mono-metric">{p.speed_mbps} Mbps</Td>
                <Td className="font-mono-metric text-white">₹{p.price.toLocaleString("en-IN")}</Td>
                <Td className="text-slate-400 text-xs">{p.validity_label}</Td>
                <Td>{p.popular ? <span className="text-[#F26B21]">★</span> : <span className="text-slate-600">–</span>}</Td>
                <Td>{p.active ? <span className="text-emerald-400">●</span> : <span className="text-slate-600">●</span>}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(p)} data-testid={`admin-edit-${p.id}`} className="p-2 rounded-md hover:bg-white/5 text-slate-300"><Edit3 size={14} /></button>
                    <button onClick={() => onDelete(p.id)} data-testid={`admin-delete-${p.id}`} className="p-2 rounded-md hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContactsTable({ contacts, onRead, onDelete }) {
  if (contacts.length === 0) return <div className="text-slate-400 py-12 text-center">No enquiries yet.</div>;
  return (
    <div className="space-y-3" data-testid="admin-contacts-list">
      {contacts.map((c) => (
        <div key={c.id} className={`hn-card rounded-xl p-6 ${!c.read ? "border-[#F26B21]/40" : ""}`} data-testid={`admin-contact-${c.id}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-semibold text-white">{c.name}</span>
                {!c.read && <span className="font-mono-metric text-[10px] uppercase tracking-widest bg-[#F26B21]/20 text-[#F26B21] px-2 py-0.5 rounded-full">New</span>}
              </div>
              <div className="text-slate-400 text-sm mt-1">{c.email} · {c.phone}</div>
              {c.subject && <div className="text-slate-300 text-sm mt-2 font-medium">{c.subject}</div>}
              <div className="text-slate-400 text-sm mt-3 whitespace-pre-line leading-relaxed">{c.message}</div>
            </div>
            <div className="flex items-center gap-2">
              {!c.read && (
                <button onClick={() => onRead(c.id)} className="p-2 rounded-md hover:bg-white/5 text-emerald-400" title="Mark read" data-testid={`admin-contact-read-${c.id}`}>
                  <CheckCircle2 size={16} />
                </button>
              )}
              <button onClick={() => onDelete(c.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-400" data-testid={`admin-contact-delete-${c.id}`}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const Th = ({ children }) => <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-mono-metric font-medium">{children}</th>;
const Td = ({ children, className = "" }) => <td className={`px-4 py-3 text-slate-300 ${className}`}>{children}</td>;

function PlanForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_PLAN });
  const upd = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };
  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      speed_mbps: Number(form.speed_mbps),
      price: Number(form.price),
      validity_days: Number(form.validity_days),
      display_order: Number(form.display_order),
    });
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" data-testid="admin-plan-form-modal">
      <div className="w-full max-w-2xl hn-card rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">{initial ? "Edit Plan" : "New Plan"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400" data-testid="admin-form-close"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name"><input required value={form.name} onChange={upd("name")} data-testid="admin-form-name" className={inputCls} /></FormField>
          <FormField label="Category">
            <select value={form.category} onChange={upd("category")} data-testid="admin-form-category" className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Speed (Mbps)"><input required type="number" value={form.speed_mbps} onChange={upd("speed_mbps")} data-testid="admin-form-speed" className={inputCls} /></FormField>
          <FormField label="Price ₹"><input required type="number" step="1" value={form.price} onChange={upd("price")} data-testid="admin-form-price" className={inputCls} /></FormField>
          <FormField label="Validity (days)"><input required type="number" value={form.validity_days} onChange={upd("validity_days")} data-testid="admin-form-validity-days" className={inputCls} /></FormField>
          <FormField label="Validity Label"><input required value={form.validity_label} onChange={upd("validity_label")} data-testid="admin-form-validity-label" className={inputCls} /></FormField>
          <FormField label="Display Order"><input type="number" value={form.display_order} onChange={upd("display_order")} data-testid="admin-form-order" className={inputCls} /></FormField>
          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.popular} onChange={upd("popular")} data-testid="admin-form-popular" /> Popular</label>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.active} onChange={upd("active")} data-testid="admin-form-active" /> Active</label>
          </div>
          <div className="md:col-span-2">
            <FormField label="Benefits"><textarea rows={3} value={form.benefits} onChange={upd("benefits")} data-testid="admin-form-benefits" className={inputCls} /></FormField>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" data-testid="admin-form-save" className="hn-btn-primary text-sm !py-2">Save Plan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-3 py-2.5 text-white text-sm";
const FormField = ({ label, children }) => (
  <div>
    <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">{label}</label>
    {children}
  </div>
);

function PartnerEnquiriesTable({ items, onRead, onDelete }) {
  if (items.length === 0) return <div className="text-slate-400 py-12 text-center">No partner enquiries yet.</div>;
  return (
    <div className="space-y-3" data-testid="admin-partners-list">
      {items.map((p) => (
        <div key={p.id} className={`hn-card rounded-xl p-6 ${!p.read ? "border-[#F26B21]/40" : ""}`} data-testid={`admin-partner-${p.id}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-display text-lg font-semibold text-white">{p.name}</span>
                {p.company && <span className="text-slate-400 text-sm">· {p.company}</span>}
                {!p.read && <span className="font-mono-metric text-[10px] uppercase tracking-widest bg-[#F26B21]/20 text-[#F26B21] px-2 py-0.5 rounded-full">New</span>}
              </div>
              <div className="text-slate-400 text-sm mt-1">{p.email} · {p.phone} · {p.city || 'City n/a'}</div>
              <div className="text-[#F26B21] text-xs uppercase tracking-widest font-mono-metric mt-2">{p.partnership_type}</div>
              <div className="text-slate-400 text-sm mt-3 whitespace-pre-line leading-relaxed">{p.message}</div>
            </div>
            <div className="flex items-center gap-2">
              {!p.read && <button onClick={() => onRead(p.id)} className="p-2 rounded-md hover:bg-white/5 text-emerald-400" data-testid={`admin-partner-read-${p.id}`}><CheckCircle2 size={16} /></button>}
              <button onClick={() => onDelete(p.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-400" data-testid={`admin-partner-delete-${p.id}`}><Trash2 size={16} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamTable({ team, onEdit, onDelete, onNew }) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={onNew} data-testid="admin-new-member-btn" className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2">
          <Plus size={14} /> New Member
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="admin-team-list">
        {team.map((m) => (
          <div key={m.id} className="hn-card rounded-xl p-5 flex gap-4" data-testid={`admin-team-row-${m.id}`}>
            {m.image_url ? (
              <img src={m.image_url} alt={m.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-[#020617] border border-white/10 grid place-items-center text-slate-600 text-xs flex-shrink-0">no img</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-white truncate">{m.name}</div>
              <div className="text-xs uppercase tracking-widest font-mono-metric text-[#F26B21] mt-0.5">{m.role}</div>
              <div className="mt-1 text-xs text-slate-500">Order: {m.display_order} · {m.active ? <span className="text-emerald-400">Active</span> : <span className="text-slate-500">Hidden</span>}</div>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => onEdit(m)} data-testid={`admin-team-edit-${m.id}`} className="p-2 rounded-md hover:bg-white/5 text-slate-300"><Edit3 size={14} /></button>
              <button onClick={() => onDelete(m.id)} data-testid={`admin-team-delete-${m.id}`} className="p-2 rounded-md hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsTable({ items, onEdit, onDelete, onNew }) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={onNew} data-testid="admin-new-testimonial-btn" className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2">
          <Plus size={14} /> New Testimonial
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="admin-testimonials-list">
        {items.map((t) => (
          <div key={t.id} className="hn-card rounded-xl p-5 flex gap-4" data-testid={`admin-t-row-${t.id}`}>
            {t.image_url ? (
              <img src={t.image_url} alt={t.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#020617] border border-white/10 grid place-items-center text-slate-600 text-xs flex-shrink-0">no img</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-display font-semibold text-white truncate">{t.name}</div>
                <div className="flex items-center">{Array.from({length: t.rating}).map((_,i) => <Star key={i} size={11} className="fill-[#F26B21] text-[#F26B21]" />)}</div>
              </div>
              <div className="text-xs uppercase tracking-widest font-mono-metric text-[#F26B21] mt-0.5">{t.location}</div>
              <div className="text-slate-400 text-sm mt-2 line-clamp-2">"{t.quote}"</div>
              <div className="mt-2 text-xs text-slate-500">Order: {t.display_order} · {t.active ? <span className="text-emerald-400">Active</span> : <span className="text-slate-500">Hidden</span>}</div>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => onEdit(t)} data-testid={`admin-t-edit-${t.id}`} className="p-2 rounded-md hover:bg-white/5 text-slate-300"><Edit3 size={14} /></button>
              <button onClick={() => onDelete(t.id)} data-testid={`admin-t-delete-${t.id}`} className="p-2 rounded-md hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_TESTIMONIAL });
  const upd = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };
  const submit = (e) => {
    e.preventDefault();
    onSave({ ...form, rating: Number(form.rating), display_order: Number(form.display_order) });
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" data-testid="admin-t-form-modal">
      <div className="w-full max-w-2xl hn-card rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">{initial ? "Edit Testimonial" : "New Testimonial"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400" data-testid="admin-t-form-close"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Customer Name"><input required value={form.name} onChange={upd("name")} data-testid="admin-t-name" className={inputCls} /></FormField>
          <FormField label="Location"><input value={form.location} onChange={upd("location")} data-testid="admin-t-location" className={inputCls} placeholder="e.g., Mohanpur" /></FormField>
          <div className="md:col-span-2"><FormField label="Photo (URL or Upload)"><ImageUploadField value={form.image_url} onChange={(v) => setForm((f) => ({ ...f, image_url: v }))} testId="admin-t-image" /></FormField></div>
          <div className="md:col-span-2"><FormField label="Quote"><textarea required rows={4} value={form.quote} onChange={upd("quote")} data-testid="admin-t-quote" className={inputCls} /></FormField></div>
          <FormField label="Rating (1-5)"><input type="number" min="1" max="5" value={form.rating} onChange={upd("rating")} data-testid="admin-t-rating" className={inputCls} /></FormField>
          <FormField label="Display Order"><input type="number" value={form.display_order} onChange={upd("display_order")} data-testid="admin-t-order" className={inputCls} /></FormField>
          <div className="md:col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.active} onChange={upd("active")} data-testid="admin-t-active" /> Active (visible on Home)</label>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" data-testid="admin-t-save" className="hn-btn-primary text-sm !py-2">Save Testimonial</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_MEMBER });
  const upd = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };
  const submit = (e) => {
    e.preventDefault();
    onSave({ ...form, display_order: Number(form.display_order) });
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" data-testid="admin-member-form-modal">
      <div className="w-full max-w-2xl hn-card rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">{initial ? "Edit Team Member" : "New Team Member"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400" data-testid="admin-member-form-close"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name"><input required value={form.name} onChange={upd("name")} data-testid="admin-member-name" className={inputCls} /></FormField>
          <FormField label="Role"><input required value={form.role} onChange={upd("role")} data-testid="admin-member-role" className={inputCls} /></FormField>
          <div className="md:col-span-2"><FormField label="Image (URL or Upload)"><ImageUploadField value={form.image_url} onChange={(v) => setForm((f) => ({ ...f, image_url: v }))} testId="admin-member-image" /></FormField></div>
          <div className="md:col-span-2"><FormField label="Short Bio"><textarea rows={2} value={form.bio} onChange={upd("bio")} data-testid="admin-member-bio" className={inputCls} /></FormField></div>
          <FormField label="LinkedIn URL"><input value={form.linkedin} onChange={upd("linkedin")} data-testid="admin-member-linkedin" className={inputCls} /></FormField>
          <FormField label="Twitter URL"><input value={form.twitter} onChange={upd("twitter")} data-testid="admin-member-twitter" className={inputCls} /></FormField>
          <FormField label="Email"><input type="email" value={form.email} onChange={upd("email")} data-testid="admin-member-email" className={inputCls} /></FormField>
          <FormField label="Display Order"><input type="number" value={form.display_order} onChange={upd("display_order")} data-testid="admin-member-order" className={inputCls} /></FormField>
          <div className="md:col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.active} onChange={upd("active")} data-testid="admin-member-active" /> Active (visible on Team page)</label>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" data-testid="admin-member-save" className="hn-btn-primary text-sm !py-2">Save Member</button>
          </div>
        </form>
      </div>
    </div>
  );
}
