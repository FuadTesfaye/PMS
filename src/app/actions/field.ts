'use server';

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createFieldReport } from "@/lib/store";

export async function submitFieldReport(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "sales_rep") return { error: "Unauthorized" };

  const pharmacyId = formData.get("pharmacyId") as string;
  const notes = formData.get("notes") as string;
  const competitorInfo = formData.get("competitorInfo") as string;
  const stockObservation = formData.get("stockObservation") as string;

  if (!pharmacyId || !notes || !competitorInfo || !stockObservation) {
    return { error: "All fields are required" };
  }

  try {
    await createFieldReport({
      salesRepId: session.id,
      pharmacyId,
      notes,
      competitorInfo,
      stockObservation,
    });
    revalidatePath("/sales-rep/dashboard");
    revalidatePath("/distributor/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to submit report" };
  }
}
