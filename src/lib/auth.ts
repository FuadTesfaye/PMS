import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "change-this-jwt-secret-in-prod";
const SECRET = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload extends JWTPayload {
  id: string;
  name: string;
  role: UserRole;
  pharmacyId?: string | null;
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, SECRET, {
    algorithms: ["HS256"],
  });
  return payload as SessionPayload;
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;

  try {
    return await decrypt(session);
  } catch {
    return null;
  }
}
