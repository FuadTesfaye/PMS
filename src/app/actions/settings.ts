'use server';

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { upsertSystemSetting, logAuditEvent } from "@/lib/store";

export async function saveSystemSettingAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "distributor")) {
    return { error: "Unauthorized" };
  }

  const key = formData.get("key") as string;
  const value = formData.get("value") as string;
  const description = formData.get("description") as string;
  if (!key || value === undefined || !description) return { error: "Invalid payload" };

  await upsertSystemSetting({ key, value, description });
  await logAuditEvent({
    actorUserId: session.id,
    action: "settings.upsert",
    entityType: "system_setting",
    entityId: key,
    payload: JSON.stringify({ value }),
  });
  revalidatePath("/admin/dashboard");
  revalidatePath("/distributor/dashboard");
  return { success: true };
}
