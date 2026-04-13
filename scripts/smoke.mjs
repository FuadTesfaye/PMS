const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";

const checks = [
  { path: "/login", allow: [200] },
  { path: "/", allow: [307, 308] },
  { path: "/pharmacy/dashboard", allow: [307, 308] },
  { path: "/pharmacist/dashboard", allow: [307, 308] },
  { path: "/admin/dashboard", allow: [307, 308] },
  { path: "/distributor/dashboard", allow: [307, 308] },
  { path: "/sales-rep/dashboard", allow: [307, 308] },
  { path: "/api/v1/distributor/kpis", allow: [401] },
];

async function run() {
  let failed = 0;
  for (const c of checks) {
    const res = await fetch(`${baseUrl}${c.path}`, { redirect: "manual" });
    const ok = c.allow.includes(res.status);
    console.log(`${ok ? "PASS" : "FAIL"} ${c.path} -> ${res.status}`);
    if (!ok) failed += 1;
  }

  if (failed > 0) {
    console.error(`Smoke checks failed: ${failed}`);
    process.exit(1);
  }
  console.log("Smoke checks passed.");
}

run().catch((err) => {
  console.error("Smoke run error:", err);
  process.exit(1);
});
