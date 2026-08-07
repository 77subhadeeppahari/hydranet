import { useState } from "react";
import { api, formatApiErrorDetail } from "../lib/api";
import { Plus, Edit3, Trash2, X, ShieldCheck, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

// ─── Permission definitions ────────────────────────────────────────────────────
export const ALL_PERMISSIONS = [
  { key: "tickets_read",     label: "View Tickets",          group: "Tickets",    desc: "Can view all support tickets and their details" },
  { key: "tickets_write",    label: "Manage Tickets",         group: "Tickets",    desc: "Can create, edit, close, and delete support tickets" },
  { key: "content_write",    label: "Manage Content",         group: "Content",    desc: "Can manage plans, team members, and testimonials" },
  { key: "finance_read",     label: "View Finances",          group: "Finance",    desc: "Can view expense records and download financial reports" },
  { key: "finance_write",    label: "Manage Finances",        group: "Finance",    desc: "Can add, edit, and delete expense entries" },
  { key: "attendance_read",  label: "View Attendance",        group: "Attendance", desc: "Can view staff records and attendance logs" },
  { key: "attendance_write", label: "Manage Attendance",      group: "Attendance", desc: "Can add/edit staff members and log attendance" },
  { key: "users_manage",     label: "Manage Users & Roles",   group: "Admin",      desc: "Can create/edit/delete admin users and custom roles" },
];

const PERM_GROUPS = ["Tickets", "Content", "Finance", "Attendance", "Admin"];

const inputCls = "w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-3 py-2.5 text-white text-sm";
const FormField = ({ label, children }) => (
  <div>
    <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">{label}</label>
    {children}
  </div>
);

const EMPTY_ROLE = { name: "", label: "", description: "", permissions: [] };

// Colour per group
const GROUP_COLOR = { Tickets: "#3B82F6", Content: "#F59E0B", Finance: "#10B981", Attendance: "#F26B21", Admin: "#8B5CF6" };
const SYSTEM_BADGE_COLOR = { super_admin: "#8B5CF6", admin: "#F26B21", support: "#3B82F6" };

// ─── Main Component ────────────────────────────────────────────────────────────
export function RolesTab({ roles, onReload }) {
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);

  const deleteRole = async (id, name) => {
    if (!window.confirm(`Delete role "${name}"? This cannot be undone.`)) return;
    try { await api.delete(`/admin/roles/${id}`); toast.success("Role deleted"); onReload(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Delete failed"); }
  };

  const saveRole = async (data) => {
    try {
      if (editing?.id) {
        await api.patch(`/admin/roles/${editing.id}`, data);
        toast.success("Role updated");
      } else {
        await api.post("/admin/roles", data);
        toast.success("Role created");
      }
      setShowForm(false); setEditing(null); onReload();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Define roles and their permission sets. System roles cannot be edited.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2">
          <Plus size={14} /> New Role
        </button>
      </div>

      {/* Permission Matrix */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="bg-[#0F172A] px-5 py-3 border-b border-white/5">
          <p className="text-xs uppercase tracking-widest font-mono-metric text-slate-400">Permission Matrix</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#020617]">
              <tr>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest font-mono-metric text-slate-500 w-56">Permission</th>
                {roles.map(r => (
                  <th key={r.id || r.name} className="text-center px-3 py-3 text-xs font-mono-metric min-w-[110px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full text-xs"
                        style={{ backgroundColor: (r.is_system ? (SYSTEM_BADGE_COLOR[r.name] || "#6B7280") : "#6366F1") + "22",
                                 color: r.is_system ? (SYSTEM_BADGE_COLOR[r.name] || "#6B7280") : "#6366F1" }}>
                        {r.label || r.name}
                      </span>
                      {r.is_system && <span className="text-[10px] text-slate-600 font-mono-metric">system</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ALL_PERMISSIONS.map(p => (
                <tr key={p.key} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GROUP_COLOR[p.group] }} />
                      <div>
                        <div className="text-white text-xs font-medium">{p.label}</div>
                        <div className="text-slate-600 text-xs">{p.desc}</div>
                      </div>
                    </div>
                  </td>
                  {roles.map(r => (
                    <td key={r.id || r.name} className="px-3 py-3 text-center">
                      {r.permissions?.includes(p.key) ? (
                        <span className="text-emerald-400 flex justify-center"><ShieldCheck size={16} /></span>
                      ) : (
                        <span className="text-slate-700 flex justify-center"><Lock size={14} /></span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(r => {
          const isCustom = !r.is_system;
          const color = r.is_system ? (SYSTEM_BADGE_COLOR[r.name] || "#6B7280") : "#6366F1";
          return (
            <div key={r.id || r.name} className="rounded-xl border border-white/10 p-5 bg-[#0F172A]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-white">{r.label || r.name}</span>
                    {r.is_system
                      ? <span className="text-xs font-mono-metric px-1.5 py-0.5 rounded text-slate-500 bg-slate-500/10">system</span>
                      : <span className="text-xs font-mono-metric px-1.5 py-0.5 rounded text-indigo-400 bg-indigo-400/10">custom</span>}
                  </div>
                  <div className="text-xs text-slate-500 font-mono-metric mt-0.5">/{r.name}</div>
                </div>
                {isCustom && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditing(r); setShowForm(true); }} className="p-1.5 rounded hover:bg-white/5 text-slate-400"><Edit3 size={13} /></button>
                    <button onClick={() => deleteRole(r.id, r.label || r.name)} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
              {r.description && <p className="text-slate-400 text-xs mb-3">{r.description}</p>}
              <div className="flex flex-wrap gap-1.5">
                {(r.permissions || []).map(pk => {
                  const pm = ALL_PERMISSIONS.find(p => p.key === pk);
                  return pm ? (
                    <span key={pk} className="text-xs px-2 py-0.5 rounded-full font-mono-metric"
                      style={{ backgroundColor: GROUP_COLOR[pm.group] + "22", color: GROUP_COLOR[pm.group] }}>
                      {pm.label}
                    </span>
                  ) : null;
                })}
                {(!r.permissions || r.permissions.length === 0) && (
                  <span className="text-xs text-slate-600 flex items-center gap-1"><Unlock size={11} /> No permissions assigned</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <RoleForm initial={editing} onSave={saveRole} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

// ─── Role Form Modal ───────────────────────────────────────────────────────────
function RoleForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial
    ? { label: initial.label, description: initial.description || "", permissions: [...(initial.permissions || [])] }
    : { ...EMPTY_ROLE });
  const isEdit = !!initial;

  const togglePerm = (key) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key],
    }));
  };

  const submit = e => {
    e.preventDefault();
    const payload = isEdit
      ? { label: form.label, description: form.description, permissions: form.permissions }
      : { name: form.name, label: form.label, description: form.description, permissions: form.permissions };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-lg hn-card rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">{isEdit ? `Edit Role: ${initial.label}` : "New Role"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-5">
          {!isEdit && (
            <FormField label="Role Key (internal name, no spaces)">
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") }))}
                className={inputCls} placeholder="e.g. field_tech" pattern="[a-z0-9_]+" />
              <p className="text-xs text-slate-600 mt-1">Lowercase letters, numbers and underscores only.</p>
            </FormField>
          )}
          <FormField label="Display Label">
            <input required value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className={inputCls} placeholder="e.g. Field Technician" />
          </FormField>
          <FormField label="Description (optional)">
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="Short description of this role" />
          </FormField>

          {/* Permissions */}
          <div>
            <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-3">Permissions</label>
            <div className="space-y-4">
              {PERM_GROUPS.map(group => {
                const perms = ALL_PERMISSIONS.filter(p => p.group === group);
                return (
                  <div key={group}>
                    <div className="text-xs font-mono-metric mb-2" style={{ color: GROUP_COLOR[group] }}>{group}</div>
                    <div className="space-y-2">
                      {perms.map(p => (
                        <label key={p.key} className="flex items-start gap-3 cursor-pointer group">
                          <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePerm(p.key)}
                            className="mt-0.5 accent-[#F26B21] cursor-pointer" />
                          <div>
                            <div className="text-sm text-white group-hover:text-[#F26B21] transition-colors">{p.label}</div>
                            <div className="text-xs text-slate-600">{p.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" className="hn-btn-primary text-sm !py-2">{isEdit ? "Save Changes" : "Create Role"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
