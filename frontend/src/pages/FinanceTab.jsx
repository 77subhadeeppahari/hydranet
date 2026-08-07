import { useEffect, useState, useMemo } from "react";
import { api, formatApiErrorDetail } from "../lib/api";
import {
  Plus, Edit3, Trash2, X, Download, TrendingDown, Calendar, Filter,
  IndianRupee, BarChart3, FileText,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Constants ────────────────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  { value: "salary",         label: "Salary & Payroll",    color: "#6366F1" },
  { value: "infrastructure", label: "Infrastructure",       color: "#3B82F6" },
  { value: "marketing",      label: "Marketing",            color: "#F59E0B" },
  { value: "equipment",      label: "Equipment",            color: "#10B981" },
  { value: "utilities",      label: "Utilities",            color: "#8B5CF6" },
  { value: "rent",           label: "Rent & Lease",         color: "#EF4444" },
  { value: "maintenance",    label: "Maintenance",          color: "#F26B21" },
  { value: "other",          label: "Other",                color: "#6B7280" },
];

const PAYMENT_MODES = [
  { value: "cash",          label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi",           label: "UPI" },
  { value: "cheque",        label: "Cheque" },
  { value: "card",          label: "Card" },
];

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

const EMPTY_EXPENSE = { amount: "", category: "salary", description: "", date: new Date().toISOString().slice(0,10), payment_mode: "cash", reference: "" };

function catMeta(val) { return EXPENSE_CATEGORIES.find(c => c.value === val) || { label: val, color: "#6B7280" }; }
function fmt(n) { return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
const today = new Date();

// ─── PDF Generator ────────────────────────────────────────────────────────────
function generatePDF({ period, year, month, expenses, total, by_category, by_month }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const orange = [242, 107, 33];
  const dark   = [2, 6, 23];
  const slate  = [100, 116, 139];

  // Header band
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 40, "F");
  doc.setFillColor(...orange);
  doc.rect(0, 40, 210, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("HYDRANET BROADBAND", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("East & West Midnapore, West Bengal", 14, 26);

  const periodLabel = period === "monthly"
    ? `${MONTHS[month - 1]} ${year} — Monthly Expense Report`
    : `${year} — Yearly Expense Report`;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...orange);
  doc.text(periodLabel.toUpperCase(), 14, 35);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 210 - 14, 35, { align: "right" });

  let y = 52;

  // Summary row
  const summaryData = [
    { label: "Total Expenses", value: `₹ ${fmt(total)}` },
    { label: "No. of Entries", value: String(expenses.length) },
    { label: "Top Category", value: Object.entries(by_category).sort((a,b) => b[1]-a[1])[0]?.[0] ? catMeta(Object.entries(by_category).sort((a,b) => b[1]-a[1])[0][0]).label : "—" },
  ];
  const colW = (210 - 28) / summaryData.length;
  summaryData.forEach((s, i) => {
    const x = 14 + i * colW;
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(x, y, colW - 4, 20, 2, 2, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...slate);
    doc.text(s.label.toUpperCase(), x + 5, y + 7);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...orange);
    doc.text(s.value, x + 5, y + 16);
  });
  y += 28;

  // Category breakdown
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(248, 250, 252);
  doc.text("BREAKDOWN BY CATEGORY", 14, y);
  y += 4;

  const catRows = EXPENSE_CATEGORIES
    .filter(c => by_category[c.value])
    .sort((a,b) => (by_category[b.value]||0) - (by_category[a.value]||0))
    .map(c => [c.label, `₹ ${fmt(by_category[c.value] || 0)}`, `${total > 0 ? ((by_category[c.value]||0)/total*100).toFixed(1) : 0}%`]);

  if (catRows.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Category", "Amount (₹)", "Share"]],
      body: catRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, textColor: [203, 213, 225], fillColor: [2, 6, 23], lineColor: [30, 41, 59], lineWidth: 0.2 },
      headStyles: { fillColor: [15, 23, 42], textColor: [...orange], fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: [15, 23, 42] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Monthly breakdown (yearly only)
  if (period === "yearly" && Object.keys(by_month).length > 0) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(248, 250, 252);
    doc.text("MONTHLY BREAKDOWN", 14, y);
    y += 4;

    const monthRows = Object.entries(by_month)
      .sort((a,b) => a[0].localeCompare(b[0]))
      .map(([ym, amt]) => {
        const [yr, mo] = ym.split("-");
        return [MONTHS[parseInt(mo) - 1] + " " + yr, `₹ ${fmt(amt)}`];
      });

    autoTable(doc, {
      startY: y,
      head: [["Month", "Total (₹)"]],
      body: monthRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, textColor: [203, 213, 225], fillColor: [2, 6, 23], lineColor: [30, 41, 59], lineWidth: 0.2 },
      headStyles: { fillColor: [15, 23, 42], textColor: [...orange], fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: [15, 23, 42] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Detailed transactions
  if (expenses.length > 0) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(248, 250, 252);
    doc.text("TRANSACTION DETAIL", 14, y);
    y += 4;

    const rows = expenses.map(e => [
      e.date,
      catMeta(e.category).label,
      e.description,
      PAYMENT_MODES.find(m => m.value === e.payment_mode)?.label || e.payment_mode,
      e.reference || "—",
      `₹ ${fmt(e.amount)}`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Date", "Category", "Description", "Mode", "Ref", "Amount (₹)"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [203, 213, 225], fillColor: [2, 6, 23], lineColor: [30, 41, 59], lineWidth: 0.2, overflow: "linebreak" },
      headStyles: { fillColor: [15, 23, 42], textColor: [...orange], fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: [15, 23, 42] },
      columnStyles: { 5: { halign: "right", fontStyle: "bold", textColor: [248, 250, 252] } },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...dark);
    doc.rect(0, 287, 210, 10, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...slate);
    doc.text("Hydranet Broadband · Confidential Internal Report", 14, 293);
    doc.text(`Page ${i} of ${pageCount}`, 210 - 14, 293, { align: "right" });
  }

  const filename = period === "monthly"
    ? `Hydranet_Expenses_${MONTHS[month-1]}_${year}.pdf`
    : `Hydranet_Expenses_${year}.pdf`;
  doc.save(filename);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function FinanceTab({ adminRole, permissions = [] }) {
  const canWrite = permissions.includes("finance_write") || adminRole === "super_admin";
  const currentYear  = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [expenses, setExpenses]     = useState([]);
  const [filterYear, setFilterYear]  = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterCat, setFilterCat]   = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [reportType, setReportType] = useState("monthly");
  const [genYear, setGenYear]       = useState(currentYear);
  const [genMonth, setGenMonth]     = useState(currentMonth);
  const [genLoading, setGenLoading] = useState(false);

  // Load expenses on demand (called when tab becomes active)
  const load = async () => {
    try {
      const params = { year: filterYear, month: filterMonth };
      if (filterCat) params.category = filterCat;
      const { data } = await api.get("/admin/expenses", { params });
      setExpenses(data);
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Load failed"); }
  };

  useEffect(() => {
    load();
    // The filter values intentionally control the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear, filterMonth, filterCat]);

  const applyFilter = () => { load(); };

  // Totals
  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const byCat = useMemo(() => {
    const map = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return map;
  }, [expenses]);

  const saveExpense = async (data) => {
    try {
      if (editing) {
        await api.patch(`/admin/expenses/${editing.id}`, data);
        toast.success("Expense updated");
      } else {
        await api.post("/admin/expenses", data);
        toast.success("Expense added");
      }
      setShowForm(false); setEditing(null); load();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed"); }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try { await api.delete(`/admin/expenses/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  };

  const downloadReport = async () => {
    setGenLoading(true);
    try {
      const params = { period: reportType, year: genYear };
      if (reportType === "monthly") params.month = genMonth;
      const { data } = await api.get("/admin/expenses/report", { params });
      generatePDF(data);
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Report failed"); }
    finally { setGenLoading(false); }
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
          className="rounded-md bg-[#0F172A] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
          className="rounded-md bg-[#0F172A] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
          {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="rounded-md bg-[#0F172A] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button onClick={applyFilter}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0F172A] border border-white/10 text-slate-300 hover:text-white text-sm transition-colors">
          <Filter size={13} /> Apply
        </button>
        <span className="text-slate-500 text-xs font-mono-metric ml-2">{expenses.length} entries</span>

        {canWrite && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2 ml-auto">
            <Plus size={14} /> Add Expense
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={<IndianRupee size={18} />} label="Total This Period" value={`₹${fmt(total)}`} color="#F26B21" />
        <SummaryCard icon={<BarChart3 size={18} />} label="No. of Entries"  value={String(expenses.length)} color="#3B82F6" />
        <SummaryCard icon={<TrendingDown size={18} />}
          label="Highest Category"
          value={Object.keys(byCat).length > 0
            ? catMeta(Object.entries(byCat).sort((a,b) => b[1]-a[1])[0][0]).label : "—"}
          color="#8B5CF6" />
        <SummaryCard icon={<Calendar size={18} />}
          label="Avg per Entry"
          value={expenses.length > 0 ? `₹${fmt(total / expenses.length)}` : "—"}
          color="#10B981" />
      </div>

      {/* Category breakdown mini bar */}
      {Object.keys(byCat).length > 0 && (
        <div className="rounded-xl border border-white/10 p-5 bg-[#0F172A]">
          <p className="text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-4">By Category</p>
          <div className="space-y-3">
            {EXPENSE_CATEGORIES.filter(c => byCat[c.value]).sort((a,b) => (byCat[b.value]||0)-(byCat[a.value]||0)).map(c => {
              const pct = total > 0 ? (byCat[c.value] / total) * 100 : 0;
              return (
                <div key={c.value} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-slate-400 text-right flex-shrink-0">{c.label}</div>
                  <div className="flex-1 h-2 bg-[#020617] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>
                  <div className="w-24 text-xs font-mono-metric text-right">
                    <span className="text-white">₹{fmt(byCat[c.value])}</span>
                    <span className="text-slate-500 ml-1">({pct.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PDF Report generator */}
      <div className="rounded-xl border border-white/10 p-5 bg-[#0F172A]">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-mono-metric text-slate-400 mb-3 flex items-center gap-2">
              <FileText size={12} className="text-[#F26B21]" /> Generate PDF Report
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <select value={reportType} onChange={e => setReportType(e.target.value)}
                className="rounded-md bg-[#020617] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
                <option value="monthly">Monthly Report</option>
                <option value="yearly">Yearly Report</option>
              </select>
              <select value={genYear} onChange={e => setGenYear(Number(e.target.value))}
                className="rounded-md bg-[#020617] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {reportType === "monthly" && (
                <select value={genMonth} onChange={e => setGenMonth(Number(e.target.value))}
                  className="rounded-md bg-[#020617] border border-white/10 text-slate-300 text-sm px-3 py-2 outline-none focus:border-[#F26B21]">
                  {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              )}
              <button onClick={downloadReport} disabled={genLoading}
                className="hn-btn-primary inline-flex items-center gap-2 text-sm !py-2 disabled:opacity-60">
                <Download size={14} /> {genLoading ? "Generating…" : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expense table */}
      {expenses.length === 0 ? (
        <div className="text-slate-400 py-16 text-center rounded-xl border border-white/5">
          <IndianRupee size={32} className="mx-auto mb-3 opacity-30" />
          <p>No expenses found for this period.</p>
          {canWrite && <button onClick={() => { setEditing(null); setShowForm(true); }} className="mt-4 hn-btn-primary text-sm !py-2">Add First Expense</button>}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead className="bg-[#0F172A]">
              <tr>
                <Th>Date</Th><Th>Category</Th><Th>Description</Th><Th>Mode</Th><Th>Reference</Th><Th>Amount ₹</Th>
                {canWrite && <Th></Th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.map(e => {
                const meta = catMeta(e.category);
                return (
                  <tr key={e.id} className="hover:bg-white/[0.02]">
                    <Td><span className="font-mono-metric text-xs">{e.date}</span></Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono-metric px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: meta.color + "22", color: meta.color }}>
                        {meta.label}
                      </span>
                    </Td>
                    <Td className="text-white max-w-[200px] truncate">{e.description}</Td>
                    <Td><span className="text-xs text-slate-400">{PAYMENT_MODES.find(m => m.value === e.payment_mode)?.label || e.payment_mode}</span></Td>
                    <Td><span className="text-xs text-slate-500 font-mono-metric">{e.reference || "—"}</span></Td>
                    <Td><span className="font-mono-metric font-semibold text-white">₹{fmt(e.amount)}</span></Td>
                    {canWrite && (
                      <Td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditing(e); setShowForm(true); }} className="p-1.5 rounded hover:bg-white/5 text-slate-400"><Edit3 size={13} /></button>
                          <button onClick={() => deleteExpense(e.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={13} /></button>
                        </div>
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#0F172A]">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-right text-xs uppercase tracking-widest font-mono-metric text-slate-400">Total</td>
                <td className="px-4 py-3 font-mono-metric font-bold text-[#F26B21] text-sm">₹{fmt(total)}</td>
                {canWrite && <td />}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showForm && (
        <ExpenseForm initial={editing} onSave={saveExpense} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

// ─── Expense Form Modal ────────────────────────────────────────────────────────
function ExpenseForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial
    ? { amount: initial.amount, category: initial.category, description: initial.description, date: initial.date, payment_mode: initial.payment_mode, reference: initial.reference || "" }
    : { ...EMPTY_EXPENSE });
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = e => { e.preventDefault(); onSave({ ...form, amount: Number(form.amount) }); };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-lg hn-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">{initial ? "Edit Expense" : "Add Expense"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Amount (₹)">
            <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={upd("amount")} className={inputCls} placeholder="0.00" />
          </FormField>
          <FormField label="Date">
            <input required type="date" value={form.date} onChange={upd("date")} className={inputCls} />
          </FormField>
          <FormField label="Category">
            <select value={form.category} onChange={upd("category")} className={inputCls}>
              {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField label="Payment Mode">
            <select value={form.payment_mode} onChange={upd("payment_mode")} className={inputCls}>
              {PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Description">
              <input required value={form.description} onChange={upd("description")} className={inputCls} placeholder="Brief description of expense" />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Reference / Invoice No. (optional)">
              <input value={form.reference} onChange={upd("reference")} className={inputCls} placeholder="e.g. INV-2024-001" />
            </FormField>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="hn-btn-secondary text-sm !py-2">Cancel</button>
            <button type="submit" className="hn-btn-primary text-sm !py-2">{initial ? "Save Changes" : "Add Expense"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Shared primitives ─────────────────────────────────────────────────────────
const Th = ({ children }) => <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-mono-metric font-medium text-slate-400">{children}</th>;
const Td = ({ children, className = "" }) => <td className={`px-4 py-3 text-slate-300 ${className}`}>{children}</td>;

const SummaryCard = ({ icon, label, value, color }) => (
  <div className="rounded-xl border border-white/10 p-5 bg-[#0F172A] flex items-start gap-3">
    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: color + "22", color }}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-mono-metric mb-1">{label}</p>
      <p className="font-display font-bold text-white text-lg truncate">{value}</p>
    </div>
  </div>
);
