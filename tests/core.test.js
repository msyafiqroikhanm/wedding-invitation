import test from "node:test";
import assert from "node:assert/strict";
import { createSlug, isAllowedOrigin, isValidPhone, isValidSlug, normalizePhone, renderWhatsAppTemplate } from "../server/validation.js";
import { createSession } from "../server/auth.js";
import { safeUrl } from "../api/index.js";

test("normalizes Indonesian WhatsApp numbers", () => {
  assert.equal(normalizePhone("0812 3456 7890"), "6281234567890");
  assert.equal(normalizePhone("+62 812-3456-7890"), "6281234567890");
  assert.equal(isValidPhone("081234567890"), true);
  assert.equal(isValidPhone("123"), false);
});

test("creates strict non-guessable guest slugs", () => {
  const slug = createSlug("Budi & Keluarga");
  assert.match(slug, /^budi-keluarga-[a-f0-9]{32}$/);
  assert.equal(isValidSlug(slug), true);
  assert.equal(isValidSlug("budi-keluarga"), false);
});

test("renders only supported WhatsApp variables", () => {
  assert.equal(
    renderWhatsAppTemplate("Halo {{guest_name}} {{unknown}} {{ invite_url }}", {
      guest_name: "Budi",
      invite_url: "https://example.com/invite/budi-a1b2c3",
    }),
    "Halo Budi {{unknown}} https://example.com/invite/budi-a1b2c3",
  );
});

test("refuses to sign sessions without a strong secret", () => {
  const original = process.env.SESSION_SECRET;
  delete process.env.SESSION_SECRET;
  assert.throws(() => createSession("admin@example.com"), /minimal 32 karakter/);
  if (original) process.env.SESSION_SECRET = original;
});

test("accepts deployment and configured origins but rejects foreign origins", () => {
  assert.equal(isAllowedOrigin("https://wedding.vercel.app", "https://wedding.vercel.app", "http://localhost:5173"), true);
  assert.equal(isAllowedOrigin("http://localhost:5173", "http://localhost:3000", "http://localhost:5173/"), true);
  assert.equal(isAllowedOrigin("https://attacker.example", "https://wedding.vercel.app", "http://localhost:5173"), false);
});

test("accepts local media paths without allowing protocol-relative URLs", () => {
  assert.equal(safeUrl("/photos/couple-cover.webp"), "/photos/couple-cover.webp");
  assert.equal(safeUrl("//attacker.example/photo.webp"), "");
});
