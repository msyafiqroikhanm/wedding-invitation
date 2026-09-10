// Browser-only fixture: no guest records or production data are created.
// Run: PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/check-invitation.mjs
import assert from "node:assert/strict";
import { createServer } from "vite";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const server = await createServer({ server: { port: 0 }, logLevel: "error" });
await server.listen();
const origin = `http://localhost:${server.httpServer.address().port}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const fixture = {
  guest: { name: "Tamu Pratinjau", slug: "design-check" },
  settings: {
    couple: { partnerOne: "Friska", partnerTwo: "Syafiq", fullNameOne: "Friska — pratinjau", fullNameTwo: "Syafiq — pratinjau", parentsOne: "Keterangan keluarga mempelai", parentsTwo: "Keterangan keluarga mempelai" },
    heroPhoto: "/photos/couple-cover.webp",
    profilePhotos: ["/photos/bride-portrait.webp", "/photos/groom-portrait.webp"],
    interludePhoto: "/photos/mountain-walk.webp",
    gallery: ["/photos/couple-cover.webp", "/photos/mountain-walk.webp", "/photos/bride-portrait.webp", "/photos/groom-portrait.webp"],
    events: [
      { label: "Akad Nikah", date: "2026-11-22", startTime: "08:00", endTime: "10:00", timezone: "Asia/Jakarta", venue: "Lokasi akad — pratinjau", address: "Alamat acara diisi melalui pengaturan undangan.", mapsUrl: "https://maps.google.com" },
      { label: "Resepsi", date: "2026-11-22", startTime: "11:00", endTime: "14:00", venue: "Lokasi resepsi — pratinjau", address: "Alamat acara diisi melalui pengaturan undangan.", mapsUrl: "https://maps.google.com" },
    ],
    giftAccounts: [{ provider: "Bank pratinjau", number: "0000000000", owner: "Nama pemilik" }],
  },
  wishes: [{ _id: "preview", message: "Semoga perjalanan bersama ini selalu dipenuhi kebahagiaan dan kasih sayang.", guestName: "Ucapan pratinjau" }],
};
const errors = [];
try {
  for (const [width, height] of [[390, 844], [1440, 1000], [320, 568], [924, 540]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(error.message));
    let submission;
    await page.route("**/api/public/invitations/**", (route) => {
      if (route.request().method() === "PUT") {
        submission = route.request().postDataJSON();
        return route.fulfill({ status: 204 });
      }
      return route.fulfill({ json: fixture });
    });
    await page.goto(`${origin}/invite/design-check`);
    await page.getByRole("button", { name: "Buka undangan" }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator(".invitation-content").evaluate((el) => el.inert), true);
    if (process.env.SCREENSHOT_DIR && width >= 390 && width !== 924) await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/cover-${width}.png` });
    await page.getByRole("button", { name: "Buka undangan" }).click();
    assert.equal(await page.locator(".invitation-cover").evaluate((el) => el.inert), true);
    for (const href of await page.locator(".invite-nav a").evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
      assert.equal(await page.locator(href).count(), 1, `Missing navigation destination ${href}`);
    }
    await page.getByRole("button", { name: "Lihat amplop digital" }).click();
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } }));
    await page.getByRole("button", { name: "Salin nomor" }).click();
    await page.getByText("Nomor belum tersalin.", { exact: false }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Tersalin", exact: true }).count(), 0);
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { value: { writeText: async (value) => { window.copiedValue = value; } } }));
    await page.getByRole("button", { name: "Salin nomor" }).click();
    await page.getByRole("button", { name: "Tersalin", exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.copiedValue), "0000000000");
    await page.getByRole("button", { name: "Tutup detail" }).click();
    assert.equal(await page.locator(".gift-panel").evaluate((el) => el.inert), true);
    await page.getByLabel("Ucapan", { exact: true }).fill("Selamat menempuh hidup baru!");
    await page.locator(".invite-wishes textarea").focus();
    await page.keyboard.press("ArrowLeft");
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".invite-wishes textarea")).outlineColor === "rgb(146, 183, 196)");
    const focus = await page.locator(".invite-wishes textarea").evaluate((el) => ({ color: getComputedStyle(el).outlineColor, width: getComputedStyle(el).outlineWidth }));
    assert.deepEqual(focus, { color: "rgb(146, 183, 196)", width: "3px" }, "The wish field needs a contrasting keyboard focus indicator");
    await page.getByRole("button", { name: "Kirim ucapan" }).click();
    await page.getByText("Ucapanmu sudah diterima dan menunggu persetujuan.").waitFor();
    assert.deepEqual(submission, { message: "Selamat menempuh hidup baru!", website: "" });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow at ${width}`);
    assert.equal(await page.locator("[data-reveal]").evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === "1")), true);
    if (process.env.SCREENSHOT_DIR && width >= 390 && width !== 924) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/invitation-${width}.png`, fullPage: true });
      for (const section of ["invite-hero", "couple-section", "events-section", "invite-gallery", "invite-wishes"]) {
        await page.locator(`.${section}`).screenshot({ path: `${process.env.SCREENSHOT_DIR}/${section}-${width}.png` });
      }
    }
    console.log(`PASS ${width}×${height}: open, navigation, gift, clipboard, wish, reduced motion, overflow`);
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", (error) => errors.push(error.message));
  let data = structuredClone(fixture);
  await page.route("**/api/public/invitations/**", (route) => route.fulfill({ json: data }));
  await page.goto(`${origin}/invite/design-check`);
  await page.getByRole("button", { name: "Buka undangan" }).click();
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; scrollTo(0, document.body.scrollHeight); });
  await page.waitForTimeout(1400);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(1400);
  assert.equal(await page.locator("[data-reveal]").evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === "1")), true, "Fast scrolling must not strand hidden content");
  for (const count of [0, 1, 9]) {
    data.settings.gallery = Array.from({ length: count }, (_, i) => fixture.settings.gallery[i % 4]);
    data.settings.couple.partnerOne = "Nama mempelai panjang untuk pengujian";
    data.settings.heroPhoto = "";
    await page.reload();
    await page.getByRole("button", { name: "Buka undangan" }).click();
    assert.equal(await page.locator(".gallery-photo").count(), count);
    assert.equal(await page.locator('.invite-nav a[href="#galeri"]').count(), count ? 1 : 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  console.log("PASS normal motion: fast scrolling, missing photo, long names, 0/1/9 gallery photos");
  await page.close();
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await server.close();
}
