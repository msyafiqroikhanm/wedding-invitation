import { randomBytes } from "node:crypto";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{32}$/;

export function normalizePhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}

export function isValidPhone(value) {
  return /^62[1-9]\d{7,12}$/.test(normalizePhone(value));
}

export function createSlug(name) {
  const base = String(name ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "tamu";
  return `${base}-${randomBytes(16).toString("hex")}`;
}

export function isValidSlug(value) {
  return SLUG_PATTERN.test(String(value ?? ""));
}

export function renderWhatsAppTemplate(template, values) {
  return String(template ?? "").replace(/{{\s*(guest_name|couple_names|event_date|invite_url)\s*}}/g, (_, key) => values[key] ?? "");
}

export function cleanText(value, max = 500) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

export function isAllowedOrigin(origin, requestOrigin, configuredOrigin) {
  if (!origin) return true;
  try {
    const normalized = new URL(origin).origin;
    return [requestOrigin, configuredOrigin].filter(Boolean).some((candidate) => new URL(candidate).origin === normalized);
  } catch {
    return false;
  }
}
