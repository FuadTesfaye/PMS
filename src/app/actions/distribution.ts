'use server';

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { generateLowStockAlerts, resolveAlert, logAuditEvent, getSystemSettingValue, generateComplianceExpiryAlerts } from "@/lib/store";

export async function generateAlertsAction() {
  const session = await getSession();
  if (!session || (session.role !== "distributor" && session.role !== "admin")) {
    return { error: "Unauthorized" };
  }

  const lowStockThreshold = Number(await getSystemSettingValue("threshold.low_stock", "10"));
  const expiryDays = Number(await getSystemSettingValue("threshold.compliance_expiry_days", "30"));
  const [ids, complianceIds] = await Promise.all([
    generateLowStockAlerts(Number.isFinite(lowStockThreshold) ? lowStockThreshold : 10),
    generateComplianceExpiryAlerts(Number.isFinite(expiryDays) ? expiryDays : 30),
  ]);
  await logAuditEvent({
    actorUserId: session.id,
    action: "alerts.generate",
    entityType: "alert",
    entityId: "bulk",
    payload: JSON.stringify({ generatedLowStock: ids.length, generatedCompliance: complianceIds.length }),
  });
  revalidatePath("/distributor/dashboard");
  return { success: true, count: ids.length + complianceIds.length };
}

export async function resolveAlertAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "distributor" && session.role !== "admin")) {
    return { error: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing alert id" };

  await resolveAlert(id);
  await logAuditEvent({
    actorUserId: session.id,
    action: "alerts.resolve",
    entityType: "alert",
    entityId: id,
  });
  revalidatePath("/distributor/dashboard");
  return { success: true };
}
