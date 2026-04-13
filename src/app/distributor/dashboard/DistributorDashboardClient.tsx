'use client';

import { useMemo, useState } from "react";
import { generateAlertsAction, resolveAlertAction } from "@/app/actions/distribution";

interface DistributorDashboardClientProps {
  insights: {
    totalPharmacies: number;
    totalOrders: number;
    topMedicines: Array<{ medicineId: string; name: string; supplier: string; quantity: number }>;
    lowStockAlerts: Array<{ id: string; name: string; stock: number; supplier: string; predicted: string }>;
    highDemandAreas: Array<{ pharmacyId: string; pharmacyName: string; location: string; orderCount: number; totalValue: number }>;
    prescriptionTrends: Array<{ medicineId: string; name: string; quantity: number }>;
    restockRecommendations: Array<{
      medicineId: string;
      name: string;
      supplier: string;
      currentStock: number;
      recommendedRestockQty: number;
      urgency: string;
    }>;
    windowDays: number;
    supplierFilter: string;
  };
  pharmacies: Array<{ id: string; name: string; location: string; contact: string }>;
  reports: Array<{
    id: string;
    notes: string;
    competitorInfo: string;
    stockObservation: string;
    createdAt: Date;
    pharmacy: { name: string };
  }>;
  alerts: Array<{
    id: string;
    title: string;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    pharmacy: { name: string; location: string };
    medicine: { name: string; supplier: string } | null;
  }>;
  auditTrails: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: Date;
    actor: { name: string; role: string };
  }>;
}

export default function DistributorDashboardClient({
  insights,
  pharmacies,
  reports,
  alerts,
  auditTrails,
}: DistributorDashboardClientProps) {
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const suppliers = useMemo(
    () => ["all", ...Array.from(new Set(insights.topMedicines.map((m) => m.supplier)))],
    [insights.topMedicines]
  );
  const filteredTop = useMemo(
    () => insights.topMedicines.filter((m) => supplierFilter === "all" || m.supplier === supplierFilter),
    [insights.topMedicines, supplierFilter]
  );
  const [windowDays, setWindowDays] = useState(String(insights.windowDays));

  async function generateAlerts() {
    setIsGenerating(true);
    await generateAlertsAction();
    setIsGenerating(false);
    window.location.reload();
  }

  async function handleResolveAlert(formData: FormData) {
    await resolveAlertAction(formData);
    window.location.reload();
  }

  return (
    <div className="space-y-8">
      <form method="GET" className="rounded-2xl border bg-white p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Window</label>
          <select
            name="days"
            value={windowDays}
            onChange={(e) => setWindowDays(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Supplier</label>
          <select
            name="supplier"
            defaultValue={insights.supplierFilter}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {suppliers.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All suppliers" : s}
              </option>
            ))}
          </select>
        </div>
        <button className="bg-slate-900 text-white rounded-lg px-3 py-2 text-sm font-bold">Apply Filters</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Total Pharmacies</p><p className="text-3xl font-black">{insights.totalPharmacies}</p></div>
        <div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Total Orders</p><p className="text-3xl font-black">{insights.totalOrders}</p></div>
        <div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Low Stock Alerts</p><p className="text-3xl font-black">{insights.lowStockAlerts.length}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Trending drugs</h2>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="text-xs border rounded-lg px-2 py-1"
            >
              {suppliers.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All suppliers" : s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            {filteredTop.map((m) => (
              <div key={m.medicineId} className="flex justify-between text-sm">
                <span>{m.name} <span className="text-slate-400">({m.supplier})</span></span>
                <span className="font-bold">{m.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Low stock prediction</h2>
            <button
              onClick={generateAlerts}
              disabled={isGenerating}
              className="text-xs font-bold bg-slate-900 text-white px-2 py-1 rounded-lg"
            >
              {isGenerating ? "Generating..." : "Generate alerts"}
            </button>
          </div>
          <div className="space-y-2">
            {insights.lowStockAlerts.map((m) => (
              <div key={m.id} className="flex justify-between text-sm">
                <span>{m.name}</span>
                <span className="font-bold text-rose-600">{m.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold mb-3">Pharmacy map/list (national)</h2>
          <div className="space-y-2 text-sm">
            {pharmacies.map((p) => (
              <div key={p.id} className="flex justify-between">
                <span>{p.name} - {p.location}</span>
                <span className="text-slate-500">{p.contact}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold mb-3">High demand areas (field-driven)</h2>
          <div className="space-y-2 text-sm">
            {reports.slice(0, 8).map((r) => (
              <div key={r.id} className="border-b pb-2">
                <p className="font-semibold">{r.pharmacy.name}</p>
                <p className="text-slate-600">{r.stockObservation}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold mb-3">Prescription intelligence trends</h2>
          <div className="space-y-2 text-sm">
            {insights.prescriptionTrends.map((r) => (
              <div key={r.medicineId} className="flex justify-between">
                <span>{r.name}</span>
                <span className="font-bold">{r.quantity} Rx units</span>
              </div>
            ))}
          </div>
          <h3 className="font-semibold mt-5 mb-2">High demand pharmacies</h3>
          <div className="space-y-2 text-sm">
            {insights.highDemandAreas.slice(0, 4).map((h) => (
              <div key={h.pharmacyId} className="flex justify-between">
                <span>{h.pharmacyName} ({h.location})</span>
                <span className="font-bold">{h.orderCount} orders</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold mb-3">Smart restock recommendations</h2>
          <div className="space-y-2 text-sm">
            {insights.restockRecommendations.map((r) => (
              <div key={r.medicineId} className="flex justify-between border-b pb-1">
                <span>{r.name} ({r.supplier})</span>
                <span className="font-bold">+{r.recommendedRestockQty}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold mb-3">Open alerts</h2>
          <div className="space-y-2 text-sm max-h-64 overflow-auto pr-1">
            {alerts.map((a) => (
              <form key={a.id} action={handleResolveAlert} className="border rounded-lg p-2">
                <input type="hidden" name="id" value={a.id} />
                <p className="font-semibold">{a.title}</p>
                <p className="text-slate-600">{a.message}</p>
                <p className="text-xs text-slate-400">{a.pharmacy.name} - {a.pharmacy.location}</p>
                <button className="text-xs font-bold text-indigo-600 mt-1">Resolve</button>
              </form>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold mb-3">Audit trail</h2>
          <div className="space-y-2 text-xs max-h-64 overflow-auto pr-1">
            {auditTrails.map((a) => (
              <div key={a.id} className="border rounded-lg p-2">
                <p className="font-semibold">{a.action}</p>
                <p>{a.actor.name} ({a.actor.role})</p>
                <p className="text-slate-500">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
