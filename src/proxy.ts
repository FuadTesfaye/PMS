import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

function roleHome(role: string) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "pharmacist") return "/pharmacist/dashboard";
  if (role === "distributor") return "/distributor/dashboard";
  if (role === "sales_rep") return "/sales-rep/dashboard";
  return "/pharmacy/dashboard";
}

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  if (!sessionCookie) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/pharmacist") ||
      pathname.startsWith("/pharmacy") ||
      pathname.startsWith("/distributor") ||
      pathname.startsWith("/sales-rep")
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  let session: { role: string } | null = null;
  try {
    session = await decrypt(sessionCookie);
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL(roleHome(session.role), request.url));
  }

  const checks: Array<[string, string]> = [
    ["/admin", "admin"],
    ["/pharmacist", "pharmacist"],
    ["/pharmacy", "pharmacy"],
    ["/distributor", "distributor"],
    ["/sales-rep", "sales_rep"],
  ];

  for (const [route, role] of checks) {
    if (pathname.startsWith(route) && session.role !== role) {
      return NextResponse.redirect(new URL(roleHome(session.role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
