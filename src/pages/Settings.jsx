import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { api, invitationUrl } from "../lib/api.js";
import Icon from "../components/Icon.jsx";

export default function Settings({ settings, setSettings, guests }) {
  const [form, setForm] = useState(structuredClone(settings));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const unsavedUploads = useRef(new Set());

  useEffect(() => () => {
    for (const url of unsavedUploads.current) api("/uploads", { method: "DELETE", body: JSON.stringify({ url }) }).catch(() => {});
  }, []);

  function updateCouple(key, value) {
    setForm((current) => ({ ...current, couple: { ...current.couple, [key]: value } }));
  }

  function updateEvent(index, key, value) {
    setForm((current) => ({ ...current, events: current.events.map((event, eventIndex) => eventIndex === index ? { ...event, [key]: value } : event) }));
  }

  async function uploadFile(file, target) {
    if (!file) return;
    const isAudio = file.type.startsWith("audio/");
    const maxSize = isAudio ? 15 : 8;
    if (file.size > maxSize * 1024 * 1024) return setError(`Ukuran ${isAudio ? "audio" : "foto"} maksimal ${maxSize} MB.`);
    setUploading(target);
    setError("");
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/uploads" });
      unsavedUploads.current.add(blob.url);
      setForm((current) => {
        if (target === "heroPhoto" || target === "interludePhoto" || target === "backsound") return { ...current, [target]: blob.url };
        if (target.startsWith("profile")) {
          const index = Number(target.slice(-1));
          const profilePhotos = [...current.profilePhotos];
          profilePhotos[index] = blob.url;
          return { ...current, profilePhotos };
        }
        return { ...current, gallery: [...current.gallery, blob.url].slice(0, 12) };
      });
    } catch (uploadError) {
      setError(uploadError.message || "Upload gagal. Coba kembali.");
    } finally {
      setUploading("");
    }
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const saved = await api("/settings", { method: "PATCH", body: JSON.stringify(form) });
      const savedUrls = mediaUrls(saved);
      const staleUrls = new Set([...mediaUrls(settings), ...unsavedUploads.current].filter((url) => !savedUrls.has(url)));
      await Promise.allSettled([...staleUrls].map((url) => api("/uploads", { method: "DELETE", body: JSON.stringify({ url }) })));
      unsavedUploads.current.clear();
      setSettings(saved);
      setForm(structuredClone(saved));
      setMessage("Perubahan undangan sudah disimpan.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  const coupleNames = [form.couple.partnerOne, form.couple.partnerTwo].filter(Boolean).join(" & ") || "Nama pasangan";
  const sampleGuest = guests[0];

  return <div className="page settings-page">
    <header className="page-header"><div><h1>Isi undangan</h1><p>Semua yang disimpan di sini langsung menjadi versi yang dibaca tamu.</p></div>{sampleGuest && <a className="button button-secondary" href={invitationUrl(sampleGuest.slug)} target="_blank" rel="noreferrer">Buka preview<Icon name="arrow" size={17}/></a>}</header>
    {message && <div className="toast" role="status">{message}<button onClick={() => setMessage("")} aria-label="Tutup"><Icon name="close" size={16}/></button></div>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="settings-layout">
      <form className="settings-form" onSubmit={save}>
        <SettingsSection title="Pasangan" description="Nama pendek menjadi pusat undangan. Nama lengkap muncul pada perkenalan.">
          <div className="form-grid"><label>Nama pendek pertama<input required value={form.couple.partnerOne} onChange={(event) => updateCouple("partnerOne", event.target.value)} placeholder="Nama panggilan" /></label><label>Nama pendek kedua<input required value={form.couple.partnerTwo} onChange={(event) => updateCouple("partnerTwo", event.target.value)} placeholder="Nama panggilan" /></label><label>Nama lengkap pertama<input value={form.couple.fullNameOne} onChange={(event) => updateCouple("fullNameOne", event.target.value)} placeholder="Nama lengkap" /></label><label>Nama lengkap kedua<input value={form.couple.fullNameTwo} onChange={(event) => updateCouple("fullNameTwo", event.target.value)} placeholder="Nama lengkap" /></label></div>
          <label>Kalimat pembuka<textarea rows="3" value={form.couple.openingText} onChange={(event) => updateCouple("openingText", event.target.value)} placeholder="Tuliskan sapaan singkat dari kalian." /></label>
        </SettingsSection>

        {form.events.map((event, index) => <SettingsSection key={index} title={`Acara ${index + 1}`} description="Tanggal dan lokasi ditampilkan sebagai satu alur, bukan kartu yang terpisah.">
          <div className="form-grid"><label>Nama acara<input required value={event.label} onChange={(e) => updateEvent(index, "label", e.target.value)} /></label><label>Tanggal<input type="date" required value={event.date} onChange={(e) => updateEvent(index, "date", e.target.value)} /></label><label>Mulai<input type="time" required value={event.startTime} onChange={(e) => updateEvent(index, "startTime", e.target.value)} /></label><label>Selesai<input type="time" value={event.endTime} onChange={(e) => updateEvent(index, "endTime", e.target.value)} /></label><label>Nama lokasi<input required value={event.venue} onChange={(e) => updateEvent(index, "venue", e.target.value)} /></label><label>Zona waktu<select value={event.timezone} onChange={(e) => updateEvent(index, "timezone", e.target.value)}><option>Asia/Jakarta</option><option>Asia/Makassar</option><option>Asia/Jayapura</option></select></label></div>
          <label>Alamat<textarea rows="2" value={event.address} onChange={(e) => updateEvent(index, "address", e.target.value)} /></label><label>Link Google Maps<input type="url" value={event.mapsUrl} onChange={(e) => updateEvent(index, "mapsUrl", e.target.value)} placeholder="https://maps.google.com/..." /></label>
        </SettingsSection>)}

        <SettingsSection title="Foto dan suara" description="Gunakan foto asli beresolusi baik. Hero portrait akan memberi hasil paling kuat.">
          <div className="media-grid"><MediaUpload label="Foto utama" value={form.heroPhoto} loading={uploading === "heroPhoto"} accept="image/jpeg,image/png,image/webp" onFile={(file) => uploadFile(file, "heroPhoto")} onRemove={() => setForm({ ...form, heroPhoto: "" })}/><MediaUpload label="Foto mempelai pertama" value={form.profilePhotos[0]} loading={uploading === "profile0"} accept="image/jpeg,image/png,image/webp" onFile={(file) => uploadFile(file, "profile0")} onRemove={() => setForm({ ...form, profilePhotos: ["", form.profilePhotos[1]] })}/><MediaUpload label="Foto mempelai kedua" value={form.profilePhotos[1]} loading={uploading === "profile1"} accept="image/jpeg,image/png,image/webp" onFile={(file) => uploadFile(file, "profile1")} onRemove={() => setForm({ ...form, profilePhotos: [form.profilePhotos[0], ""] })}/><MediaUpload label="Foto jeda editorial" value={form.interludePhoto} loading={uploading === "interludePhoto"} accept="image/jpeg,image/png,image/webp" onFile={(file) => uploadFile(file, "interludePhoto")} onRemove={() => setForm({ ...form, interludePhoto: "" })}/></div>
          <div className="gallery-editor"><div className="subheading"><div><h3>Galeri</h3><p>Maksimal 12 foto.</p></div><UploadButton label={uploading === "gallery" ? "Mengunggah..." : "Tambah foto"} accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading) || form.gallery.length >= 12} onFile={(file) => uploadFile(file, "gallery")}/></div>{form.gallery.length > 0 && <div className="gallery-thumbs">{form.gallery.map((url, index) => <div key={url}><img src={url} alt={`Galeri ${index + 1}`} /><button type="button" onClick={() => setForm({ ...form, gallery: form.gallery.filter((item) => item !== url) })} aria-label={`Hapus foto ${index + 1}`}><Icon name="close" size={15}/></button></div>)}</div>}</div>
          <div className="audio-upload"><div><Icon name="music"/><div><h3>Backsound</h3><p>MP3 atau M4A, maksimum 15 MB.</p></div></div>{form.backsound ? <div className="audio-current"><audio controls src={form.backsound}/><button type="button" className="text-button danger" onClick={() => setForm({ ...form, backsound: "" })}>Hapus</button></div> : <UploadButton label={uploading === "backsound" ? "Mengunggah..." : "Pilih audio"} accept="audio/mpeg,audio/mp4,audio/x-m4a" disabled={Boolean(uploading)} onFile={(file) => uploadFile(file, "backsound")}/>}</div>
        </SettingsSection>

        <SettingsSection title="Amplop digital" description="Tamu dapat menyalin nomor dengan satu sentuhan.">
          {form.giftAccounts.map((account, index) => <div className="account-row" key={index}><label>Bank / e-wallet<input value={account.provider} onChange={(e) => setForm({ ...form, giftAccounts: form.giftAccounts.map((item, i) => i === index ? { ...item, provider: e.target.value } : item) })}/></label><label>Nomor<input value={account.number} onChange={(e) => setForm({ ...form, giftAccounts: form.giftAccounts.map((item, i) => i === index ? { ...item, number: e.target.value } : item) })}/></label><label>Atas nama<input value={account.owner} onChange={(e) => setForm({ ...form, giftAccounts: form.giftAccounts.map((item, i) => i === index ? { ...item, owner: e.target.value } : item) })}/></label><button type="button" className="icon-button danger" onClick={() => setForm({ ...form, giftAccounts: form.giftAccounts.filter((_, i) => i !== index) })} aria-label="Hapus rekening"><Icon name="trash"/></button></div>)}
          {form.giftAccounts.length < 4 && <button type="button" className="text-link" onClick={() => setForm({ ...form, giftAccounts: [...form.giftAccounts, { provider: "", number: "", owner: "" }] })}><Icon name="plus" size={17}/>Tambah rekening</button>}
        </SettingsSection>

        <SettingsSection title="Pesan WhatsApp" description="Variabel yang tersedia: {{guest_name}}, {{couple_names}}, {{event_date}}, dan {{invite_url}}."><label>Template pesan<textarea className="template-input" rows="8" value={form.whatsappTemplate} onChange={(event) => setForm({ ...form, whatsappTemplate: event.target.value })} /></label></SettingsSection>
        <SettingsSection title="Penutup" description="Satu ucapan tulus lebih kuat daripada paragraf yang panjang."><label>Kalimat penutup<textarea rows="4" value={form.couple.closingText} onChange={(event) => updateCouple("closingText", event.target.value)} placeholder="Terima kasih telah menjadi bagian dari hari kami." /></label></SettingsSection>
        <div className="sticky-save"><span>{saving ? "Menyimpan perubahan..." : "Perubahan aktif setelah disimpan."}</span><button className="button button-primary" disabled={saving || Boolean(uploading)}>{saving ? "Menyimpan..." : "Simpan undangan"}</button></div>
      </form>
      <aside className="phone-preview" aria-label="Preview undangan"><div className="preview-speaker"/><div className="preview-screen" style={form.heroPhoto ? { backgroundImage: `linear-gradient(180deg, rgba(16,28,26,.08), rgba(16,28,26,.72)), url(${form.heroPhoto})` } : {}}><div className="preview-rings"><span/><span/><span/></div><small>Undangan pernikahan</small><h2>{coupleNames}</h2><p>{form.events[0]?.date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(`${form.events[0].date}T12:00:00`)) : "Tanggal pernikahan"}</p><button type="button">Buka undangan</button></div></aside>
    </div>
  </div>;
}

function mediaUrls(value) {
  return new Set([value?.heroPhoto, value?.interludePhoto, value?.backsound, ...(value?.profilePhotos ?? []), ...(value?.gallery ?? [])].filter(Boolean));
}

function SettingsSection({ title, description, children }) {
  return <section className="settings-section"><header><h2>{title}</h2><p>{description}</p></header><div className="settings-fields">{children}</div></section>;
}

function UploadButton({ label, accept, disabled, onFile }) {
  return <label className={`button button-secondary upload-button ${disabled ? "disabled" : ""}`}><Icon name="upload" size={17}/>{label}<input type="file" accept={accept} disabled={disabled} onChange={(event) => onFile(event.target.files[0])}/></label>;
}

function MediaUpload({ label, value, loading, accept, onFile, onRemove }) {
  return <div className="media-upload"><div className="media-preview">{value ? <img src={value} alt=""/> : <Icon name="upload"/>}</div><strong>{label}</strong>{value ? <button type="button" className="text-button danger" onClick={onRemove}>Hapus</button> : <UploadButton label={loading ? "Mengunggah..." : "Pilih foto"} accept={accept} disabled={loading} onFile={onFile}/>}</div>;
}
