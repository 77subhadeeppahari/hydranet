import { useEffect, useState, useMemo } from "react";
import { api, formatApiErrorDetail } from "../lib/api";
import {
  Plus, Edit3, Trash2, X, Users, Calendar, Download,
  CheckCircle, XCircle, Clock, MinusCircle, BarChart3, UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Constants ────────────────────────────────────────────────────────────────
const ATTENDANCE_STATUSES = [
  { value: "present",   label: "Present",    color: "#10B981", Icon: CheckCircle },
  { value: "absent",    label: "Absent",     color: "#EF4444", Icon: XCircle },
  { value: "half_day",  label: "Half Day",   color: "#F59E0B", Icon: MinusCircle },
  { value: "on_leave",  label: "On Leave",   color: "#8B5CF6", Icon: Clock },
  { value: "holiday",   label: "Holiday",    color: "#6B7280", Icon: Calendar },
];

const DEPARTMENTS = ["Operations", "Technical", "Support", "Finance", "Marketing", "Management", "Field", "Other"];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const inputCls = "w-full rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-3 py-2.5 text-white text-sm";
const FormField = ({ label, children }) => (
  <div>
    <label className="block text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-2">{label}</label>
    {children}
  </div>
);

const today = new Date();
const EMPTY_STAFF = { name: "", employee_id: "", department: "Operations", designation: "", phone: "", email: "", join_date: "", active: true };
const EMPTY_RECORD = { staff_id: "", date: today.toISOString().slice(0,10), status: "present", check_in: "", check_out: "", notes: "" };

function statusMeta(v) { return ATTENDANCE_STATUSES.find(s => s.value === v) || ATTENDANCE_STATUSES[0]; }
function fmt2(n) { return String(n).padStart(2, "0"); }
function workingHours(cin, cout) {
  if (!cin || !cout) return "—";
  try {
    const [h1,m1] = cin.split(":").map(Number);
    const [h2,m2] = cout.split(":").map(Number);
    const mins = (h2*60+m2) - (h1*60+m1);
    if (mins <= 0) return "—";
    return `${Math.floor(mins/60)}h ${fmt2(mins%60)}m`;
  } catch { return "—"; }
}

// ─── PDF Generator ─────────────────────────────────────────────────────────────
function generateAttendancePDF({ period, year, month, staff_list, records, summary }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const orange = [242, 107, 33];
  const dark   = [2, 6, 23];
  const slate  = [100, 116, 139];
  const W = 297;

  // Header band
  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 38, "F");
  doc.setFillColor(...orange);
  doc.rect(0, 38, W, 2, "F");

  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(255,255,255);
  doc.text("HYDRANET BROADBAND", 14, 16);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(148,163,184);
  doc.text("Staff Attendance Report", 14, 24);

  const periodLabel = period === "monthly"
    ? `${MONTHS[month-1]} ${year}` : `Year ${year}`;
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...orange);
  doc.text(periodLabel.toUpperCase(), 14, 33);

  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...slate);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, W - 14, 33, { align: "right" });

  let y = 48;

  // Summary row
  const cols = [
    { label: "Total Staff",  value: String(summary.total_staff) },
    { label: "Working Days", value: String(summary.working_days) },
    { label: "Avg Attendance", value: `${summary.avg_attendance}%` },
    { label: "Total Present", value: String(summary.total_present) },
    { label: "Total Absent",  value: String(summary.total_absent) },
    { label: "Half Days",     value: String(summary.total_half_day) },
  ];
  const colW = (W - 28) / cols.length;
  cols.forEach((s, i) => {
    const x = 14 + i * colW;
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(x, y, colW - 3, 18, 2, 2, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...slate);
    doc.text(s.label.toUpperCase(), x+4, y+6);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...orange);
    doc.text(s.value, x+4, y+14);
  });
  y += 26;

  if (period === "monthly") {
    // Per-staff summary
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(248,250,252);
    doc.text("STAFF SUMMARY", 14, y);
    y += 4;

    const staffRows = staff_list.map(s => {
      const recs = records.filter(r => r.staff_id === s.id);
      const present  = recs.filter(r => r.status === "present").length;
      const absent   = recs.filter(r => r.status === "absent").length;
      const half     = recs.filter(r => r.status === "half_day").length;
      const leave    = recs.filter(r => r.status === "on_leave").length;
      const total    = recs.length;
      const pct      = total > 0 ? ((present + half*0.5) / total * 100).toFixed(1) : "—";
      return [s.name, s.employee_id || "—", s.department || "—", String(present), String(absent), String(half), String(leave), total > 0 ? `${pct}%` : "—"];
    });

    autoTable(doc, {
      startY: y,
      head: [["Name", "Emp ID", "Dept", "Present", "Absent", "Half Day", "Leave", "Attendance%"]],
      body: staffRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2.5, textColor: [203,213,225], fillColor: dark, lineColor: [30,41,59], lineWidth: 0.2 },
      headStyles: { fillColor: [15,23,42], textColor: [...orange], fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: [15,23,42] },
      columnStyles: { 7: { fontStyle: "bold", textColor: [248,250,252] } },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    // Detailed records
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(248,250,252);
    doc.text("DAILY ATTENDANCE LOG", 14, y);
    y += 4;

    const detailRows = records.sort((a,b) => a.date.localeCompare(b.date)).map(r => {
      const s = staff_list.find(st => st.id === r.staff_id);
      const sm = statusMeta(r.status);
      return [r.date, s?.name || "—", s?.department || "—", sm.label, r.check_in || "—", r.check_out || "—", workingHours(r.check_in, r.check_out), r.notes || "—"];
    });

    autoTable(doc, {
      startY: y,
      head: [["Date", "Staff Name", "Dept", "Status", "Check In", "Check Out", "Hours", "Notes"]],
      body: detailRows,
      theme: "grid",
      styles: { fontSize: 7.5, cellPadding: 2, textColor: [203,213,225], fillColor: dark, lineColor: [30,41,59], lineWidth: 0.2 },
      headStyles: { fillColor: [15,23,42], textColor: [...orange], fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: [15,23,42] },
      margin: { left: 14, right: 14 },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...dark);
    doc.rect(0, 207, W, 8, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...slate);
    doc.text("Hydranet Broadband · Confidential Internal Report", 14, 212);
    doc.text(`Page ${i} of ${pageCount}`, W - 14, 212, { align: "right" });
  }

  const fname = period === "monthly"
    ? `Attendance_${MONTHS[month-1]}_${year}.pdf`
    : `Attendance_${year}.pdf`;
  doc.save(fname);
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AttendanceTab({ canWrite }) {
  const currentYear  = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // Sub-tab
  const [view, setView]                   = useState("records");  // records | staff | report
  const [staffList, setStaffList]         = useState([]);
  const [records, setRecords]             = useState([]);

  const [filterYear, setFilterYear]       = useState(currentYear);
  const [filterMonth, setFilterMonth]     = useState(currentMonth);
  const [filterStaff, setFilterStaff]     = useState("");
  const [filterStatus, setFilterStatus]   = useState("");

  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff]   = useState(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [reportYear, setReportYear]       = useState(currentYear);
  const [reportMonth, setReportMonth]     = useState(currentMonth);
  const [reportPeriod, setReportPeriod]   = useState("monthly");
  const [genLoading, setGenLoading]       = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const load = async () => {
    try {
      const [staffRes, recRes] = await Promise.all([
        api.get("/admin/staff"),
        api.get("/admin/attendance", { params: { year: filterYear, month: filterMonth, ...(filterStaff ? { staff_id: filterStaff } : {}), ...(filterStatus ? { status: filterStatus } : {}) } }),
      ]);
      setStaffList(staffRes.data);
      setRecords(recRes.data);
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Load failed"); }
  };

  useEffect(() => {
    load();
    // The filter values intentionally control the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear, filterMonth, filterStaff, filterStatus]);

  // ── Staff CRUD ──
  const saveStaff = async (data) => {
    try {
      if (editingStaff) { await api.patch(`/admin/staff/${editingStaff.id}`, data); toast.success("Staff updated"); }
      else { await api.post("/admin/staff", data); toast.success("Staff added"); }
      setShowStaffForm(false); setEditingStaff(null); load();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };
  const deleteStaff = async (id) => {
    if (!window.confirm("Remove this staff member?")) return;
    try { await api.delete(`/admin/staff/${id}`); toast.success("Removed"); load(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed"); }
  };

  // ── Record CRUD ──
  const saveRecord = async (data) => {
    try {
      if (editingRecord) { await api.patch(`/admin/attendance/${editingRecord.id}`, data); toast.success("Record updated"); }
      else { await api.post("/admin/attendance", data); toast.success("Attendance marked"); }
      setShowRecordForm(false); setEditingRecord(null); load();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try { await api.delete(`/admin/attendance/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Failed"); }
  };

  // ── Quick mark today ──
  const quickMark = async (staffId, status) => {
    const todayStr = today.toISOString().slice(0,10);
    try {
      await api.post("/admin/attendance", { staff_id: staffId, date: todayStr, status });
      toast.success(`Marked ${statusMeta(status).label}`);
      load();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed"); }
  };

  // ── Report ──
  const downloadReport = async () => {
    setGenLoading(true);
    try {
      const params = { period: reportPeriod, year: reportYear };
      if (reportPeriod === "monthly") params.month = reportMonth;
      const { data } = await api.get("/admin/attendance/report", { params });
      generateAttendancePDF(data);
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Report failed"); }
    finally { setGenLoading(false); }
  };

  // ── Derived stats ──
  const presentToday = useMemo(() => {
    const d = today.toISOString().slice(0,10);
    return records.filter(r => r.date === d && r.status === "present").length;
  }, [records]);
  const absentToday = useMemo(() => {
    const d = today.toISOString().slice(0,10);
    return records.filter(r => r.date === d && r.status === "absent").length;
  }, [records]);

  const activeStaff = staffList.filter(s => s.active);

  return (
    <div className="space-y-6">
      {/* Sub-tab bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {["records","staff","report"].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 text-sm rounded-full font-medium transition-all capitalize ${view === v ? "bg-[#F26B21] text-white" : "text-slate-300 hover:text-white border border-white/10"}`}>
            {v === "records" ? "Attendance Records" : v === "staff" ? "Staff Directory" : "Reports & PDF"}
          </button>
        ))}
      </div>

      {/* ── Records View ── */}
      {view === "records" && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SmallCard icon={<UserCheck size={18} />} label="Active Staff" value={activeStaff.length} color="#10B981" />
            <SmallCard icon={<CheckCircle size={18} />} label="Present Today" value={presentToday} color="#3B82F6" />
            <SmallCard icon={<XCircle size={18} />} label="Absent Today" value={absentToday} color="#EF4444" />
            <SmallCard icon={<BarChart3 size={18} />} label="Records This Month" value={records.length} color="#F26B21" />
          </div>

          {/* Quick Mark Today */}
          {canWrite && activeStaff.length > 0 && (
            <div className="rounded-xl border border-white/10 p-5 bg-[#0F172A]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-widest font-mono-metric text-slate-400">Quick Mark — {today.toDateString()}</p>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeStaff.map(s => {
                  const todayRec = records.find(r => r.staff_id === s.id && r.date === today.toISOString().slice(0,10));
                  const sm = todayRec ? statusMeta(todayRec.status) : null;
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[#020617] border border-white/5">
                      <div>
                        <div className="text-white text-sm font-medium">{s.name}</div>
                        <div className="text-slate-500 text-xs">{s.department} · {s.designation || "—"}</div>
                      </div>
                      {sm ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono-metric px-2 py-1 rounded-full"
                          style={{ backgroundColor: sm.color + "22", color: sm.color }}>
                          <sm.Icon size={12} />{sm.label}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          {[["present","P","#10B981"],["absent","A","#EF4444"],["half_day","H","#F59E0B"],["on_leave","L","#8B5CF6"]].map(([val,lbl,clr]) => (
                            <button key={val} onClick={() => quickMark(s.id, val)}
                              className="text-xs px-2 py-1 rounded font-mono-metric font-semibold transition-all hover:scale-105"
                              style={{ backgroundColor: clr + "22", color: clr }}>{lbl}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter + Table */}
          <div className="flex flex-wrap items-center gap-3">
            <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
              className="rounded-md bg-[#0F172A] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
              className="rounded-md bg-[#0F172A] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
              {MONTHS.map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)}
              className="rounded-md bg-[#0F172A] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
              <option value="">All Staff</option>
              {activeStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="rounded-md bg-[#0F172A] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
              <option value="">All Statuses</option>
              {ATTENDANCE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {canWrite && (
              <button onClick={() => { setEditingRecord(null); setShowRecordForm(true); }}
                className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2 ml-auto">
                <Plus size={14} /> Log Attendance
              </button>
            )}
          </div>

          {records.length === 0 ? (
            <div className="text-slate-400 py-16 text-center rounded-xl border border-white/5">
              <Calendar size={32} className="mx-auto mb-3 opacity-30" />
              <p>No records found for this period.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead className="bg-[#0F172A]">
                  <tr>
                    <Th>Date</Th><Th>Staff</Th><Th>Dept</Th><Th>Status</Th>
                    <Th>Check In</Th><Th>Check Out</Th><Th>Hours</Th><Th>Notes</Th>
                    {canWrite && <Th></Th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.sort((a,b) => b.date.localeCompare(a.date)).map(r => {
                    const sm = statusMeta(r.status);
                    const st = staffList.find(s => s.id === r.staff_id);
                    return (
                      <tr key={r.id} className="hover:bg-white/[0.02]">
                        <Td><span className="font-mono-metric text-xs">{r.date}</span></Td>
                        <Td>
                          <div className="text-white text-xs font-medium">{st?.name || "—"}</div>
                          {st?.employee_id && <div className="text-slate-500 text-xs font-mono-metric">{st.employee_id}</div>}
                        </Td>
                        <Td><span className="text-xs text-slate-400">{st?.department || "—"}</span></Td>
                        <Td>
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono-metric px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: sm.color + "22", color: sm.color }}>
                            <sm.Icon size={11} />{sm.label}
                          </span>
                        </Td>
                        <Td><span className="font-mono-metric text-xs text-slate-400">{r.check_in || "—"}</span></Td>
                        <Td><span className="font-mono-metric text-xs text-slate-400">{r.check_out || "—"}</span></Td>
                        <Td><span className="font-mono-metric text-xs text-emerald-400">{workingHours(r.check_in, r.check_out)}</span></Td>
                        <Td><span className="text-xs text-slate-500 max-w-[120px] truncate block">{r.notes || "—"}</span></Td>
                        {canWrite && (
                          <Td>
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditingRecord(r); setShowRecordForm(true); }} className="p-1.5 rounded hover:bg-white/5 text-slate-400"><Edit3 size={13} /></button>
                              <button onClick={() => deleteRecord(r.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={13} /></button>
                            </div>
                          </Td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Staff Directory ── */}
      {view === "staff" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">{staffList.length} staff member{staffList.length !== 1 ? "s" : ""} · {activeStaff.length} active</p>
            {canWrite && (
              <button onClick={() => { setEditingStaff(null); setShowStaffForm(true); }}
                className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2">
                <Plus size={14} /> Add Staff
              </button>
            )}
          </div>
          {staffList.length === 0 ? (
            <div className="text-slate-400 py-16 text-center rounded-xl border border-white/5">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p>No staff members added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map(s => (
                <div key={s.id} className="rounded-xl border border-white/10 p-5 bg-[#0F172A]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F26B21]/10 border border-[#F26B21]/20 grid place-items-center text-[#F26B21] font-bold text-sm">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{s.name}</div>
                        {s.employee_id && <div className="text-slate-500 text-xs font-mono-metric">{s.employee_id}</div>}
                      </div>
                    </div>
                    {canWrite && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingStaff(s); setShowStaffForm(true); }} className="p-1.5 rounded hover:bg-white/5 text-slate-400"><Edit3 size={13} /></button>
                        <button onClick={() => deleteStaff(s.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-metric px-2 py-0.5 rounded-full text-[#F26B21] bg-[#F26B21]/10">{s.department}</span>
                      {s.designation && <span className="text-xs text-slate-400">{s.designation}</span>}
                    </div>
                    {s.phone && <div className="text-xs text-slate-500">{s.phone}</div>}
                    {s.email && <div className="text-xs text-slate-500">{s.email}</div>}
                    {s.join_date && <div className="text-xs text-slate-600">Joined: {s.join_date}</div>}
                    <div className={`text-xs font-mono-metric ${s.active ? "text-emerald-400" : "text-slate-600"}`}>
                      ● {s.active ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Reports View ── */}
      {view === "report" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 p-6 bg-[#0F172A]">
            <p className="text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-4 flex items-center gap-2">
              <Download size={12} className="text-[#F26B21]" /> Generate PDF Report
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Report Type</label>
                <select value={reportPeriod} onChange={e => setReportPeriod(e.target.value)}
                  className="rounded-md bg-[#020617] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Year</label>
                <select value={reportYear} onChange={e => setReportYear(Number(e.target.value))}
                  className="rounded-md bg-[#020617] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {reportPeriod === "monthly" && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Month</label>
                  <select value={reportMonth} onChange={e => setReportMonth(Number(e.target.value))}
                    className="rounded-md bg-[#020617] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
                    {MONTHS.map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
              )}
              <button onClick={downloadReport} disabled={genLoading}
                className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2 disabled:opacity-60">
                <Download size={14} /> {genLoading ? "Generating…" : "Download PDF"}
              </button>
            </div>
          </div>

          {/* This month summary */}
          <AttendanceSummaryChart records={records} staff={staffList} year={filterYear} month={filterMonth} />
        </div>
      )}

      {/* Modals */}
      {showStaffForm && <StaffForm initial={editingStaff} onSave={saveStaff} onClose={() => { setShowStaffForm(false); setEditingStaff(null); }} />}
      {showRecordForm && <RecordForm initial={editingRecord} staffList={activeStaff} onSave={saveRecord} onClose={() => { setShowRecordForm(false); setEditingRecord(null); }} />}
    </div>
  );
}

// ─── Summary Chart ─────────────────────────────────────────────────────────────
function AttendanceSummaryChart({ records, staff, year, month }) {
  const present  = records.filter(r => r.status === "present").length;
  const absent   = records.filter(r => r.status === "absent").length;
  const half     = records.filter(r => r.status === "half_day").length;
  const leave    = records.filter(r => r.status === "on_leave").length;
  const total    = records.length;

  const items = [
    { label: "Present",  count: present, color: "#10B981" },
    { label: "Absent",   count: absent,  color: "#EF4444" },
    { label: "Half Day", count: half,    color: "#F59E0B" },
    { label: "On Leave", count: leave,   color: "#8B5CF6" },
  ];

  return (
    <div className="rounded-xl border border-white/10 p-5 bg-[#0F172A]">
      <p className="text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-4">
        {MONTHS[month-1]} {year} — Status Distribution ({total} records)
      </p>
      <div className="space-y-3">
        {items.map(item => {
          const pct = total > 0 ? (item.count / total * 100) : 0;
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-20 text-xs text-right text-slate-400">{item.label}</div>
              <div className="flex-1 h-3 bg-[#020617] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
              </div>
              <div className="w-20 text-xs font-mono-metric">
                <span className="text-white">{item.count}</span>
                <span className="text-slate-500 ml-1">({pct.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Staff Form ────────────────────────────────────────────────────────────────
function StaffForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial
    ? { name: initial.name, employee_id: initial.employee_id || "", department: initial.department || "Operations", designation: initial.designation || "", phone: initial.phone || "", email: initial.email || "", join_date: initial.join_date || "", active: initial.active ?? true }
    : { ...EMPTY_STAFF });
  const upd = k => e => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-lg hn-card rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">{initial ? "Edit Staff Member" : "Add Staff Member"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Full Name"><input required value={form.name} onChange={upd("name")} className={inputCls} placeholder="Full name" /></FormField>
          <FormField label="Employee ID"><input value={form.employee_id} onChange={upd("employee_id")} className={inputCls} placeholder="e.g. EMP-001" /></FormField>
          <FormField label="Department">
            <select value={form.department} onChange={upd("department")} className={inputCls}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Designation"><input value={form.designation} onChange={upd("designation")} className={inputCls} placeholder="e.g. Field Technician" /></FormField>
          <FormField label="Phone"><input value={form.phone} onChange={upd("phone")} className={inputCls} placeholder="+91 xxxxx xxxxx" /></FormField>
          <FormField label="Email"><input type="email" value={form.email} onChange={upd("email")} className={inputCls} /></FormField>
          <FormField label="Join Date"><input type="date" value={form.join_date} onChange={upd("join_date")} className={inputCls} /></FormField>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={upd("active")} className="accent-[#F26B21]" /> Active
            </label>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" className="hn-btn-primary text-sm !py-2">{initial ? "Save Changes" : "Add Staff"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Attendance Record Form ────────────────────────────────────────────────────
function RecordForm({ initial, staffList, onSave, onClose }) {
  const [form, setForm] = useState(initial
    ? { staff_id: initial.staff_id, date: initial.date, status: initial.status, check_in: initial.check_in || "", check_out: initial.check_out || "", notes: initial.notes || "" }
    : { ...EMPTY_RECORD });
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-md hn-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">{initial ? "Edit Record" : "Log Attendance"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <FormField label="Staff Member">
            <select required value={form.staff_id} onChange={upd("staff_id")} className={inputCls}>
              <option value="">Select staff…</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.name} {s.employee_id ? `(${s.employee_id})` : ""}</option>)}
            </select>
          </FormField>
          <FormField label="Date"><input required type="date" value={form.date} onChange={upd("date")} className={inputCls} /></FormField>
          <FormField label="Status">
            <select value={form.status} onChange={upd("status")} className={inputCls}>
              {ATTENDANCE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FormField>
          {(form.status === "present" || form.status === "half_day") && (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Check In"><input type="time" value={form.check_in} onChange={upd("check_in")} className={inputCls} /></FormField>
              <FormField label="Check Out"><input type="time" value={form.check_out} onChange={upd("check_out")} className={inputCls} /></FormField>
            </div>
          )}
          <FormField label="Notes (optional)"><input value={form.notes} onChange={upd("notes")} className={inputCls} placeholder="Any notes…" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" className="hn-btn-primary text-sm !py-2">{initial ? "Save Changes" : "Save Record"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const Th = ({ children }) => <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-mono-metric font-medium text-slate-400">{children}</th>;
const Td = ({ children, className = "" }) => <td className={`px-4 py-3 text-slate-300 ${className}`}>{children}</td>;

const SmallCard = ({ icon, label, value, color }) => (
  <div className="rounded-xl border border-white/10 p-4 bg-[#0F172A] flex items-center gap-3">
    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: color + "22", color }}>{icon}</div>
    <div>
      <p className="text-xs text-slate-500 font-mono-metric">{label}</p>
      <p className="font-display font-bold text-white text-xl">{value}</p>
    </div>
  </div>
);
