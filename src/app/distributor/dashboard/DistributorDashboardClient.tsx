'use client';

interface DistributorDashboardClientProps {
  insights: {
    totalPharmacies: number;
    totalOrders: number;
    topMedicines: Array<{ medicineId: string; name: string; supplier: string; quantity: number }>;
    lowStockAlerts: Array<{ id: string; name: string; stock: number; supplier: string; predicted: string }>;
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
}

export default function DistributorDashboardClient({ insights, pharmacies, reports }: DistributorDashboardClientProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Total Pharmacies</p><p className="text-3xl font-black">{insights.totalPharmacies}</p></div>
        <div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Total Orders</p><p className="text-3xl font-black">{insights.totalOrders}</p></div>
        <div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">Low Stock Alerts</p><p className="text-3xl font-black">{insights.lowStockAlerts.length}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold mb-3">Trending drugs</h2>
          <div className="space-y-2">
            {insights.topMedicines.map((m) => (
              <div key={m.medicineId} className="flex justify-between text-sm">
                <span>{m.name} <span className="text-slate-400">({m.supplier})</span></span>
                <span className="font-bold">{m.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold mb-3">Low stock prediction</h2>
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
      </div>
    </div>
  );
}
