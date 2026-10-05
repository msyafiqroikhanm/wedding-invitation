import ExcelJS from "exceljs";
import { GUEST_SIDES, validateGuest } from "./validation.js";

const HEADERS = ["Nama tamu", "Nomor WhatsApp", "Koneksi", "Tamu dari pihak"];
const MAX_GUESTS = 500;

export async function guestTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Daftar tamu");
  sheet.addRow(HEADERS);
  sheet.columns = [{ width: 34 }, { width: 25, style: { numFmt: "@" } }, { width: 24 }, { width: 24 }];
  sheet.getRow(1).font = { bold: true };
  sheet.getColumn(4).eachCell({ includeEmpty: true }, (cell) => { cell.numFmt = "@"; });
  const instructions = workbook.addWorksheet("Petunjuk");
  instructions.getColumn(1).width = 90;
  instructions.addRow(["Isi satu tamu per baris di sheet Daftar tamu. Jangan ubah judul kolom."]);
  instructions.addRow(["Nomor WhatsApp ditulis sebagai teks, misalnya 081234567890 atau +6281234567890."]);
  instructions.addRow([`Tamu dari pihak: ${Object.values(GUEST_SIDES).join(" atau ")}.`]);
  instructions.addRow(["Baris kosong diabaikan. Nomor yang sudah terdaftar akan dilewati."]);
  return workbook.xlsx.writeBuffer();
}

export async function parseGuestWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch {
    throw new Error("File Excel tidak dapat dibaca. Gunakan template .xlsx yang tersedia.");
  }
  const sheet = workbook.worksheets[0];
  if (!sheet || HEADERS.some((header, index) => sheet.getRow(1).getCell(index + 1).text.trim() !== header)) {
    throw new Error("Judul kolom tidak sesuai. Unduh dan gunakan template terbaru.");
  }

  if (sheet.rowCount > 10000) throw new Error("Terlalu banyak baris dalam file Excel.");
  const guests = [];
  const seen = new Set();
  let skipped = 0;
  for (let number = 2; number <= sheet.rowCount; number += 1) {
    const row = sheet.getRow(number);
    const cells = HEADERS.map((_, index) => row.getCell(index + 1));
    if (cells.every((cell) => !cell.text.trim())) continue;
    if (guests.length + skipped >= MAX_GUESTS) throw new Error(`Maksimal ${MAX_GUESTS} baris tamu per impor.`);
    if (cells.some((cell) => cell.value && typeof cell.value === "object" && "formula" in cell.value)) {
      throw new Error(`Baris ${number}: gunakan nilai biasa, bukan rumus Excel.`);
    }
    if (typeof cells[1].value === "number") {
      throw new Error(`Baris ${number}: tulis nomor WhatsApp sebagai teks agar angka 0 di awal tidak hilang.`);
    }
    const side = Object.entries(GUEST_SIDES).find(([, label]) => label.toLowerCase() === cells[3].text.trim().toLowerCase())?.[0];
    const { guest, error } = validateGuest({ name: cells[0].text, phone: cells[1].text, connection: cells[2].text, side });
    if (error) throw new Error(`Baris ${number}: ${error}`);
    if (seen.has(guest.phone)) { skipped += 1; continue; }
    seen.add(guest.phone);
    guests.push(guest);
  }
  if (!guests.length && !skipped) throw new Error("Daftar tamu masih kosong. Isi template sebelum mengimpor.");
  return { guests, skipped };
}
