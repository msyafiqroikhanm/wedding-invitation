import { createHmac, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const COOKIE_NAME = "stillwater_session";
const SESSION_AGE = 60 * 60 * 24 * 7;
const deriveKey = promisify(scrypt);

function sign(value) {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error("SESSION_SECRET minimal 32 karakter");
  return createHmac("sha256", process.env.SESSION_SECRET)
    .update(value)
    .digest("base64url");
}

export async function verifyPassword(password, storedHash = process.env.ADMIN_PASSWORD_HASH) {
  if (!storedHash?.includes(":")) return false;
  const [salt, expectedHex] = storedHash.split(":");
  const actual = await deriveKey(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSession(email) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_AGE })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSession(req) {
  const cookies = Object.fromEntries(
    String(req.headers.cookie ?? "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value),
  );
  const [payload, signature] = String(cookies[COOKIE_NAME] ?? "").split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString());
    return session.exp > Date.now() / 1000 ? session : null;
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_AGE}${secure}`);
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function requireAdmin(req, res, next) {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: "Sesi berakhir. Silakan masuk kembali." });
  req.session = session;
  next();
}
