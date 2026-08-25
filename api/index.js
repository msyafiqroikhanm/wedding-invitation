import express from "express";
import { del } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";
import { pathToFileURL } from "node:url";
import { clearSessionCookie, createSession, readSession, requireAdmin, setSessionCookie, verifyPassword } from "../server/auth.js";
import { getDb, toObjectId } from "../server/db.js";
import { cleanText, createSlug, isAllowedOrigin, isValidPhone, isValidSlug, normalizePhone } from "../server/validation.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

app.use((req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
  const origin = req.get("origin");
  const protocol = String(req.get("x-forwarded-proto") || req.protocol).split(",")[0].trim();
  const host = String(req.get("x-forwarded-host") || req.get("host")).split(",")[0].trim();
  if (!isAllowedOrigin(origin, `${protocol}://${host}`, process.env.APP_URL)) return res.status(403).json({ error: "Origin request tidak diizinkan." });
  next();
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/login", asyncRoute(async (req, res) => {
  if (!await allowRequest(`login:${req.ip}`, 8, 15 * 60 * 1000)) return res.status(429).json({ error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." });
  const email = cleanText(req.body.email, 160).toLowerCase();
  const expectedEmail = String(process.env.ADMIN_EMAIL ?? "").toLowerCase();
  if (!expectedEmail || email !== expectedEmail || !await verifyPassword(String(req.body.password ?? ""))) {
    return res.status(401).json({ error: "Email atau password tidak sesuai." });
  }
  setSessionCookie(res, createSession(email));
  res.json({ email });
}));

app.post("/api/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

app.get("/api/auth/session", (req, res) => {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: "Sesi tidak ditemukan." });
  res.json({ email: session.email });
});

app.get("/api/guests", requireAdmin, asyncRoute(async (_req, res) => {
  const db = await getDb();
  const guests = await db.collection("guests").find().sort({ createdAt: -1 }).toArray();
  res.json(guests);
}));

app.post("/api/guests", requireAdmin, asyncRoute(async (req, res) => {
  const name = cleanText(req.body.name, 120);
  const phone = normalizePhone(req.body.phone);
  const connection = cleanText(req.body.connection, 80);
  if (!name || !connection || !isValidPhone(phone)) return res.status(400).json({ error: "Nama, koneksi, dan nomor WhatsApp valid wajib diisi." });
  const now = new Date();
  const guest = { name, phone, connection, slug: createSlug(name), sentAt: null, createdAt: now, updatedAt: now };
  const db = await getDb();
  const result = await db.collection("guests").insertOne(guest);
  res.status(201).json({ ...guest, _id: result.insertedId });
}));

app.patch("/api/guests/:id", requireAdmin, asyncRoute(async (req, res) => {
  const id = toObjectId(req.params.id);
  const name = cleanText(req.body.name, 120);
  const phone = normalizePhone(req.body.phone);
  const connection = cleanText(req.body.connection, 80);
  if (!id || !name || !connection || !isValidPhone(phone)) return res.status(400).json({ error: "Data tamu tidak valid." });
  const db = await getDb();
  const guest = await db.collection("guests").findOneAndUpdate(
    { _id: id },
    { $set: { name, phone, connection, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!guest) return res.status(404).json({ error: "Tamu tidak ditemukan." });
  res.json(guest);
}));

app.delete("/api/guests/:id", requireAdmin, asyncRoute(async (req, res) => {
  const id = toObjectId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID tamu tidak valid." });
  const db = await getDb();
  const result = await db.collection("guests").deleteOne({ _id: id });
  if (!result.deletedCount) return res.status(404).json({ error: "Tamu tidak ditemukan." });
  await db.collection("wishes").deleteOne({ guestId: id });
  res.status(204).end();
}));

app.post("/api/guests/:id/mark-sent", requireAdmin, asyncRoute(async (req, res) => {
  const id = toObjectId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID tamu tidak valid." });
  const db = await getDb();
  const guest = await db.collection("guests").findOneAndUpdate(
    { _id: id },
    { $set: { sentAt: new Date(), updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!guest) return res.status(404).json({ error: "Tamu tidak ditemukan." });
  res.json(guest);
}));

app.post("/api/guests/:id/reset-sent", requireAdmin, asyncRoute(async (req, res) => {
  const id = toObjectId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID tamu tidak valid." });
  const db = await getDb();
  const guest = await db.collection("guests").findOneAndUpdate(
    { _id: id },
    { $set: { sentAt: null, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!guest) return res.status(404).json({ error: "Tamu tidak ditemukan." });
  res.json(guest);
}));

app.post("/api/guests/:id/regenerate-slug", requireAdmin, asyncRoute(async (req, res) => {
  const id = toObjectId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID tamu tidak valid." });
  const db = await getDb();
  const current = await db.collection("guests").findOne({ _id: id });
  if (!current) return res.status(404).json({ error: "Tamu tidak ditemukan." });
  const guest = await db.collection("guests").findOneAndUpdate(
    { _id: id },
    { $set: { slug: createSlug(current.name), updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  res.json(guest);
}));

app.get("/api/settings", requireAdmin, asyncRoute(async (_req, res) => {
  const db = await getDb();
  res.json((await db.collection("settings").findOne({ _id: "main" })) ?? defaultSettings());
}));

app.patch("/api/settings", requireAdmin, asyncRoute(async (req, res) => {
  const settings = sanitizeSettings(req.body);
  const db = await getDb();
  const result = await db.collection("settings").findOneAndUpdate(
    { _id: "main" },
    { $set: { ...settings, updatedAt: new Date() } },
    { upsert: true, returnDocument: "after" },
  );
  res.json(result);
}));

app.post("/api/uploads", requireAdmin, asyncRoute(async (req, res) => {
  const response = await handleUpload({
    body: req.body,
    request: req,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/mp4", "audio/x-m4a"],
      maximumSizeInBytes: 15 * 1024 * 1024,
      addRandomSuffix: true,
    }),
  });
  res.json(response);
}));

app.delete("/api/uploads", requireAdmin, asyncRoute(async (req, res) => {
  const url = String(req.body.url ?? "");
  const parsed = safeBlobUrl(url);
  if (!parsed) return res.status(400).json({ error: "URL media tidak valid." });
  await del(parsed.href);
  res.status(204).end();
}));

app.get("/api/wishes", requireAdmin, asyncRoute(async (req, res) => {
  const status = ["pending", "approved", "rejected"].includes(req.query.status) ? req.query.status : "pending";
  const db = await getDb();
  res.json(await db.collection("wishes").find({ status }).sort({ createdAt: -1 }).toArray());
}));

app.patch("/api/wishes/:id/status", requireAdmin, asyncRoute(async (req, res) => {
  const id = toObjectId(req.params.id);
  const status = ["approved", "rejected"].includes(req.body.status) ? req.body.status : null;
  if (!id || !status) return res.status(400).json({ error: "Status ucapan tidak valid." });
  const db = await getDb();
  const wish = await db.collection("wishes").findOneAndUpdate(
    { _id: id },
    { $set: { status, moderatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!wish) return res.status(404).json({ error: "Ucapan tidak ditemukan." });
  res.json(wish);
}));

app.delete("/api/wishes/:id", requireAdmin, asyncRoute(async (req, res) => {
  const id = toObjectId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID ucapan tidak valid." });
  const db = await getDb();
  await db.collection("wishes").deleteOne({ _id: id });
  res.status(204).end();
}));

app.get("/api/public/invitations/:slug", asyncRoute(async (req, res) => {
  if (!isValidSlug(req.params.slug)) return res.status(404).json({ error: "Undangan tidak ditemukan." });
  if (!await allowRequest(`invite:${req.ip}`, 120, 15 * 60 * 1000)) return res.status(429).json({ error: "Terlalu banyak permintaan. Coba kembali nanti." });
  const db = await getDb();
  const guest = await db.collection("guests").findOne({ slug: req.params.slug });
  if (!guest) return res.status(404).json({ error: "Undangan tidak ditemukan." });
  const settings = (await db.collection("settings").findOne({ _id: "main" })) ?? defaultSettings();
  const wishes = await db.collection("wishes").find({ status: "approved" }).sort({ createdAt: -1 }).limit(20).toArray();
  res.set("Cache-Control", "private, no-store");
  res.json({ guest: { name: guest.name, slug: guest.slug }, settings: publicSettings(settings), wishes: wishes.map(publicWish) });
}));

app.put("/api/public/invitations/:slug/wish", asyncRoute(async (req, res) => {
  if (!isValidSlug(req.params.slug) || req.body.website) return res.status(404).json({ error: "Undangan tidak ditemukan." });
  if (!await allowRequest(`wish:${req.ip}`, 12, 60 * 60 * 1000)) return res.status(429).json({ error: "Terlalu banyak ucapan. Coba kembali nanti." });
  const message = cleanText(req.body.message, 500);
  if (message.length < 3) return res.status(400).json({ error: "Tuliskan ucapan minimal 3 karakter." });
  const db = await getDb();
  const guest = await db.collection("guests").findOne({ slug: req.params.slug });
  if (!guest) return res.status(404).json({ error: "Undangan tidak ditemukan." });
  const wish = await db.collection("wishes").findOneAndUpdate(
    { guestId: guest._id },
    { $set: { guestName: guest.name, message, status: "pending", createdAt: new Date(), moderatedAt: null } },
    { upsert: true, returnDocument: "after" },
  );
  res.json({ _id: wish._id, status: wish.status });
}));

app.use("/api", (_req, res) => res.status(404).json({ error: "Endpoint tidak ditemukan." }));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Terjadi kendala di server. Coba kembali." });
});

function defaultSettings() {
  return {
    _id: "main",
    couple: { partnerOne: "", partnerTwo: "", fullNameOne: "", fullNameTwo: "", openingText: "", closingText: "" },
    events: [emptyEvent("Akad"), emptyEvent("Resepsi")],
    heroPhoto: "",
    profilePhotos: ["", ""],
    gallery: [],
    backsound: "",
    giftAccounts: [],
    whatsappTemplate: "Halo {{guest_name}},\n\nKami mengundang Anda untuk hadir di pernikahan {{couple_names}}.\n\nDetail undangan:\n{{invite_url}}",
  };
}

function emptyEvent(label) {
  return { label, date: "", startTime: "", endTime: "", timezone: "Asia/Jakarta", venue: "", address: "", mapsUrl: "", note: "" };
}

function sanitizeSettings(input) {
  const fallback = defaultSettings();
  const couple = input.couple ?? {};
  const events = Array.from({ length: 2 }, (_, index) => {
    const event = input.events?.[index] ?? fallback.events[index];
    return {
      label: cleanText(event.label, 60), date: cleanText(event.date, 10), startTime: cleanText(event.startTime, 5), endTime: cleanText(event.endTime, 5),
      timezone: cleanText(event.timezone, 40) || "Asia/Jakarta", venue: cleanText(event.venue, 120), address: cleanText(event.address, 300),
      mapsUrl: /^https:\/\//.test(event.mapsUrl ?? "") ? String(event.mapsUrl).slice(0, 500) : "", note: cleanText(event.note, 240),
    };
  });
  return {
    couple: {
      partnerOne: cleanText(couple.partnerOne, 80), partnerTwo: cleanText(couple.partnerTwo, 80), fullNameOne: cleanText(couple.fullNameOne, 120),
      fullNameTwo: cleanText(couple.fullNameTwo, 120), openingText: cleanText(couple.openingText, 500), closingText: cleanText(couple.closingText, 500),
    },
    events,
    heroPhoto: safeUrl(input.heroPhoto),
    profilePhotos: Array.from({ length: 2 }, (_, index) => safeUrl(input.profilePhotos?.[index])),
    gallery: (input.gallery ?? []).slice(0, 12).map(safeUrl).filter(Boolean),
    backsound: safeUrl(input.backsound),
    giftAccounts: (input.giftAccounts ?? []).slice(0, 4).map((account) => ({
      provider: cleanText(account.provider, 60), number: cleanText(account.number, 60), owner: cleanText(account.owner, 120),
    })).filter((account) => account.provider && account.number),
    whatsappTemplate: cleanText(input.whatsappTemplate || fallback.whatsappTemplate, 1200),
  };
}

function safeUrl(value) {
  return /^https:\/\//.test(value ?? "") ? String(value).slice(0, 1000) : "";
}

function publicSettings(settings) {
  const { _id, updatedAt, whatsappTemplate, ...visible } = settings;
  return visible;
}

function publicWish(wish) {
  return { _id: wish._id, guestName: wish.guestName, message: wish.message, createdAt: wish.createdAt };
}

async function allowRequest(key, limit, windowMs) {
  const db = await getDb();
  const collection = db.collection("rateLimits");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const now = new Date();
    const incremented = await collection.updateOne(
      { _id: key, expiresAt: { $gt: now }, count: { $lt: limit } },
      { $inc: { count: 1 } },
    );
    if (incremented.modifiedCount) return true;

    const current = await collection.findOne({ _id: key });
    if (current?.expiresAt > now) return false;
    if (current) {
      const reset = await collection.updateOne(
        { _id: key, expiresAt: current.expiresAt },
        { $set: { count: 1, expiresAt: new Date(now.getTime() + windowMs) } },
      );
      if (reset.modifiedCount) return true;
      continue;
    }
    try {
      await collection.insertOne({ _id: key, count: 1, expiresAt: new Date(now.getTime() + windowMs) });
      return true;
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }
  return false;
}

function safeBlobUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com") ? url : null;
  } catch {
    return null;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  app.listen(3000, () => console.log("API berjalan di http://localhost:3000"));
}

export default app;
