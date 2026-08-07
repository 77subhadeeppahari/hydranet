import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import {
  LogOut, Plus, Edit3, Trash2, Mail, X, CheckCircle2, Package, Users,
  Star, Handshake, Ticket as TicketIcon, ShieldCheck, MessageSquarePlus,
  ChevronDown, Clock, AlertCircle, CheckCircle, XCircle, Settings, Tag,
  IndianRupee, UserCheck, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUploadField } from "../components/ImageUploadField";
import { FinanceTab } from "./FinanceTab";
import { AttendanceTab } from "./AttendanceTab";
import { RolesTab } from "./RolesTab";

// ─── Constants ────────────────────────────────────────────────────────────────
const PLAN_CATEGORIES = ["monthly", "six_month", "twelve_month", "welcome", "ott"];
const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"];
const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"];
const SERVICE_TYPES = [
  { value: "fiber",    label: "Fiber Broadband" },
  { value: "wireless", label: "Wireless Internet" },
  { value: "ott",      label: "OTT / Streaming" },
  { value: "other",    label: "Other" },
];
const SLA_OPTIONS = [
  { value: "",    label: "No SLA" },
  { value: "4h",  label: "4 Hours" },
  { value: "8h",  label: "8 Hours" },
  { value: "24h", label: "24 Hours" },
  { value: "48h", label: "48 Hours" },
  { value: "72h", label: "72 Hours" },
];

const EMPTY_PLAN = { name: "", category: "monthly", speed_mbps: 50, price: 500, validity_days: 30, validity_label: "30 Days", benefits: "", popular: false, display_order: 0, active: true };
const EMPTY_MEMBER = { name: "", role: "", image_url: "", bio: "", linkedin: "", twitter: "", email: "", display_order: 0, active: true };
const EMPTY_TESTIMONIAL = { name: "", location: "", rating: 5, quote: "", image_url: "", display_order: 0, active: true };
const EMPTY_TICKET = { title: "", description: "", priority: "medium", category: "", customer_name: "", customer_email: "", customer_phone: "", customer_id: "", area: "", service_type: "", sla: "", assigned_to: "" };
const EMPTY_USER = { username: "", password: "", recovery_email: "", role: "support" };
const EMPTY_CATEGORY = { name: "", description: "", color: "#F26B21", active: true, display_order: 0 };

const STATUS_META = {
  open:        { label: "Open",        cls: "text-blue-400 bg-blue-400/10",     Icon: AlertCircle },
  in_progress: { label: "In Progress", cls: "text-yellow-400 bg-yellow-400/10", Icon: Clock },
  resolved:    { label: "Resolved",    cls: "text-emerald-400 bg-emerald-400/10", Icon: CheckCircle },
  closed:      { label: "Closed",      cls: "text-slate-400 bg-slate-400/10",   Icon: XCircle },
};
const PRIORITY_CLS = { low: "text-slate-400", medium: "text-yellow-400", high: "text-orange-400", urgent: "text-red-400" };
const ROLE_CLS = { super_admin: "text-purple-400 bg-purple-400/10", admin: "text-[#F26B21] bg-[#F26B21]/10", support: "text-blue-400 bg-blue-400/10" };

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { admin, loading: authLoading, logout } = useAuth();
  const [tab, setTab] = useState("tickets");
  const [loading, setLoading] = useState(true);

  const [plans, setPlans] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [partnerEnquiries, setPartnerEnquiries] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingT, setEditingT] = useState(null);
  const [showTForm, setShowTForm] = useState(false);

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketDetail, setTicketDetail] = useState(null);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => { if (admin) reload(); }, [admin]); // eslint-disable-line

  const reload = async () => {
    setLoading(true);
    try {
      const permissions = admin?.permissions || [];
      const isSuperAdmin = admin?.role === "super_admin";
      const canContentRead = permissions.includes("content_read") || isSuperAdmin;
      const canTicketsRead = permissions.includes("tickets_read") || isSuperAdmin;
      const canUsersManage = permissions.includes("users_manage") || isSuperAdmin;

      const requests = {};
      if (canContentRead) {
        requests.plans = api.get("/admin/plans");
        requests.contacts = api.get("/admin/contacts");
        requests.team = api.get("/admin/team");
        requests.testimonials = api.get("/admin/testimonials");
        requests.partnerEnquiries = api.get("/admin/partner-enquiries");
      }
      if (canTicketsRead) {
        requests.tickets = api.get("/admin/tickets");
        requests.categories = api.get("/admin/ticket-categories");
      }
      if (isSuperAdmin || canUsersManage) requests.users = api.get("/admin/users");
      if (canUsersManage) requests.roles = api.get("/admin/roles");

      const results = await Promise.all(
        Object.entries(requests).map(async ([key, request]) => [key, (await request).data]),
      );
      const data = Object.fromEntries(results);
      setPlans(data.plans || []);
      setContacts(data.contacts || []);
      setTeam(data.team || []);
      setTestimonials(data.testimonials || []);
      setPartnerEnquiries(data.partnerEnquiries || []);
      setTickets(data.tickets || []);
      setCategories(data.categories || []);
      setUsers(data.users || []);
      setRoles(data.roles || []);
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to load"); }
    finally { setLoading(false); }
  };

  // ── Plans ──
  const savePlan = async (data) => {
    try {
      if (editing?.id) { await api.patch(`/admin/plans/${editing.id}`, data); toast.success("Plan updated"); }
      else { await api.post("/admin/plans", data); toast.success("Plan created"); }
      setShowForm(false); setEditing(null); reload();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };
  const deletePlan = async (id) => {
    if (!window.confirm("Delete this plan permanently?")) return;
    try { await api.delete(`/admin/plans/${id}`); toast.success("Plan deleted"); reload(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Delete failed"); }
  };

  // ── Contacts ──
  const markRead = async (id) => { try { await api.patch(`/admin/contacts/${id}/read`); reload(); } catch { toast.error("Failed"); } };
  const deleteContact = async (id) => {
    if (!window.confirm("Delete this enquiry?")) return;
    try { await api.delete(`/admin/contacts/${id}`); reload(); toast.success("Deleted"); } catch { toast.error("Failed"); }
  };

  // ── Team ──
  const saveMember = async (data) => {
    try {
      if (editingMember?.id) { await api.patch(`/admin/team/${editingMember.id}`, data); toast.success("Member updated"); }
      else { await api.post("/admin/team", data); toast.success("Member added"); }
      setShowMemberForm(false); setEditingMember(null); reload();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };
  const deleteMember = async (id) => {
    if (!window.confirm("Remove this team member?")) return;
    try { await api.delete(`/admin/team/${id}`); reload(); toast.success("Member removed"); } catch { toast.error("Failed"); }
  };

  // ── Testimonials ──
  const saveTestimonial = async (data) => {
    try {
      if (editingT?.id) { await api.patch(`/admin/testimonials/${editingT.id}`, data); toast.success("Testimonial updated"); }
      else { await api.post("/admin/testimonials", data); toast.success("Testimonial added"); }
      setShowTForm(false); setEditingT(null); reload();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };
  const deleteTestimonial = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try { await api.delete(`/admin/testimonials/${id}`); reload(); toast.success("Deleted"); } catch { toast.error("Failed"); }
  };

  // ── Partners ──
  const markPartnerRead = async (id) => { try { await api.patch(`/admin/partner-enquiries/${id}/read`); reload(); } catch { toast.error("Failed"); } };
  const deletePartner = async (id) => {
    if (!window.confirm("Delete this enquiry?")) return;
    try { await api.delete(`/admin/partner-enquiries/${id}`); reload(); toast.success("Deleted"); } catch { toast.error("Failed"); }
  };

  // ── Tickets ──
  const saveTicket = async (data) => {
    try { await api.post("/admin/tickets", data); toast.success("Ticket created"); setShowTicketForm(false); reload(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };
  const updateTicket = async (id, data) => {
    try {
      const { data: updated } = await api.patch(`/admin/tickets/${id}`, data);
      setTickets(ts => ts.map(t => t.id === id ? updated : t));
      if (ticketDetail?.id === id) setTicketDetail(updated);
      toast.success("Updated");
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Update failed"); }
  };
  const deleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket permanently?")) return;
    try { await api.delete(`/admin/tickets/${id}`); setTicketDetail(null); reload(); toast.success("Ticket deleted"); }
    catch { toast.error("Failed"); }
  };
  const addNote = async (id, content) => {
    try {
      await api.post(`/admin/tickets/${id}/notes`, { content });
      const { data } = await api.get("/admin/tickets");
      setTickets(data);
      const updated = data.find(t => t.id === id);
      if (updated) setTicketDetail(updated);
      toast.success("Note added");
    } catch { toast.error("Failed to add note"); }
  };

  // ── Categories ──
  const saveCategory = async (data) => {
    try {
      if (editingCategory?.id) { await api.patch(`/admin/ticket-categories/${editingCategory.id}`, data); toast.success("Category updated"); }
      else { await api.post("/admin/ticket-categories", data); toast.success("Category created"); }
      setShowCategoryForm(false); setEditingCategory(null); reload();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try { await api.delete(`/admin/ticket-categories/${id}`); reload(); toast.success("Deleted"); } catch { toast.error("Failed"); }
  };

  // ── Users ──
  const saveUser = async (data) => {
    try {
      if (editingUser) { await api.patch(`/admin/users/${editingUser.username}`, data); toast.success("User updated"); }
      else { await api.post("/admin/users", data); toast.success("User created"); }
      setShowUserForm(false); setEditingUser(null); reload();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };
  const deleteUser = async (username) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    try { await api.delete(`/admin/users/${username}`); reload(); toast.success("User deleted"); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed"); }
  };

  if (authLoading) return <div className="min-h-screen grid place-items-center text-slate-400">Loading…</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;

  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  const unreadContacts = contacts.filter(c => !c.read).length;
  const unreadPartners = partnerEnquiries.filter(p => !p.read).length;
  const perms = admin.permissions || [];
  const canContentRead = perms.includes("content_read") || admin.role === "super_admin";
  const canContentWrite = perms.includes("content_write") || admin.role === "super_admin";
  const canTicketRead = perms.includes("tickets_read") || admin.role === "super_admin";
  const canTicketWrite = perms.includes("tickets_write") || admin.role === "super_admin";
  const canAttendanceRead = perms.includes("attendance_read") || admin.role === "super_admin";
  const canAttendanceWrite = perms.includes("attendance_write") || admin.role === "super_admin";
  const canFinance = perms.includes("finance_read") || admin.role === "super_admin";
  const canUsersManage = perms.includes("users_manage") || admin.role === "super_admin";
  const reloadRoles = async () => {
    try { const { data } = await api.get("/admin/roles"); setRoles(data); } catch {}
  };

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
            <button onClick={logout} className="hn-btn-secondary inline-flex items-center gap-2 !py-2 !px-4 text-sm">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Welcome, {admin.username}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-400 text-sm">Manage your broadband platform.</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono-metric capitalize ${ROLE_CLS[admin.role] || "text-slate-400 bg-slate-400/10"}`}>
                {admin.role?.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          {/* Tab bar */}
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-full border border-white/10 bg-[#0F172A]/60">
            {canTicketRead && <TabBtn active={tab === "tickets"} onClick={() => setTab("tickets")} testId="admin-tab-tickets">
              <TicketIcon size={14} /> Tickets {openTickets > 0 && <Badge>{openTickets}</Badge>}
            </TabBtn>}
            {canContentRead && <TabBtn active={tab === "plans"} onClick={() => setTab("plans")} testId="admin-tab-plans">
              <Package size={14} /> Plans
            </TabBtn>}
            {canContentRead && <TabBtn active={tab === "team"} onClick={() => setTab("team")} testId="admin-tab-team">
              <Users size={14} /> Team
            </TabBtn>}
            {canContentRead && <TabBtn active={tab === "testimonials"} onClick={() => setTab("testimonials")} testId="admin-tab-testimonials">
              <Star size={14} /> Reviews
            </TabBtn>}
            {canContentRead && <TabBtn active={tab === "partners"} onClick={() => setTab("partners")} testId="admin-tab-partners">
              <Handshake size={14} /> Partners {unreadPartners > 0 && <Badge>{unreadPartners}</Badge>}
            </TabBtn>}
            {canContentRead && <TabBtn active={tab === "contacts"} onClick={() => setTab("contacts")} testId="admin-tab-contacts">
              <Mail size={14} /> Enquiries {unreadContacts > 0 && <Badge>{unreadContacts}</Badge>}
            </TabBtn>}
            {canFinance && (
              <TabBtn active={tab === "finance"} onClick={() => setTab("finance")} testId="admin-tab-finance">
                <IndianRupee size={14} /> Finance
              </TabBtn>
            )}
            {canAttendanceRead && <TabBtn active={tab === "attendance"} onClick={() => setTab("attendance")} testId="admin-tab-attendance">
              <UserCheck size={14} /> Attendance
            </TabBtn>}
            {canUsersManage && (
              <TabBtn active={tab === "users"} onClick={() => setTab("users")} testId="admin-tab-users">
                <ShieldCheck size={14} /> Users
              </TabBtn>
            )}
            {canUsersManage && (
              <TabBtn active={tab === "roles"} onClick={() => setTab("roles")} testId="admin-tab-roles">
                <Lock size={14} /> Roles
              </TabBtn>
            )}
          </div>
        </div>

        {loading ? <div className="text-slate-400 py-12 text-center">Loading…</div> : (
          tab === "tickets" && canTicketRead ? (
            <div className="space-y-6">
              <TicketsTable
                tickets={tickets}
                categories={categories}
                adminRole={admin.role}
                permissions={perms}
                onView={setTicketDetail}
                onNew={() => setShowTicketForm(true)}
                onDelete={deleteTicket}
                onUpdate={updateTicket}
              />
              {/* Category Manager */}
              {canContentWrite && (
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <button onClick={() => setShowCategoryPanel(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-[#0F172A] hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      <Tag size={14} className="text-[#F26B21]" /> Manage Categories
                      <span className="text-xs text-slate-500 font-mono-metric">({categories.length})</span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-500 transition-transform ${showCategoryPanel ? "rotate-180" : ""}`} />
                  </button>
                  {showCategoryPanel && (
                    <div className="p-5 bg-[#020617]">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-slate-400 text-sm">Categories are used to classify tickets. Customers see these in the Support form.</p>
                        <button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}
                          className="hn-btn-primary inline-flex items-center gap-1.5 text-xs !py-1.5 !px-3">
                          <Plus size={12} /> Add Category
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categories.map(c => (
                          <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-[#0F172A]">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color || "#F26B21" }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-medium">{c.name}</div>
                              {c.description && <div className="text-slate-500 text-xs truncate">{c.description}</div>}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`text-xs font-mono-metric ${c.active ? "text-emerald-400" : "text-slate-600"}`}>
                                {c.active ? "●" : "○"}
                              </span>
                              <button onClick={() => { setEditingCategory(c); setShowCategoryForm(true); }}
                                className="p-1.5 rounded hover:bg-white/5 text-slate-400"><Edit3 size={12} /></button>
                              <button onClick={() => deleteCategory(c.id)}
                                className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : tab === "plans" && canContentRead ? (
            <PlansTable plans={plans} canWrite={canContentWrite} onEdit={(p) => { setEditing(p); setShowForm(true); }} onDelete={deletePlan} onNew={() => { setEditing(null); setShowForm(true); }} />
          ) : tab === "team" && canContentRead ? (
            <TeamTable team={team} canWrite={canContentWrite} onEdit={(m) => { setEditingMember(m); setShowMemberForm(true); }} onDelete={deleteMember} onNew={() => { setEditingMember(null); setShowMemberForm(true); }} />
          ) : tab === "testimonials" && canContentRead ? (
            <TestimonialsTable items={testimonials} canWrite={canContentWrite} onEdit={(t) => { setEditingT(t); setShowTForm(true); }} onDelete={deleteTestimonial} onNew={() => { setEditingT(null); setShowTForm(true); }} />
          ) : tab === "partners" && canContentRead ? (
            <PartnerEnquiriesTable items={partnerEnquiries} canWrite={canContentWrite} onRead={markPartnerRead} onDelete={deletePartner} />
          ) : tab === "contacts" && canContentRead ? (
            <ContactsTable contacts={contacts} canWrite={canContentWrite} onRead={markRead} onDelete={deleteContact} />
          ) : tab === "finance" && canFinance ? (
            <FinanceTab adminRole={admin.role} permissions={perms} />
          ) : tab === "attendance" && canAttendanceRead ? (
            <AttendanceTab canWrite={canAttendanceWrite} />
          ) : tab === "users" && canUsersManage ? (
            <UsersTable users={users} currentUsername={admin.username} onEdit={(u) => { setEditingUser(u); setShowUserForm(true); }} onDelete={deleteUser} onNew={() => { setEditingUser(null); setShowUserForm(true); }} roles={roles} />
          ) : tab === "roles" && canUsersManage ? (
            <RolesTab roles={roles} onReload={reloadRoles} />
          ) : null
        )}
      </div>

      {/* Modals */}
      {showForm && <PlanForm initial={editing} onSave={savePlan} onClose={() => { setShowForm(false); setEditing(null); }} />}
      {showMemberForm && <MemberForm initial={editingMember} onSave={saveMember} onClose={() => { setShowMemberForm(false); setEditingMember(null); }} />}
      {showTForm && <TestimonialForm initial={editingT} onSave={saveTestimonial} onClose={() => { setShowTForm(false); setEditingT(null); }} />}
      {showTicketForm && <TicketForm categories={categories} users={users} onSave={saveTicket} onClose={() => setShowTicketForm(false)} />}
      {ticketDetail && (
        <TicketDetailModal
          ticket={ticketDetail}
          categories={categories}
          adminRole={admin.role}
          permissions={perms}
          users={users}
          onUpdate={updateTicket}
          onDelete={deleteTicket}
          onAddNote={addNote}
          onClose={() => setTicketDetail(null)}
        />
      )}
      {showCategoryForm && (
        <CategoryForm initial={editingCategory} onSave={saveCategory} onClose={() => { setShowCategoryForm(false); setEditingCategory(null); }} />
      )}
      {showUserForm && (
        <UserForm initial={editingUser} onSave={saveUser} onClose={() => { setShowUserForm(false); setEditingUser(null); }} allRoles={roles} />
      )}
    </div>
  );
}

// ─── Shared primitives ─────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children, testId }) => (
  <button onClick={onClick} data-testid={testId}
    className={`px-4 py-2 text-sm rounded-full font-medium inline-flex items-center gap-2 transition-all ${active ? "bg-[#F26B21] text-white" : "text-slate-300 hover:text-white"}`}>
    {children}
  </button>
);
const Badge = ({ children }) => (
  <span className="ml-1 font-mono-metric text-xs bg-[#F26B21] text-white px-1.5 rounded-full">{children}</span>
);
const Th = ({ children }) => <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-mono-metric font-medium text-slate-400">{children}</th>;
const Td = ({ children, className = "" }) => <td className={`px-4 py-3 text-slate-300 ${className}`}>{children}</td>;
const inputCls = "w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-3 py-2.5 text-white text-sm";
const FormField = ({ label, children }) => (
  <div>
    <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">{label}</label>
    {children}
  </div>
);
const catColor = (categories, slug) => categories.find(c => c.slug === slug)?.color || "#6B7280";
const catName  = (categories, slug) => categories.find(c => c.slug === slug)?.name  || slug;

// ─── Tickets ──────────────────────────────────────────────────────────────────
function TicketsTable({ tickets, categories, adminRole, permissions = [], onView, onNew, onDelete, onUpdate }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const canWrite = permissions.includes("tickets_write") || adminRole === "super_admin";

  const filtered = tickets.filter(t =>
    (statusFilter === "all" || t.status === statusFilter) &&
    (priorityFilter === "all" || t.priority === priorityFilter)
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-md bg-[#0F172A] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
            <option value="all">All Statuses</option>
            {TICKET_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s]?.label}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="rounded-md bg-[#0F172A] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
            <option value="all">All Priorities</option>
            {TICKET_PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
          <span className="text-slate-500 text-xs font-mono-metric">{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        {canWrite && (
          <button onClick={onNew} className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2">
            <Plus size={14} /> New Ticket
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-slate-400 py-16 text-center rounded-xl border border-white/5">
          <TicketIcon size={32} className="mx-auto mb-3 opacity-30" />
          <p>No tickets found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-[#0F172A]">
              <tr>
                <Th>#</Th><Th>Title</Th><Th>Customer</Th><Th>Area</Th>
                <Th>Category</Th><Th>Priority</Th><Th>SLA</Th><Th>Status</Th><Th>Assigned</Th><Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(t => {
                const sm = STATUS_META[t.status] || STATUS_META.open;
                const color = catColor(categories, t.category);
                return (
                  <tr key={t.id} className="hover:bg-white/[0.02] cursor-pointer" onClick={() => onView(t)}>
                    <Td><span className="font-mono-metric text-xs text-slate-500">{t.ticket_number}</span></Td>
                    <Td className="font-medium text-white max-w-[180px] truncate">{t.title}</Td>
                    <Td>
                      <div className="text-white text-xs font-medium">{t.customer_name}</div>
                      {t.customer_id && <div className="text-slate-500 text-xs font-mono-metric">{t.customer_id}</div>}
                      {t.customer_phone && <div className="text-slate-500 text-xs">{t.customer_phone}</div>}
                    </Td>
                    <Td><span className="text-xs text-slate-400">{t.area || "—"}</span></Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono-metric px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: color + "1A", color }}>
                        {catName(categories, t.category)}
                      </span>
                    </Td>
                    <Td><span className={`text-xs font-mono-metric capitalize font-semibold ${PRIORITY_CLS[t.priority]}`}>{t.priority}</span></Td>
                    <Td><span className="text-xs font-mono-metric text-slate-400">{t.sla || "—"}</span></Td>
                    <Td>
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-mono-metric ${sm.cls}`}>
                        <sm.Icon size={11} />{sm.label}
                      </span>
                    </Td>
                    <Td><span className="text-xs text-slate-400">{t.assigned_to || "—"}</span></Td>
                    <Td onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {canWrite && t.status !== "closed" && (
                          <button title="Advance status"
                            onClick={() => onUpdate(t.id, { status: t.status === "open" ? "in_progress" : t.status === "in_progress" ? "resolved" : "closed" })}
                            className="p-1.5 rounded hover:bg-white/5 text-emerald-400"><ChevronDown size={13} /></button>
                        )}
                        {canWrite && (
                          <button onClick={() => onDelete(t.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={13} /></button>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TicketDetailModal({ ticket, categories, adminRole, permissions = [], users, onUpdate, onDelete, onAddNote, onClose }) {
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [localAssigned, setLocalAssigned] = useState(ticket.assigned_to || "");
  const canWrite = permissions.includes("tickets_write") || adminRole === "super_admin";
  const sm = STATUS_META[ticket.status] || STATUS_META.open;
  const color = catColor(categories, ticket.category);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    await onAddNote(ticket.id, noteText.trim());
    setNoteText("");
    setSavingNote(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl hn-card rounded-2xl p-8 my-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono-metric text-xs text-slate-500">{ticket.ticket_number}</span>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-mono-metric ${sm.cls}`}>
                <sm.Icon size={10} />{sm.label}
              </span>
              <span className={`text-xs font-mono-metric capitalize font-semibold ${PRIORITY_CLS[ticket.priority]}`}>{ticket.priority}</span>
              {ticket.sla && <span className="text-xs font-mono-metric text-slate-500 border border-white/10 rounded-full px-2 py-0.5">SLA: {ticket.sla}</span>}
              {ticket.category && (
                <span className="text-xs font-mono-metric px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: color + "1A", color }}>{catName(categories, ticket.category)}</span>
              )}
            </div>
            <h2 className="font-display text-xl font-bold text-white">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400 flex-shrink-0"><X size={18} /></button>
        </div>

        {/* Customer / service info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-lg bg-[#020617] border border-white/5">
          <InfoItem label="Customer" value={ticket.customer_name} bold />
          {ticket.customer_id && <InfoItem label="Customer ID" value={ticket.customer_id} mono />}
          {ticket.customer_phone && <InfoItem label="Phone" value={ticket.customer_phone} />}
          {ticket.customer_email && <InfoItem label="Email" value={ticket.customer_email} />}
          {ticket.area && <InfoItem label="Area" value={ticket.area} />}
          {ticket.service_type && <InfoItem label="Service" value={SERVICE_TYPES.find(s => s.value === ticket.service_type)?.label || ticket.service_type} accent />}
        </div>

        {/* Description */}
        <div className="mb-6">
          <div className="text-xs text-slate-500 uppercase tracking-widest font-mono-metric mb-2">Description</div>
          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</div>
        </div>

        {/* Update controls */}
        {canWrite && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <FormField label="Status">
              <select value={ticket.status} onChange={e => onUpdate(ticket.id, { status: e.target.value })} className={inputCls}>
                {TICKET_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s]?.label}</option>)}
              </select>
            </FormField>
            <FormField label="Priority">
              <select value={ticket.priority} onChange={e => onUpdate(ticket.id, { priority: e.target.value })} className={inputCls}>
                {TICKET_PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </FormField>
            <FormField label="SLA">
              <select value={ticket.sla || ""} onChange={e => onUpdate(ticket.id, { sla: e.target.value })} className={inputCls}>
                {SLA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Category">
              <select value={ticket.category} onChange={e => onUpdate(ticket.id, { category: e.target.value })} className={inputCls}>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Assign To">
              {users.length > 0 ? (
                <select value={localAssigned}
                  onChange={e => setLocalAssigned(e.target.value)}
                  onBlur={() => onUpdate(ticket.id, { assigned_to: localAssigned })}
                  className={inputCls}>
                  <option value="">— Unassigned —</option>
                  {users.map(u => <option key={u.username} value={u.username}>{u.username} ({u.role?.replace(/_/g, " ")})</option>)}
                </select>
              ) : (
                <input value={localAssigned} onChange={e => setLocalAssigned(e.target.value)}
                  onBlur={() => onUpdate(ticket.id, { assigned_to: localAssigned })}
                  placeholder="Username" className={inputCls} />
              )}
            </FormField>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <div className="text-xs text-slate-500 uppercase tracking-widest font-mono-metric mb-3">
            Internal Notes ({ticket.notes?.length || 0})
          </div>
          {ticket.notes?.length > 0 && (
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {ticket.notes.map(n => (
                <div key={n.id} className="p-3 rounded-lg bg-[#020617] border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-[#F26B21]">{n.created_by}</span>
                    <span className="text-xs text-slate-600">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{n.content}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={noteText} onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAddNote()}
              placeholder="Add an internal note…" className={`${inputCls} flex-1`} />
            <button onClick={handleAddNote} disabled={savingNote || !noteText.trim()}
              className="hn-btn-primary !py-2 !px-4 text-sm inline-flex items-center gap-1.5 disabled:opacity-50">
              <MessageSquarePlus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="text-xs text-slate-600">
            Created {new Date(ticket.created_at).toLocaleDateString()}
            {ticket.resolved_at && <> · Resolved {new Date(ticket.resolved_at).toLocaleDateString()}</>}
          </div>
          {canWrite && (
            <button onClick={() => { onDelete(ticket.id); onClose(); }}
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-md hover:bg-red-400/10">
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TicketForm({ categories, users, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_TICKET });
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = e => { e.preventDefault(); onSave(form); };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-2xl hn-card rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">New Ticket</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer info */}
          <FormField label="Customer Name">
            <input required value={form.customer_name} onChange={upd("customer_name")} className={inputCls} placeholder="Full name" />
          </FormField>
          <FormField label="Customer ID">
            <input value={form.customer_id} onChange={upd("customer_id")} className={inputCls} placeholder="e.g. HN-001234" />
          </FormField>
          <FormField label="Phone">
            <input value={form.customer_phone} onChange={upd("customer_phone")} className={inputCls} placeholder="+91 xxxxx xxxxx" />
          </FormField>
          <FormField label="Email">
            <input type="email" value={form.customer_email} onChange={upd("customer_email")} className={inputCls} />
          </FormField>
          <FormField label="Area / Locality">
            <input value={form.area} onChange={upd("area")} className={inputCls} placeholder="e.g. Mohanpur, Midnapore" />
          </FormField>
          <FormField label="Which Service">
            <select value={form.service_type} onChange={upd("service_type")} className={inputCls}>
              <option value="">Select service…</option>
              {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FormField>

          {/* Ticket details */}
          <FormField label="Category">
            <select value={form.category} onChange={upd("category")} className={inputCls}>
              <option value="">Select category…</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Priority">
            <select value={form.priority} onChange={upd("priority")} className={inputCls}>
              {TICKET_PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
          </FormField>
          <FormField label="SLA">
            <select value={form.sla} onChange={upd("sla")} className={inputCls}>
              {SLA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <FormField label="Assign To">
            {users.length > 0 ? (
              <select value={form.assigned_to} onChange={upd("assigned_to")} className={inputCls}>
                <option value="">— Unassigned —</option>
                {users.map(u => <option key={u.username} value={u.username}>{u.username} ({u.role?.replace(/_/g, " ")})</option>)}
              </select>
            ) : (
              <input value={form.assigned_to} onChange={upd("assigned_to")} placeholder="Admin username" className={inputCls} />
            )}
          </FormField>

          {/* Issue */}
          <div className="md:col-span-2">
            <FormField label="Issue Summary">
              <input required value={form.title} onChange={upd("title")} className={inputCls} placeholder="Brief one-line description" />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Detailed Description">
              <textarea required rows={4} value={form.description} onChange={upd("description")} className={inputCls}
                placeholder="Describe the issue — when it started, what was tried, any error messages…" />
            </FormField>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" className="hn-btn-primary text-sm !py-2">Create Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Category Form ────────────────────────────────────────────────────────────
function CategoryForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { name: initial.name, description: initial.description || "", color: initial.color || "#F26B21", active: initial.active ?? true, display_order: initial.display_order ?? 0 } : { ...EMPTY_CATEGORY });
  const upd = k => e => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
  };
  const submit = e => { e.preventDefault(); onSave({ ...form, display_order: Number(form.display_order) }); };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-md hn-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">{initial ? "Edit Category" : "New Category"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Name">
            <input required value={form.name} onChange={upd("name")} className={inputCls} placeholder="e.g. Technical" />
          </FormField>
          <FormField label="Description">
            <input value={form.description} onChange={upd("description")} className={inputCls} placeholder="Short description for agents" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Badge Color">
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={upd("color")}
                  className="w-10 h-10 rounded-md cursor-pointer bg-transparent border-0 p-0" />
                <input value={form.color} onChange={upd("color")} className={`${inputCls} font-mono-metric`} placeholder="#F26B21" />
              </div>
            </FormField>
            <FormField label="Display Order">
              <input type="number" value={form.display_order} onChange={upd("display_order")} className={inputCls} />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={upd("active")} />
            Active (visible to customers in support form)
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" className="hn-btn-primary text-sm !py-2">{initial ? "Save Changes" : "Create Category"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────
function UsersTable({ users, currentUsername, onEdit, onDelete, onNew, roles = [] }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage admin accounts and their permissions.</p>
        <button onClick={onNew} className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2"><Plus size={14} /> New User</button>
      </div>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0F172A]">
            <tr><Th>Username</Th><Th>Role</Th><Th>Recovery Email</Th><Th>Created</Th><Th>Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(u => (
              <tr key={u.username} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{u.username}</span>
                    {u.username === currentUsername && <span className="text-xs text-slate-500 font-mono-metric">(you)</span>}
                  </div>
                </Td>
                <Td>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-mono-metric capitalize ${ROLE_CLS[u.role] || "text-slate-400 bg-slate-400/10"}`}>
                    {u.role?.replace(/_/g, " ")}
                  </span>
                </Td>
                <Td className="text-slate-400">{u.recovery_email || "—"}</Td>
                <Td className="text-slate-500 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(u)} className="p-2 rounded-md hover:bg-white/5 text-slate-300"><Edit3 size={14} /></button>
                    {u.username !== currentUsername && (
                      <button onClick={() => onDelete(u.username)} className="p-2 rounded-md hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
                    )}
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

function UserForm({ initial, onSave, onClose, allRoles = [] }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(isEdit
    ? { recovery_email: initial.recovery_email || "", role: initial.role || "support", password: "" }
    : { ...EMPTY_USER });
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = e => {
    e.preventDefault();
    const payload = isEdit
      ? { recovery_email: form.recovery_email, role: form.role, ...(form.password ? { password: form.password } : {}) }
      : form;
    onSave(payload);
  };

  // System roles always shown; custom roles from DB appended
  const systemRoles = [
    { value: "super_admin", label: "Super Admin — full access + user management" },
    { value: "admin",       label: "Admin — manage content & tickets" },
    { value: "support",     label: "Support — manage tickets only" },
  ];
  const customRoles = allRoles.filter(r => !r.is_system).map(r => ({ value: r.name, label: `${r.label} (custom)` }));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-lg hn-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">{isEdit ? `Edit ${initial.username}` : "New Admin User"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {!isEdit && <FormField label="Username"><input required value={form.username} onChange={upd("username")} className={inputCls} placeholder="e.g. support1" autoComplete="off" /></FormField>}
          <FormField label="Role">
            <select value={form.role} onChange={upd("role")} className={inputCls}>
              {systemRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              {customRoles.length > 0 && (
                <>
                  <option disabled>── Custom Roles ──</option>
                  {customRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </>
              )}
            </select>
          </FormField>
          <FormField label="Recovery Email">
            <input required={!isEdit} type="email" value={form.recovery_email} onChange={upd("recovery_email")} className={inputCls} />
          </FormField>
          <FormField label={isEdit ? "New Password (blank = keep current)" : "Password"}>
            <input required={!isEdit} type="password" value={form.password} onChange={upd("password")} className={inputCls}
              placeholder={isEdit ? "Leave blank to keep unchanged" : "Min 6 characters"} autoComplete="new-password" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" className="hn-btn-primary text-sm !py-2">{isEdit ? "Save Changes" : "Create User"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Helper sub-component ─────────────────────────────────────────────────────
const InfoItem = ({ label, value, bold, mono, accent }) => (
  <div>
    <div className="text-xs text-slate-500 mb-0.5">{label}</div>
    <div className={`text-sm ${bold ? "text-white font-medium" : mono ? "text-slate-300 font-mono-metric" : accent ? "text-[#F26B21]" : "text-slate-300"}`}>{value}</div>
  </div>
);

// ─── Existing unchanged components ────────────────────────────────────────────
function PlansTable({ plans, canWrite, onEdit, onDelete, onNew }) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canWrite && <button onClick={onNew} data-testid="admin-new-plan-btn" className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2"><Plus size={14} /> New Plan</button>}
      </div>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm" data-testid="admin-plans-table">
          <thead className="bg-[#0F172A]">
            <tr><Th>Name</Th><Th>Category</Th><Th>Speed</Th><Th>Price ₹</Th><Th>Validity</Th><Th>Popular</Th><Th>Active</Th><Th>Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {plans.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02]" data-testid={`admin-plan-row-${p.id}`}>
                <Td className="font-medium text-white">{p.name}</Td>
                <Td className="font-mono-metric text-xs uppercase text-[#F26B21]">{p.category}</Td>
                <Td className="font-mono-metric">{p.speed_mbps} Mbps</Td>
                <Td className="font-mono-metric text-white">₹{p.price.toLocaleString("en-IN")}</Td>
                <Td className="text-slate-400 text-xs">{p.validity_label}</Td>
                <Td>{p.popular ? <span className="text-[#F26B21]">★</span> : <span className="text-slate-600">–</span>}</Td>
                <Td>{p.active ? <span className="text-emerald-400">●</span> : <span className="text-slate-600">●</span>}</Td>
                  <Td>
                    {canWrite && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(p)} data-testid={`admin-edit-${p.id}`} className="p-2 rounded-md hover:bg-white/5 text-slate-300"><Edit3 size={14} /></button>
                    <button onClick={() => onDelete(p.id)} data-testid={`admin-delete-${p.id}`} className="p-2 rounded-md hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
                  </div>
                    )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContactsTable({ contacts, canWrite, onRead, onDelete }) {
  if (contacts.length === 0) return <div className="text-slate-400 py-12 text-center">No enquiries yet.</div>;
  return (
    <div className="space-y-3" data-testid="admin-contacts-list">
      {contacts.map(c => (
        <div key={c.id} className={`hn-card rounded-xl p-6 ${!c.read ? "border-[#F26B21]/40" : ""}`}>
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
              {canWrite && !c.read && <button onClick={() => onRead(c.id)} className="p-2 rounded-md hover:bg-white/5 text-emerald-400"><CheckCircle2 size={16} /></button>}
              {canWrite && <button onClick={() => onDelete(c.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-400"><Trash2 size={16} /></button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PartnerEnquiriesTable({ items, canWrite, onRead, onDelete }) {
  if (items.length === 0) return <div className="text-slate-400 py-12 text-center">No partner enquiries yet.</div>;
  return (
    <div className="space-y-3">
      {items.map(p => (
        <div key={p.id} className={`hn-card rounded-xl p-6 ${!p.read ? "border-[#F26B21]/40" : ""}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-display text-lg font-semibold text-white">{p.name}</span>
                {p.company && <span className="text-slate-400 text-sm">· {p.company}</span>}
                {!p.read && <span className="font-mono-metric text-[10px] uppercase tracking-widest bg-[#F26B21]/20 text-[#F26B21] px-2 py-0.5 rounded-full">New</span>}
              </div>
              <div className="text-slate-400 text-sm mt-1">{p.email} · {p.phone} · {p.city || "City n/a"}</div>
              <div className="text-[#F26B21] text-xs uppercase tracking-widest font-mono-metric mt-2">{p.partnership_type}</div>
              <div className="text-slate-400 text-sm mt-3 whitespace-pre-line leading-relaxed">{p.message}</div>
            </div>
            <div className="flex items-center gap-2">
              {canWrite && !p.read && <button onClick={() => onRead(p.id)} className="p-2 rounded-md hover:bg-white/5 text-emerald-400"><CheckCircle2 size={16} /></button>}
              {canWrite && <button onClick={() => onDelete(p.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-400"><Trash2 size={16} /></button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamTable({ team, canWrite, onEdit, onDelete, onNew }) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canWrite && <button onClick={onNew} className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2"><Plus size={14} /> New Member</button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map(m => (
          <div key={m.id} className="hn-card rounded-xl p-5 flex gap-4">
            {m.image_url ? <img src={m.image_url} alt={m.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" /> : <div className="w-16 h-16 rounded-lg bg-[#020617] border border-white/10 grid place-items-center text-slate-600 text-xs flex-shrink-0">no img</div>}
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-white truncate">{m.name}</div>
              <div className="text-xs uppercase tracking-widest font-mono-metric text-[#F26B21] mt-0.5">{m.role}</div>
              <div className="mt-1 text-xs text-slate-500">Order: {m.display_order} · {m.active ? <span className="text-emerald-400">Active</span> : <span className="text-slate-500">Hidden</span>}</div>
            </div>
            {canWrite && <div className="flex flex-col gap-1">
              <button onClick={() => onEdit(m)} className="p-2 rounded-md hover:bg-white/5 text-slate-300"><Edit3 size={14} /></button>
              <button onClick={() => onDelete(m.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
            </div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsTable({ items, canWrite, onEdit, onDelete, onNew }) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canWrite && <button onClick={onNew} className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2"><Plus size={14} /> New Testimonial</button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(t => (
          <div key={t.id} className="hn-card rounded-xl p-5 flex gap-4">
            {t.image_url ? <img src={t.image_url} alt={t.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" /> : <div className="w-14 h-14 rounded-full bg-[#020617] border border-white/10 grid place-items-center text-slate-600 text-xs flex-shrink-0">no img</div>}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-display font-semibold text-white truncate">{t.name}</div>
                <div className="flex">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={11} className="fill-[#F26B21] text-[#F26B21]" />)}</div>
              </div>
              <div className="text-xs uppercase tracking-widest font-mono-metric text-[#F26B21] mt-0.5">{t.location}</div>
              <div className="text-slate-400 text-sm mt-2 line-clamp-2">"{t.quote}"</div>
              <div className="mt-2 text-xs text-slate-500">Order: {t.display_order} · {t.active ? <span className="text-emerald-400">Active</span> : <span className="text-slate-500">Hidden</span>}</div>
            </div>
            {canWrite && <div className="flex flex-col gap-1">
              <button onClick={() => onEdit(t)} className="p-2 rounded-md hover:bg-white/5 text-slate-300"><Edit3 size={14} /></button>
              <button onClick={() => onDelete(t.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
            </div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_PLAN });
  const upd = k => e => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
  };
  const submit = e => {
    e.preventDefault();
    onSave({ ...form, speed_mbps: Number(form.speed_mbps), price: Number(form.price), validity_days: Number(form.validity_days), display_order: Number(form.display_order) });
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
              {PLAN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Speed (Mbps)"><input required type="number" value={form.speed_mbps} onChange={upd("speed_mbps")} data-testid="admin-form-speed" className={inputCls} /></FormField>
          <FormField label="Price ₹"><input required type="number" value={form.price} onChange={upd("price")} data-testid="admin-form-price" className={inputCls} /></FormField>
          <FormField label="Validity (days)"><input required type="number" value={form.validity_days} onChange={upd("validity_days")} data-testid="admin-form-validity-days" className={inputCls} /></FormField>
          <FormField label="Validity Label"><input required value={form.validity_label} onChange={upd("validity_label")} data-testid="admin-form-validity-label" className={inputCls} /></FormField>
          <FormField label="Display Order"><input type="number" value={form.display_order} onChange={upd("display_order")} className={inputCls} /></FormField>
          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.popular} onChange={upd("popular")} /> Popular</label>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.active} onChange={upd("active")} /> Active</label>
          </div>
          <div className="md:col-span-2"><FormField label="Benefits"><textarea rows={3} value={form.benefits} onChange={upd("benefits")} className={inputCls} /></FormField></div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" data-testid="admin-form-save" className="hn-btn-primary text-sm !py-2">Save Plan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TestimonialForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_TESTIMONIAL });
  const upd = k => e => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
  };
  const submit = e => { e.preventDefault(); onSave({ ...form, rating: Number(form.rating), display_order: Number(form.display_order) }); };
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-2xl hn-card rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">{initial ? "Edit Testimonial" : "New Testimonial"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Customer Name"><input required value={form.name} onChange={upd("name")} className={inputCls} /></FormField>
          <FormField label="Location"><input value={form.location} onChange={upd("location")} className={inputCls} placeholder="e.g. Mohanpur" /></FormField>
          <div className="md:col-span-2"><FormField label="Photo (URL or Upload)"><ImageUploadField value={form.image_url} onChange={v => setForm(f => ({ ...f, image_url: v }))} /></FormField></div>
          <div className="md:col-span-2"><FormField label="Quote"><textarea required rows={4} value={form.quote} onChange={upd("quote")} className={inputCls} /></FormField></div>
          <FormField label="Rating (1-5)"><input type="number" min="1" max="5" value={form.rating} onChange={upd("rating")} className={inputCls} /></FormField>
          <FormField label="Display Order"><input type="number" value={form.display_order} onChange={upd("display_order")} className={inputCls} /></FormField>
          <div className="md:col-span-2"><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.active} onChange={upd("active")} /> Active (visible on Home)</label></div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" className="hn-btn-primary text-sm !py-2">Save Testimonial</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_MEMBER });
  const upd = k => e => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
  };
  const submit = e => { e.preventDefault(); onSave({ ...form, display_order: Number(form.display_order) }); };
  return (
    <div className="fixed inset-0 z-50 bg morphism-sm bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-2xl hn-card rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">{initial ? "Edit Team Member" : "New Team Member"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name"><input required value={form.name} onChange={upd("name")} className={inputCls} /></FormField>
          <FormField label="Role"><input required value={form.role} onChange={upd("role")} className={inputCls} /></FormField>
          <div className="md:col-span-2"><FormField label="Image (URL or Upload)"><ImageUploadField value={form.image_url} onChange={v => setForm(f => ({ ...f, image_url: v }))} /></FormField></div>
          <div className="md:col-span-2"><FormField label="Short Bio"><textarea rows={2} value={form.bio} onChange={upd("bio")} className={inputCls} /></FormField></div>
          <FormField label="LinkedIn URL"><input value={form.linkedin} onChange={upd("linkedin")} className={inputCls} /></FormField>
          <FormField label="Twitter URL"><input value={form.twitter} onChange={upd("twitter")} className={inputCls} /></FormField>
          <FormField label="Email"><input type="email" value={form.email} onChange={upd("email")} className={inputCls} /></FormField>
          <FormField label="Display Order"><input type="number" value={form.display_order} onChange={upd("display_order")} className={inputCls} /></FormField>
          <div className="md:col-span-2"><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.active} onChange={upd("active")} /> Active (visible on Team page)</label></div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" className="hn-btn-primary text-sm !py-2">Save Member</button>
          </div>
        </form>
      </div>
    </div>
  );
}
