'use server';

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { generateLowStockAlerts, resolveAlert, logAuditEvent } from "@/lib/store";

export async function generateAlertsAction() {
  const session = await getSession();
  if (!session || (session.role !== "distributor" && session.role !== "admin")) {
    return { error: "Unauthorized" };
  }

  const ids = await generateLowStockAlerts(10);
  await logAuditEvent({
    actorUserId: session.id,
    action: "alerts.generate",
    entityType: "alert",
    entityId: "bulk",
    payload: JSON.stringify({ generated: ids.length }),
  });
  revalidatePath("/distributor/dashboard");
  return { success: true, count: ids.length };
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
