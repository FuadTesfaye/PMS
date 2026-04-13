'use server';

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { updateComplianceRecord, upsertPharmacyScore, logAuditEvent } from "@/lib/store";

export async function updateComplianceRecordAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "distributor")) {
    return { error: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const registrationStatus = formData.get("registrationStatus") as string;
  const notes = formData.get("notes") as string;
  const expiryDate = formData.get("expiryDate") as string;

  if (!id || !status || !registrationStatus || !notes || !expiryDate) {
    return { error: "Missing required fields" };
  }

  try {
    await updateComplianceRecord(id, { status, registrationStatus, notes, expiryDate });
    await logAuditEvent({
      actorUserId: session.id,
      action: "compliance.update",
      entityType: "compliance_record",
      entityId: id,
      payload: JSON.stringify({ status, registrationStatus }),
    });
    revalidatePath("/admin/dashboard");
    revalidatePath("/distributor/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to update compliance record" };
  }
}

export async function upsertPharmacyScoreAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "distributor")) {
    return { error: "Unauthorized" };
  }

  const pharmacyId = formData.get("pharmacyId") as string;
  const score = Number(formData.get("score"));
  const riskLevel = formData.get("riskLevel") as "low" | "medium" | "high";

  if (!pharmacyId || Number.isNaN(score) || !riskLevel) {
    return { error: "Invalid score payload" };
  }

  try {
    await upsertPharmacyScore({ pharmacyId, score, riskLevel });
    await logAuditEvent({
      actorUserId: session.id,
      action: "risk.score.upsert",
      entityType: "pharmacy_score",
      entityId: pharmacyId,
      payload: JSON.stringify({ score, riskLevel }),
    });
    revalidatePath("/admin/dashboard");
    revalidatePath("/distributor/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to save pharmacy score" };
  }
}
