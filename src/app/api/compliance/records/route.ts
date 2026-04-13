import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getComplianceRecords } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "distributor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await getComplianceRecords();
  return NextResponse.json(records);
}
