import { NextRequest, NextResponse } from "next/server";
import { getOpenAlerts } from "@/lib/store";
import { authorizeInternalOrPartner } from "@/lib/partnerAuth";

export async function GET(request: NextRequest) {
  const auth = await authorizeInternalOrPartner(request, "distributor:alerts:read");
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 401 });

  const alerts = await getOpenAlerts();
  return NextResponse.json(alerts);
}
