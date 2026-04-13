import { NextRequest, NextResponse } from "next/server";
import { generateComplianceExpiryAlerts, generateLowStockAlerts } from "@/lib/store";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-automation-key");
  if (!process.env.AUTOMATION_SECRET || secret !== process.env.AUTOMATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [lowStock, compliance] = await Promise.all([
    generateLowStockAlerts(10),
    generateComplianceExpiryAlerts(30),
  ]);

  return NextResponse.json({
    success: true,
    lowStockGenerated: lowStock.length,
    complianceGenerated: compliance.length,
  });
}
