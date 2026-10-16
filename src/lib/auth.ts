import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "foodverse_production_super_secret_jwt_key_2026";
const COOKIE_NAME = "foodverse_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "RESTAURANT_OWNER" | "RESTAURANT_STAFF" | "RIDER" | "ADMIN" | "CS_AGENT";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Demo quick-login users for instant testing of all roles
export const DEMO_ACCOUNTS = [
  { role: "CUSTOMER", email: "arjun@foodverse.io", label: "Customer (Arjun Sharma)", description: "Order food, 3D dish preview, Food Room, Flavor DNA" },
  { role: "RESTAURANT_OWNER", email: "chef.vikram@spicecraft.in", label: "Restaurant Partner (Spice Craft)", description: "Manage kitchen orders, menu stock, 3D verification" },
  { role: "RIDER", email: "suresh.rider@foodverse.io", label: "Delivery Partner (Suresh)", description: "Accept delivery tasks, navigate, verify customer OTP" },
  { role: "ADMIN", email: "admin@foodverse.io", label: "Admin HQ", description: "Dispute resolution, feature flags, audit logs & payouts" },
  { role: "CS_AGENT", email: "support@foodverse.io", label: "Support & Operations", description: "Customer refund tickets and True-Size reviews" },
];
