import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import Icon from "../components/Icon.jsx";

export default function Invite() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    api(`/public/invitations/${encodeURIComponent(slug)}`)
      .then((response) => active && setData(response))
      .catch((requestError) => active && setError({ message: requestError.message, status: requestError.status }));
    return () => { active = false; };
  }, [slug]);

  async function openInvitation() {
    setOpened(true);
    if (audioRef.current) {
      try { await audioRef.current.play(); setPlaying(true); } catch { setPlaying(false); }
    }
  }

  async function toggleMusic() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) { await audioRef.current.play(); setPlaying(true); }
    else { audioRef.current.pause(); setPlaying(false); }
  }

  if (error) return error.status === 404 ? <InvitationNotFound /> : <InvitationUnavailable message={error.message} />;
  if (!data) return <div className="invitation-loading"><span className="water-loader"/><p>Mencari namamu di daftar tamu...</p></div>;

  const { guest, settings, wishes } = data;
  const couple = settings.couple;
  const coupleNames = [couple.partnerOne, couple.partnerTwo].filter(Boolean).join(" & ");
  if (!coupleNames) return <InvitationNotReady guest={guest} />;

  return <main className={`invitation ${opened ? "invitation-open" : "invitation-closed"}`}>
    {settings.backsound && <audio ref={audioRef} src={settings.backsound} loop preload="none" />}
    {!opened && <Cover guest={guest} settings={settings} coupleNames={coupleNames} onOpen={openInvitation} />}
    <div className="invitation-content" aria-hidden={!opened}>
      {settings.backsound && <button className="music-control" onClick={toggleMusic} aria-label={playing ? "Jeda musik" : "Putar musik"}><Icon name="music" size={18}/><span>{playing ? "Musik menyala" : "Putar musik"}</span><i className={playing ? "playing" : ""}><b/><b/><b/></i></button>}
      <Hero settings={settings} coupleNames={coupleNames} />
      <Couple settings={settings} />
      {settings.events?.[0]?.date && <Countdown event={settings.events[0]} />}
      <Events events={settings.events ?? []} />
      {settings.interludePhoto && <PhotoInterlude photo={settings.interludePhoto} coupleNames={coupleNames} />}
      {settings.gallery?.length > 0 && <Gallery photos={settings.gallery} />}
      {settings.giftAccounts?.length > 0 && <Gifts accounts={settings.giftAccounts} />}
      <Wishes slug={guest.slug} guestName={guest.name} wishes={wishes} />
      <footer className="invitation-close"><RippleMark/><p>{couple.closingText || "Terima kasih telah menjadi bagian dari hari yang berarti bagi kami."}</p><h2>{coupleNames}</h2></footer>
    </div>
  </main>;
}

function Cover({ guest, settings, coupleNames, onOpen }) {
  const date = settings.events?.[0]?.date;
  return <section className="invitation-cover" style={settings.heroPhoto ? { "--cover-image": `url(${settings.heroPhoto})` } : {}}>
    <div className="cover-photo" />
    <div className="cover-pigment" aria-hidden="true"><span/><span/><span/><span/></div>
    <div className="cover-copy"><p>Undangan pernikahan</p><h1>{coupleNames}</h1>{date && <time>{formatDate(date)}</time>}<div className="guest-address"><small>Kepada Yth.</small><strong>{guest.name}</strong></div><button className="open-invitation" onClick={onOpen}>Buka undangan<span><Icon name="arrow" size={18}/></span></button></div>
  </section>;
}

function Hero({ settings, coupleNames }) {
  return <section className="invite-hero">
    <div className="hero-ripple" aria-hidden="true"><span/><span/><span/></div>
    <p>{settings.couple.openingText || "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir dan menjadi bagian dari hari pernikahan kami."}</p>
    <h1>{coupleNames}</h1>
    {settings.events?.[0]?.date && <time>{formatDate(settings.events[0].date)}</time>}
    <span className="hero-line"/>
  </section>;
}

function Couple({ settings }) {
  const people = [
    { name: settings.couple.fullNameOne || settings.couple.partnerOne, short: settings.couple.partnerOne, photo: settings.profilePhotos?.[0] },
    { name: settings.couple.fullNameTwo || settings.couple.partnerTwo, short: settings.couple.partnerTwo, photo: settings.profilePhotos?.[1] },
  ];
  return <section className="couple-section"><div className="couple-intro"><h2>Dua cerita, satu perjalanan.</h2><p>Kehadiran dan doa baik Anda menjadi bagian yang kami simpan dari hari ini.</p></div><div className="couple-portraits">{people.map((person, index) => <article key={index} className={index ? "portrait-lower" : ""}><div className="portrait-frame">{person.photo ? <img src={person.photo} alt={`Potret ${person.name}`} loading="lazy"/> : <span>{person.short?.charAt(0)}</span>}</div><div className="portrait-caption"><Icon name="spark" size={16}/><div><h3>{person.short}</h3>{person.name !== person.short && <p>{person.name}</p>}</div></div></article>)}</div></section>;
}

function Countdown({ event }) {
  const [remaining, setRemaining] = useState(() => calculateRemaining(event));
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(calculateRemaining(event)), 1000);
    return () => window.clearInterval(timer);
  }, [event]);
  if (remaining.done) return <section className="countdown-section"><p>Hari yang kami nantikan telah tiba.</p></section>;
  return <section className="countdown-section"><p>Menuju hari pernikahan</p><div>{[[remaining.days, "Hari"], [remaining.hours, "Jam"], [remaining.minutes, "Menit"], [remaining.seconds, "Detik"]].map(([value, label]) => <span key={label}><strong>{String(value).padStart(2, "0")}</strong><small>{label}</small></span>)}</div></section>;
}

function Events({ events }) {
  const visible = events.filter((event) => event.date || event.venue);
  if (!visible.length) return null;
  return <section className="events-section"><header><h2>Tempat kita bertemu</h2><p>Dua momen dalam satu hari yang ingin kami bagikan bersama Anda.</p></header><div className="event-flow">{visible.map((event, index) => <article key={index}><div className="event-date"><span>{event.date ? new Intl.DateTimeFormat("id-ID", { day: "2-digit" }).format(new Date(`${event.date}T12:00:00`)) : "--"}</span><div><strong>{event.date ? new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date(`${event.date}T12:00:00`)) : "Tanggal"}</strong><small>{event.date ? new Intl.DateTimeFormat("id-ID", { year: "numeric" }).format(new Date(`${event.date}T12:00:00`)) : ""}</small></div></div><div className="event-detail"><h3>{event.label}</h3><p className="event-time">{event.startTime || "--:--"}{event.endTime ? ` – ${event.endTime}` : ""}</p><strong>{event.venue}</strong><p>{event.address}</p>{event.note && <small>{event.note}</small>}{event.mapsUrl && <a href={event.mapsUrl} target="_blank" rel="noreferrer"><Icon name="map" size={18}/>Buka Google Maps</a>}</div></article>)}</div></section>;
}

function Gallery({ photos }) {
  return <section className="invite-gallery"><header><h2>Potongan yang ingin kami simpan.</h2><p>Bukan seluruh perjalanan, hanya beberapa saat yang membawa kami sampai ke sini.</p></header><div>{photos.map((photo, index) => <figure key={photo} className={`gallery-photo gallery-photo-${index % 4}`}><img src={photo} alt={`Momen pasangan ${index + 1}`} loading="lazy" /></figure>)}</div></section>;
}

function PhotoInterlude({ photo, coupleNames }) {
  return <figure className="photo-interlude"><img src={photo} alt={`${coupleNames} berjalan bersama di alam terbuka`} loading="lazy"/><figcaption><span>Berjalan ke arah yang sama,</span><strong>bersama.</strong></figcaption></figure>;
}

function Gifts({ accounts }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");
  async function copy(account) {
    await navigator.clipboard.writeText(account.number);
    setCopied(account.number);
    window.setTimeout(() => setCopied(""), 1800);
  }
  return <section className="gift-section"><RippleMark/><h2>Tanda kasih</h2><p>Doa dan kehadiran Anda sudah lebih dari cukup. Jika ingin mengirimkan tanda kasih, detailnya tersedia di bawah.</p><button className="gift-reveal" onClick={() => setOpen(!open)}>{open ? "Tutup detail" : "Lihat amplop digital"}<Icon name="arrow" size={18}/></button>{open && <div className="account-list">{accounts.map((account) => <article key={`${account.provider}-${account.number}`}><span>{account.provider}</span><strong>{account.number}</strong><small>a.n. {account.owner}</small><button onClick={() => copy(account)}><Icon name={copied === account.number ? "check" : "copy"} size={17}/>{copied === account.number ? "Tersalin" : "Salin nomor"}</button></article>)}</div>}</section>;
}

function Wishes({ slug, guestName, wishes }) {
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      await api(`/public/invitations/${slug}/wish`, { method: "PUT", body: JSON.stringify({ message, website }) });
      setMessage("");
      setStatus("Ucapanmu sudah diterima dan menunggu persetujuan.");
    } catch (requestError) { setStatus(requestError.message); }
    finally { setLoading(false); }
  }
  return <section className="invite-wishes"><header><h2>Tinggalkan kata yang akan kami ingat.</h2><p>Ucapan dari {guestName} akan muncul setelah kami membacanya.</p></header><form onSubmit={submit}><label>Ucapan<textarea required minLength="3" maxLength="500" rows="4" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tuliskan doa dan ucapanmu di sini..." /></label><label className="honeypot" aria-hidden="true">Website<input tabIndex="-1" autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label><div><small>{message.length}/500</small><button disabled={loading}>{loading ? "Mengirim..." : "Kirim ucapan"}<Icon name="send" size={17}/></button></div>{status && <p role="status">{status}</p>}</form>{wishes.length > 0 && <div className="public-wishes">{wishes.map((wish) => <blockquote key={wish._id}><p>“{wish.message}”</p><cite>{wish.guestName}</cite></blockquote>)}</div>}</section>;
}

function RippleMark() {
  return <span className="ripple-mark" aria-hidden="true"><i/><i/><i/></span>;
}

function InvitationNotFound() {
  return <main className="invitation-state"><RippleMark/><h1>Undangan tidak ditemukan</h1><p>Link ini tidak terdaftar atau sudah tidak berlaku. Periksa kembali link yang dikirimkan oleh pasangan.</p></main>;
}

function InvitationNotReady({ guest }) {
  return <main className="invitation-state"><RippleMark/><h1>Halo, {guest.name}</h1><p>Undangan ini sedang dipersiapkan. Silakan kembali lagi nanti.</p></main>;
}

function InvitationUnavailable({ message }) {
  return <main className="invitation-state"><RippleMark/><h1>Undangan belum dapat dimuat</h1><p>{message} Periksa koneksi Anda lalu muat ulang halaman ini.</p><button className="gift-reveal" onClick={() => window.location.reload()}>Muat ulang</button></main>;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function calculateRemaining(event) {
  const offsets = { "Asia/Jakarta": "+07:00", "Asia/Makassar": "+08:00", "Asia/Jayapura": "+09:00" };
  const target = new Date(`${event.date}T${event.startTime || "00:00"}:00${offsets[event.timezone] || "+07:00"}`).getTime();
  const difference = Math.max(0, target - Date.now());
  return { done: difference === 0, days: Math.floor(difference / 86400000), hours: Math.floor((difference / 3600000) % 24), minutes: Math.floor((difference / 60000) % 60), seconds: Math.floor((difference / 1000) % 60) };
}
