import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getApiClientByHash, touchApiClientUsage } from "@/lib/store";

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function authorizeInternalOrPartner(request: NextRequest, requiredScope: string) {
  const session = await getSession();
  if (session && (session.role === "admin" || session.role === "distributor")) {
    return { ok: true as const, mode: "internal" as const };
  }

  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) return { ok: false as const, reason: "Unauthorized" };

  const hash = sha256(apiKey);
  const client = await getApiClientByHash(hash);
  if (!client || !client.isActive) return { ok: false as const, reason: "Invalid API key" };

  const scopes = client.scopes.split(",").map((s) => s.trim());
  if (!scopes.includes(requiredScope) && !scopes.includes("*")) {
    return { ok: false as const, reason: "Insufficient scope" };
  }

  await touchApiClientUsage(client.id);
  return { ok: true as const, mode: "partner" as const, clientName: client.name };
}
