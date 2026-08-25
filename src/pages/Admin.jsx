import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import Icon from "../components/Icon.jsx";
import Guests from "./Guests.jsx";
import Settings from "./Settings.jsx";
import Wishes from "./Wishes.jsx";

const navigation = [
  ["", "overview", "Ringkasan"],
  ["guests", "guests", "Tamu"],
  ["invitation", "settings", "Undangan"],
  ["wishes", "wishes", "Ucapan"],
];

export default function Admin({ session, onLogout }) {
  const [guests, setGuests] = useState([]);
  const [settings, setSettings] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [guestData, settingsData, wishData] = await Promise.all([api("/guests"), api("/settings"), api("/wishes?status=pending")]);
      setGuests(guestData);
      setSettings(settingsData);
      setWishes(wishData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    onLogout();
    navigate("/login");
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand"><span className="brand-mark">S</span><div><strong>Stillwater</strong><small>Wedding workspace</small></div></div>
        <nav aria-label="Navigasi dashboard">
          {navigation.map(([path, icon, label]) => <NavLink key={label} to={`/admin/${path}`} end={!path}><Icon name={icon}/><span>{label}</span>{label === "Ucapan" && wishes.length > 0 && <b>{wishes.length}</b>}</NavLink>)}
        </nav>
        <div className="sidebar-account"><div><strong>{session.email}</strong><small>Administrator</small></div><button className="icon-button" onClick={logout} aria-label="Keluar"><Icon name="logout" /></button></div>
      </aside>

      <main className="admin-main">
        {error && <div className="page-error" role="alert"><p>{error}</p><button className="button button-secondary" onClick={load}>Coba lagi</button></div>}
        {loading ? <DashboardLoading /> : !error && <Routes>
          <Route index element={<Overview guests={guests} wishes={wishes} onAdd={() => navigate("/admin/guests?add=1")} />} />
          <Route path="guests" element={<Guests guests={guests} setGuests={setGuests} settings={settings} />} />
          <Route path="invitation" element={<Settings settings={settings} setSettings={setSettings} guests={guests} />} />
          <Route path="wishes" element={<Wishes pending={wishes} setPending={setWishes} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>}
      </main>

      <nav className="mobile-nav" aria-label="Navigasi dashboard mobile">
        {navigation.map(([path, icon, label]) => <NavLink key={label} to={`/admin/${path}`} end={!path}><Icon name={icon}/><span>{label}</span>{label === "Ucapan" && wishes.length > 0 && <b>{wishes.length}</b>}</NavLink>)}
      </nav>
    </div>
  );
}

function Overview({ guests, wishes, onAdd }) {
  const sent = guests.filter((guest) => guest.sentAt).length;
  const unsent = guests.length - sent;
  return <div className="page overview-page">
    <header className="page-header"><div><h1>Persiapanmu, sekilas.</h1><p>Fokus pada undangan yang belum terkirim dan ucapan yang menunggu.</p></div><button className="button button-primary" onClick={onAdd}><Icon name="plus"/>Tambah tamu</button></header>
    <section className="status-line" aria-label="Ringkasan tamu">
      <div><strong>{guests.length}</strong><span>Total tamu</span></div>
      <div><strong>{unsent}</strong><span>Belum dikirim</span></div>
      <div><strong>{sent}</strong><span>Sudah dikirim</span></div>
      <div><strong>{wishes.length}</strong><span>Ucapan menunggu</span></div>
    </section>
    <section className="next-work">
      <div className="next-work-copy"><h2>{unsent ? `${unsent} undangan menunggu dikirim` : "Semua tamu sudah terjangkau"}</h2><p>{unsent ? "Mulai dari nama teratas. Pesan dan link personal sudah disiapkan untukmu." : "Kamu bisa kembali memeriksa isi undangan atau ucapan terbaru."}</p><NavLink className="text-link" to={unsent ? "/admin/guests?status=unsent" : "/admin/invitation"}>{unsent ? "Lanjutkan pengiriman" : "Periksa undangan"}<Icon name="arrow" size={17}/></NavLink></div>
      <div className="ripple-meter" aria-hidden="true"><span/><span/><span/><b>{guests.length ? Math.round((sent / guests.length) * 100) : 0}%</b></div>
    </section>
    <section className="recent-section"><div className="section-heading"><h2>Belum dikirim</h2><NavLink to="/admin/guests?status=unsent">Lihat semua</NavLink></div>{unsent ? <div className="plain-list">{guests.filter((guest) => !guest.sentAt).slice(0, 5).map((guest) => <div key={guest._id}><span className="avatar-letter">{guest.name.charAt(0)}</span><div><strong>{guest.name}</strong><small>{guest.connection}</small></div><span className="status status-unsent">Belum dikirim</span></div>)}</div> : <Empty title="Tidak ada yang tertinggal" text="Semua undangan dalam daftar sudah dibuka melalui WhatsApp." />}</section>
  </div>;
}

function DashboardLoading() {
  return <div className="dashboard-loading"><span className="water-loader"/><p>Mengambil persiapan terbaru...</p></div>;
}

function Empty({ title, text }) {
  return <div className="empty-state"><span className="empty-ripple"/><h3>{title}</h3><p>{text}</p></div>;
}

export { Empty };
