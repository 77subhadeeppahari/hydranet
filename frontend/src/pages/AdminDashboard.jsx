import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { LogOut, Plus, Edit3, Trash2, Mail, X, CheckCircle2, Package } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["monthly", "six_month", "twelve_month", "welcome", "ott"];
const EMPTY_PLAN = {
  name: "", category: "monthly", speed_mbps: 50, price: 500,
  validity_days: 30, validity_label: "30 Days", benefits: "",
  popular: false, display_order: 0, active: true,
};

export default function AdminDashboard() {
  const { admin, loading: authLoading, logout } = useAuth();
  const [tab, setTab] = useState("plans");
  const [plans, setPlans] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!admin) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const reload = async () => {
    setLoading(true);
    try {
      const [plansRes, contactsRes] = await Promise.all([
        api.get("/admin/plans"),
        api.get("/admin/contacts"),
      ]);
      setPlans(plansRes.data); setContacts(contactsRes.data);
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to load"); }
    finally { setLoading(false); }
  };

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
            <TabBtn active={tab === "contacts"} onClick={() => setTab("contacts")} testId="admin-tab-contacts">
              <Mail size={14} /> Enquiries {unreadCount > 0 && <span className="ml-1 font-mono-metric text-xs bg-[#F26B21] text-white px-1.5 rounded-full">{unreadCount}</span>}
            </TabBtn>
          </div>
        </div>

        {loading ? <div className="text-slate-400">Loading…</div> : (
          tab === "plans" ? (
            <PlansTable plans={plans} onEdit={(p) => { setEditing(p); setShowForm(true); }} onDelete={deletePlan} onNew={() => { setEditing(null); setShowForm(true); }} />
          ) : (
            <ContactsTable contacts={contacts} onRead={markRead} onDelete={deleteContact} />
          )
        )}
      </div>

      {showForm && <PlanForm initial={editing} onSave={savePlan} onClose={() => { setShowForm(false); setEditing(null); }} />}
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
