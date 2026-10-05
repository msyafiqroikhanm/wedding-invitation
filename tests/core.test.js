import test from "node:test";
import assert from "node:assert/strict";
import { createSlug, isAllowedOrigin, isValidPhone, isValidSlug, normalizePhone, renderWhatsAppTemplate, validateGuest } from "../server/validation.js";
import { createSession } from "../server/auth.js";
import app, { safeUrl } from "../api/index.js";
import { guestTemplate, parseGuestWorkbook } from "../server/guest-import.js";
import ExcelJS from "exceljs";

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

test("validates party side for new guests while preserving legacy guest edits", () => {
  const input = { name: "Ayu", phone: "081234567890", connection: "Keluarga", side: "groom" };
  assert.deepEqual(validateGuest(input).guest, { ...input, phone: "6281234567890" });
  assert.match(validateGuest({ ...input, side: "" }).error, /pihak mempelai/);
  assert.equal(validateGuest({ ...input, side: "" }, { requireSide: false }).guest.side, "");
  assert.match(validateGuest({ ...input, side: "unknown" }, { requireSide: false }).error, /pihak mempelai/);
});

test("Excel template round-trips guests and skips duplicate normalized numbers", async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await guestTemplate());
  const sheet = workbook.worksheets[0];
  sheet.addRow(["Ayu", "081234567890", "Keluarga", "Mempelai pria"]);
  sheet.addRow(["Ayu lain", "+6281234567890", "Teman", "Mempelai wanita"]);
  sheet.addRow(["Bima", "081298765432", "Teman", "Mempelai wanita"]);
  const { guests, skipped } = await parseGuestWorkbook(await workbook.xlsx.writeBuffer());
  assert.equal(skipped, 1);
  assert.deepEqual(guests.map(({ name, phone, side }) => [name, phone, side]), [
    ["Ayu", "6281234567890", "groom"], ["Bima", "6281298765432", "bride"],
  ]);

  sheet.addRow(["Cici", 81234567890, "Keluarga", "Mempelai pria"]);
  await assert.rejects(parseGuestWorkbook(await workbook.xlsx.writeBuffer()), /Baris 5.*sebagai teks/);
  sheet.getRow(5).getCell(2).value = "081245678901";
  sheet.getRow(5).getCell(4).value = "Lainnya";
  await assert.rejects(parseGuestWorkbook(await workbook.xlsx.writeBuffer()), /Baris 5.*pihak mempelai/);
});

test("authenticated admin can download a template and gets a clear invalid-file error", async () => {
  const previous = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = "test-only-session-secret-at-least-32-characters";
  const server = app.listen(0);
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const cookie = `stillwater_session=${createSession("admin@example.com")}`;
    const denied = await fetch(`${base}/api/guests/template`);
    assert.equal(denied.status, 401);
    const template = await fetch(`${base}/api/guests/template`, { headers: { cookie } });
    assert.equal(template.status, 200);
    assert.match(template.headers.get("content-disposition"), /template-daftar-tamu.xlsx/);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(await template.arrayBuffer()));
    assert.equal(workbook.worksheets[0].getRow(1).getCell(4).text, "Tamu dari pihak");
    const invalid = await fetch(`${base}/api/guests/import`, {
      method: "POST", headers: { cookie, "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, body: "not an xlsx file",
    });
    assert.equal(invalid.status, 400);
    assert.match((await invalid.json()).error, /File Excel tidak dapat dibaca/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previous === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previous;
  }
});
