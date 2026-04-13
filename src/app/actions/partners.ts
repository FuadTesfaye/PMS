'use server';

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createApiClient, logAuditEvent, setApiClientActive } from "@/lib/store";

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function createPartnerApiClientAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const scopes = formData.get("scopes") as string;
  if (!name || !scopes) return { error: "Missing fields" };

  const plaintextKey = `zpin_${randomBytes(24).toString("hex")}`;
  const keyHash = sha256(plaintextKey);
  const client = await createApiClient({ name, scopes, keyHash });

  await logAuditEvent({
    actorUserId: session.id,
    action: "api_client.create",
    entityType: "api_client",
    entityId: client.id,
    payload: JSON.stringify({ name, scopes }),
  });
  revalidatePath("/admin/dashboard");
  return { success: true, apiKey: plaintextKey };
}

export async function togglePartnerApiClientAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const active = formData.get("active") === "true";
  if (!id) return { error: "Missing id" };

  await setApiClientActive(id, active);
  await logAuditEvent({
    actorUserId: session.id,
    action: "api_client.toggle",
    entityType: "api_client",
    entityId: id,
    payload: JSON.stringify({ active }),
  });
  revalidatePath("/admin/dashboard");
  return { success: true };
}
