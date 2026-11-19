// Renders the real invitation cover to public/og-invite.jpg, the WhatsApp/OG link preview image.
// Run: PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/render-og-cover.mjs
import { createServer } from "vite";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const server = await createServer({ server: { port: 0 }, logLevel: "error" });
await server.listen();
const origin = `http://localhost:${server.httpServer.address().port}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const fixture = {
  guest: { name: "Tamu", slug: "og-cover" },
  settings: {
    couple: { partnerOne: "Friska", partnerTwo: "Syafiq" },
    heroPhoto: "/photos/couple-cover.webp",
    events: [{ label: "Akad Nikah", date: "2026-11-29", startTime: "08:00", timezone: "Asia/Jakarta" }],
    profilePhotos: ["", ""],
    gallery: [],
    giftAccounts: [],
  },
  wishes: [],
};
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await page.route("**/api/public/invitations/**", (route) => route.fulfill({ json: fixture }));
  await page.goto(`${origin}/invite/og-cover`);
  await page.getByRole("button", { name: "Buka undangan" }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  // Generic image: guest greeting and button belong to the live page, not the shared preview.
  await page.addStyleTag({ content: ".guest-address { display: none } .cover-names { grid-row: 1 / 3; align-self: center }" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "public/og-invite.jpg", type: "jpeg", quality: 85 });
} finally {
  await browser.close();
  await server.close();
}
