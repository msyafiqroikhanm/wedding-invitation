import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, invitationUrl } from "../lib/api.js";
import Icon from "../components/Icon.jsx";
import { Empty } from "./Admin.jsx";

const emptyForm = { name: "", phone: "", connection: "" };
const renderTemplate = (template, values) => String(template ?? "").replace(/{{\s*(guest_name|couple_names|event_date|invite_url)\s*}}/g, (_, key) => values[key] ?? "");

export default function Guests({ guests, setGuests, settings }) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(params.get("status") || "all");
  const [connection, setConnection] = useState("all");
  const [editing, setEditing] = useState(params.get("add") ? emptyForm : null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (params.get("add")) {
      setEditing(emptyForm);
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const connections = useMemo(() => [...new Set(guests.map((guest) => guest.connection).filter(Boolean))].sort((a, b) => a.localeCompare(b, "id")), [guests]);

  useEffect(() => {
    if (connection !== "all" && !connections.includes(connection)) setConnection("all");
  }, [connection, connections]);

  const filtered = useMemo(() => guests.filter((guest) => {
    const matchesQuery = `${guest.name} ${guest.phone}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || (status === "sent" ? guest.sentAt : !guest.sentAt);
    return matchesQuery && matchesStatus && (connection === "all" || guest.connection === connection);
  }), [guests, query, status, connection]);

  function replaceGuest(updated) {
    setGuests((current) => current.map((guest) => guest._id === updated._id ? updated : guest));
  }

  async function send(guest) {
    const url = invitationUrl(guest.slug);
    const coupleNames = [settings?.couple?.partnerOne, settings?.couple?.partnerTwo].filter(Boolean).join(" & ");
    const message = renderTemplate(settings?.whatsappTemplate, {
      guest_name: guest.name,
      couple_names: coupleNames,
      event_date: settings?.events?.[0]?.date || "",
      invite_url: url,
    });
    window.open(`https://wa.me/${guest.phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    try {
      replaceGuest(await api(`/guests/${guest._id}/mark-sent`, { method: "POST" }));
      setNotice(`Status ${guest.name} ditandai sudah dikirim.`);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function copyLink(guest) {
    await navigator.clipboard.writeText(invitationUrl(guest.slug));
    setNotice(`Link ${guest.name} berhasil disalin.`);
  }

  async function reset(guest) {
    try {
      replaceGuest(await api(`/guests/${guest._id}/reset-sent`, { method: "POST" }));
      setNotice(`Status ${guest.name} dikembalikan ke belum dikirim.`);
    } catch (requestError) { setError(requestError.message); }
  }

  async function regenerate(guest) {
    if (!window.confirm(`Buat link baru untuk ${guest.name}? Link lama akan langsung tidak berlaku.`)) return;
    try {
      replaceGuest(await api(`/guests/${guest._id}/regenerate-slug`, { method: "POST" }));
      setNotice("Link baru berhasil dibuat.");
    } catch (requestError) { setError(requestError.message); }
  }

  async function remove(guest) {
    if (!window.confirm(`Hapus ${guest.name} dari daftar tamu? Link undangannya akan tidak berlaku.`)) return;
    try {
      await api(`/guests/${guest._id}`, { method: "DELETE" });
      setGuests((current) => current.filter((item) => item._id !== guest._id));
    } catch (requestError) { setError(requestError.message); }
  }

  return <div className="page guests-page">
    <header className="page-header"><div><h1>Daftar tamu</h1><p>{guests.length} nama tersimpan. Setiap tamu memiliki link yang berbeda.</p></div><button className="button button-primary" onClick={() => setEditing(emptyForm)}><Icon name="plus"/>Tambah tamu</button></header>
    {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Tutup"><Icon name="close" size={16}/></button></div>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="list-toolbar">
      <label className="search-field"><Icon name="search"/><span className="sr-only">Cari tamu</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau nomor" /></label>
      <div className="toolbar-filters">
        <label className="connection-filter"><span className="sr-only">Filter berdasarkan koneksi</span><select value={connection} onChange={(event) => setConnection(event.target.value)}><option value="all">Semua koneksi</option>{connections.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <div className="segmented" aria-label="Filter status">{[["all", "Semua"], ["unsent", "Belum"], ["sent", "Terkirim"]].map(([value, label]) => <button key={value} className={status === value ? "active" : ""} onClick={() => setStatus(value)}>{label}</button>)}</div>
      </div>
    </div>
    {filtered.length ? <div className="guest-table" role="table">
      <div className="guest-table-head" role="row"><span>Tamu</span><span>WhatsApp</span><span>Koneksi</span><span>Status</span><span className="sr-only">Aksi</span></div>
      {filtered.map((guest) => <div className="guest-row" role="row" key={guest._id}>
        <div className="guest-name"><span className="avatar-letter">{guest.name.charAt(0)}</span><div><strong>{guest.name}</strong><small>/{guest.slug}</small></div></div>
        <span className="guest-phone">+{guest.phone}</span><span>{guest.connection}</span>
        <span className={`status ${guest.sentAt ? "status-sent" : "status-unsent"}`}>{guest.sentAt ? "Sudah dikirim" : "Belum dikirim"}</span>
        <div className="row-actions"><button className="button button-send" onClick={() => send(guest)}><Icon name="send" size={17}/>{guest.sentAt ? "Kirim lagi" : "Kirim WA"}</button><button className="icon-button" onClick={() => copyLink(guest)} aria-label={`Salin link ${guest.name}`}><Icon name="copy" size={18}/></button><details><summary className="icon-button" aria-label="Aksi lainnya"><Icon name="more"/></summary><div className="action-menu"><button onClick={() => setEditing(guest)}><Icon name="edit"/>Edit</button><button onClick={() => regenerate(guest)}><Icon name="link"/>Buat link baru</button>{guest.sentAt && <button onClick={() => reset(guest)}><Icon name="close"/>Tandai belum</button>}<button className="danger" onClick={() => remove(guest)}><Icon name="trash"/>Hapus</button></div></details></div>
      </div>)}
    </div> : <Empty title="Tidak ada tamu ditemukan" text={query || status !== "all" || connection !== "all" ? "Ubah pencarian atau filter untuk melihat tamu lain." : "Tambahkan nama pertama untuk membuat link personal."} />}
    {editing && <GuestForm guest={editing} onClose={() => setEditing(null)} onSaved={(saved) => { setGuests((current) => editing._id ? current.map((guest) => guest._id === saved._id ? saved : guest) : [saved, ...current]); setEditing(null); setNotice(`${saved.name} berhasil disimpan.`); }} />}
  </div>;
}

function GuestForm({ guest, onClose, onSaved }) {
  const [form, setForm] = useState({ name: guest.name || "", phone: guest.phone || "", connection: guest.connection || "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      onSaved(await api(guest._id ? `/guests/${guest._id}` : "/guests", { method: guest._id ? "PATCH" : "POST", body: JSON.stringify(form) }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="sheet-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="form-sheet" aria-label={guest._id ? "Edit tamu" : "Tambah tamu"}><header><div><h2>{guest._id ? "Edit tamu" : "Tamu baru"}</h2><p>Link personal dibuat otomatis setelah disimpan.</p></div><button className="icon-button" onClick={onClose} aria-label="Tutup"><Icon name="close"/></button></header><form onSubmit={submit}>
    <label>Nama tamu<input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Budi dan Keluarga" /></label>
    <label>Nomor WhatsApp<input inputMode="tel" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="0812 3456 7890" /><small>Format 08, +62, dan 62 dapat digunakan.</small></label>
    <label>Koneksi<select required value={form.connection} onChange={(event) => setForm({ ...form, connection: event.target.value })}><option value="">Pilih koneksi</option><option>Keluarga</option><option>Teman Sekolah</option><option>Teman Kuliah</option><option>Teman Kantor</option><option>Tetangga</option><option>Lainnya</option></select></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions"><button type="button" className="button button-secondary" onClick={onClose}>Batal</button><button className="button button-primary" disabled={loading}>{loading ? "Menyimpan..." : "Simpan tamu"}</button></div>
  </form></aside></div>;
}
