'use client';

import { useState } from "react";
import { submitFieldReport } from "@/app/actions/field";

interface Props {
  reports: Array<{
    id: string;
    notes: string;
    competitorInfo: string;
    stockObservation: string;
    createdAt: Date;
    pharmacy: { name: string };
  }>;
  pharmacies: Array<{ id: string; name: string; location: string }>;
}

export default function SalesRepDashboardClient({ reports, pharmacies }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    await submitFieldReport(formData);
    setIsSubmitting(false);
    window.location.reload();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form action={onSubmit} className="space-y-3 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-black">Submit field report</h2>
        <select name="pharmacyId" required className="w-full rounded-xl border p-3">
          <option value="">Select pharmacy</option>
          {pharmacies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - {p.location}
            </option>
          ))}
        </select>
        <textarea name="notes" required placeholder="Market notes" className="w-full rounded-xl border p-3 h-24" />
        <textarea name="competitorInfo" required placeholder="Competitor info" className="w-full rounded-xl border p-3 h-24" />
        <textarea name="stockObservation" required placeholder="Stock observations" className="w-full rounded-xl border p-3 h-24" />
        <button disabled={isSubmitting} className="rounded-xl bg-slate-900 text-white px-4 py-3 font-bold">
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-black mb-4">Past reports</h2>
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border p-3">
              <p className="font-semibold">{r.pharmacy.name}</p>
              <p className="text-sm text-slate-600">{r.notes}</p>
              <p className="text-xs text-slate-500 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
