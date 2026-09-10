import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import Icon from "../components/Icon.jsx";
import "@fontsource-variable/bodoni-moda";

export default function Invite() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    api(`/public/invitations/${encodeURIComponent(slug)}`)
      .then((response) => active && setData(response))
      .catch((requestError) => active && setError({ message: requestError.message, status: requestError.status }));
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    document.documentElement.style.background = "#dbe3e4";
    document.body.style.background = "#dbe3e4";
    return () => {
      document.documentElement.style.background = "";
      document.body.style.background = "";
    };
  }, []);

  useEffect(() => {
    if (opened) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [opened]);

  useEffect(() => {
    if (opened) rootRef.current?.querySelector(".hero-title h2")?.focus({ preventScroll: true });
  }, [opened]);

  // Reveal on scroll + parallax. Initial hidden state is set from JS so the content
  // stays visible if this never runs, and a scroll sweep backs up the observer so a
  // fast flick can never leave a section stuck invisible.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && reveal(entry.target)),
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );

    function reveal(element) {
      element.dataset.revealed = "1";
      element.style.transitionDelay = `${element.dataset.delay || 0}ms`;
      element.style.opacity = "1";
      element.style.transform = "none";
      observer.unobserve(element);
    }

    function prepare() {
      root.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((element) => {
        if (reduce) return void (element.dataset.revealed = "1");
        if (!element.dataset.revealReady) {
          element.dataset.revealReady = "1";
          element.style.opacity = "0";
          element.style.transform = "translateY(20px)";
          element.style.transition = "opacity .9s cubic-bezier(.22,1,.36,1), transform 1s cubic-bezier(.22,1,.36,1)";
        }
        observer.observe(element);
      });
      sweep();
    }

    function sweep() {
      root.querySelectorAll("[data-reveal][data-reveal-ready]:not([data-revealed])").forEach((element) => {
        if (element.getBoundingClientRect().bottom < window.innerHeight * 0.95) reveal(element);
      });
    }

    function onScroll() {
      sweep();
      const photo = root.querySelector(".photo-interlude img");
      if (!photo || reduce) return;
      const box = photo.parentElement.getBoundingClientRect();
      if (box.bottom <= 0 || box.top >= window.innerHeight) return;
      const progress = (window.innerHeight - box.top) / (window.innerHeight + box.height);
      photo.style.transform = `translateY(${(-(progress - 0.5) * 8).toFixed(2)}%)`;
    }

    prepare();
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [data]);

  async function openInvitation() {
    setOpened(true);
    window.scrollTo({ top: 0 });
    if (audioRef.current) {
      try { await audioRef.current.play(); setPlaying(true); } catch { setPlaying(false); }
    }
  }

  async function toggleMusic() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) { try { await audioRef.current.play(); setPlaying(true); } catch { setPlaying(false); } }
    else { audioRef.current.pause(); setPlaying(false); }
  }

  if (error) return error.status === 404 ? <InvitationNotFound /> : <InvitationUnavailable message={error.message} />;
  if (!data) return <div className="invitation-loading"><span className="water-loader"/><p>Mencari namamu di daftar tamu...</p></div>;

  const { guest, settings, wishes } = data;
  const couple = settings.couple;
  const coupleNames = [couple.partnerOne, couple.partnerTwo].filter(Boolean).join(" & ");
  if (!coupleNames) return <InvitationNotReady guest={guest} />;

  return <main ref={rootRef} className={`invitation ${opened ? "invitation-open" : "invitation-closed"}`}>
    {settings.backsound && <audio ref={audioRef} src={settings.backsound} loop preload="none" />}
    <Cover guest={guest} settings={settings} couple={couple} onOpen={openInvitation} opened={opened} />
    <div className="invitation-content" aria-hidden={!opened} inert={!opened}>
      {settings.backsound && <button className="music-control" onClick={toggleMusic} aria-label={playing ? "Jeda musik" : "Putar musik"}><i className={playing ? "playing" : ""} aria-hidden="true"><b/><b/><b/></i></button>}
      <Hero couple={couple} date={settings.events?.[0]?.date} />
      <Couple settings={settings} />
      {settings.events?.[0]?.date && <Countdown event={settings.events[0]} />}
      <Events events={settings.events ?? []} />
      {settings.interludePhoto && <PhotoInterlude photo={settings.interludePhoto} coupleNames={coupleNames} />}
      {settings.gallery?.length > 0 && <Gallery photos={settings.gallery} />}
      {settings.giftAccounts?.length > 0 && <Gifts accounts={settings.giftAccounts} />}
      <Wishes slug={guest.slug} guestName={guest.name} wishes={wishes} />
      <footer className="invitation-close"><RippleMark/><p data-reveal="">{couple.closingText || "Terima kasih telah menjadi bagian dari hari yang berarti bagi kami."}</p><h2 data-reveal="" data-delay="110"><CoupleTitle couple={couple} /></h2></footer>
    </div>
    <nav className="invite-nav" aria-label="Bagian undangan" aria-hidden={!opened} inert={!opened}>
      <a href="#mempelai"><Icon name="guests" size={18}/>Mempelai</a>
      {settings.events?.some((event) => event.date || event.venue) && <a href="#acara"><Icon name="calendar" size={18}/>Acara</a>}
      {settings.gallery?.length > 0 && <a href="#galeri"><Icon name="spark" size={18}/>Galeri</a>}
      <a href="#ucapan"><Icon name="wishes" size={18}/>Ucapan</a>
    </nav>
  </main>;
}

function Cover({ guest, settings, couple, onOpen, opened }) {
  const date = settings.events?.[0]?.date;
  return <section className="invitation-cover" aria-hidden={opened} inert={opened}>
    <div className="cover-copy">
      <div className="cover-names">
        <h1><CoupleTitle couple={couple} /></h1>
        <p>Undangan pernikahan{date && <> · <time dateTime={date}>{formatDotted(date)}</time></>}</p>
      </div>
      <figure className="cover-photo">
        {settings.heroPhoto ? <img src={settings.heroPhoto} alt={`${couple.partnerOne} dan ${couple.partnerTwo}`} fetchPriority="high"/> : <span className="cover-monogram" aria-hidden="true">{couple.partnerOne?.charAt(0)}<em>&</em>{couple.partnerTwo?.charAt(0)}</span>}
        <figcaption>Sebuah awal, untuk selamanya.</figcaption>
      </figure>
      <div className="guest-address">
        <small>Kepada Yth.</small>
        <strong>{guest.name}</strong>
        <button className="open-invitation" onClick={onOpen}>Buka undangan<span aria-hidden="true"><Icon name="arrow" size={18}/></span></button>
      </div>
    </div>
  </section>;
}

function Hero({ couple, date }) {
  return <section className="invite-hero" id="pembuka">
    <div className="hero-title" data-reveal=""><RippleMark/><h2 tabIndex="-1"><CoupleTitle couple={couple} /></h2>{date && <time dateTime={date}>{formatPart(date, { day: "numeric", month: "long", year: "numeric" })}</time>}</div>
    <div className="hero-letter" data-reveal=""><p>{couple.openingText || "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir dan menjadi bagian dari hari pernikahan kami."}</p><a href="#mempelai">Mengenal mempelai <Icon name="arrow" size={16}/></a></div>
  </section>;
}

function Couple({ settings }) {
  const people = [
    { name: settings.couple.fullNameOne || settings.couple.partnerOne, short: settings.couple.partnerOne, parents: settings.couple.parentsOne, photo: settings.profilePhotos?.[0] },
    { name: settings.couple.fullNameTwo || settings.couple.partnerTwo, short: settings.couple.partnerTwo, parents: settings.couple.parentsTwo, photo: settings.profilePhotos?.[1] },
  ];
  return <section className="couple-section" id="mempelai">
    <div className="couple-intro" data-reveal="">
      <h2>Dua cerita,<br />satu perjalanan.</h2>
      <p>Kehadiran dan doa baik Anda menjadi bagian yang kami simpan dari hari ini.</p>
    </div>
    <div className="couple-portraits">{people.map((person, index) => <article key={index} data-reveal="">
      <div className="portrait-frame">{person.photo ? <img src={person.photo} alt={`Potret ${person.name}`} loading="lazy"/> : <span>{person.short?.charAt(0)}</span>}</div>
      <div className="portrait-meta">
        <div className="portrait-caption"><h3>{person.short}</h3>{person.name !== person.short && <p>{person.name}</p>}</div>
        {person.parents && <p className="portrait-parents">{person.parents}</p>}
      </div>
    </article>)}</div>
  </section>;
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
  return <section className="events-section" id="acara">
    <header data-reveal="">
      <h2>Tempat kita bertemu</h2>
      <p>Kami menantikan kehadiran Anda untuk merayakan hari bahagia ini.</p>
    </header>
    <div className="event-flow">{visible.map((event, index) => <article key={index} data-reveal="">
      <div className="event-date">
        <span>{event.date ? formatPart(event.date, { day: "2-digit" }) : "--"}</span>
        <div>
          <strong>{event.date ? formatPart(event.date, { month: "long", year: "numeric" }) : "Tanggal menyusul"}</strong>
          {event.date && <small>{formatPart(event.date, { weekday: "long" })}</small>}
        </div>
      </div>
      <h3>{event.label}</h3>
      <p className="event-time">{event.startTime || "--:--"}{event.endTime ? ` – ${event.endTime}` : ""}</p>
      <div className="event-place"><strong>{event.venue}</strong><p>{event.address}</p></div>
      {event.note && <small>{event.note}</small>}
      {event.mapsUrl && <a href={event.mapsUrl} target="_blank" rel="noreferrer"><Icon name="map" size={18}/>Buka Google Maps<Icon name="arrow" size={16}/></a>}
    </article>)}</div>
  </section>;
}

function PhotoInterlude({ photo, coupleNames }) {
  return <figure className="photo-interlude">
    <img src={photo} alt={`${coupleNames} berjalan bersama di alam terbuka`} loading="lazy"/>
    <figcaption data-reveal=""><span>Berjalan ke arah yang sama,</span><strong>bersama.</strong></figcaption>
  </figure>;
}

function Gallery({ photos }) {
  return <section className="invite-gallery" id="galeri">
    <header data-reveal="">
      <h2>Potongan yang ingin kami simpan.</h2>
      <p>Beberapa saat yang membawa kami sampai ke sini.</p>
    </header>
    <div className="gallery-strip" data-reveal="" tabIndex="0" role="region" aria-label="Galeri foto, geser atau gunakan tombol panah">{photos.map((photo, index) => <figure key={`${photo}-${index}`} className="gallery-photo"><img src={photo} alt={`Momen pasangan ${index + 1}`} loading="lazy" /><figcaption>{String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</figcaption></figure>)}</div>
    {photos.length > 1 && <p className="gallery-hint">Geser untuk melihat <Icon name="arrow" size={14}/></p>}
  </section>;
}

function Gifts({ accounts }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const [copyError, setCopyError] = useState("");

  async function copy(account) {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(account.number);
      setCopied(account.number);
      window.setTimeout(() => setCopied(""), 1800);
    } catch { setCopyError("Nomor belum tersalin. Tekan dan tahan nomor rekening untuk menyalinnya."); }
  }

  return <section className="gift-section" id="hadiah">
    <RippleMark/>
    <h2 data-reveal="">Tanda kasih</h2>
    <p data-reveal="" data-delay="80">Doa dan kehadiran Anda sudah lebih dari cukup. Bila ingin mengirim tanda kasih, detailnya di bawah.</p>
    <button className="gift-reveal" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Tutup detail" : "Lihat amplop digital"}</button>
    <div className={`gift-panel ${open ? "gift-panel-open" : ""}`} inert={!open} aria-hidden={!open}><div className="gift-panel-inner">
      <div className="account-list">{accounts.map((account) => <article key={`${account.provider}-${account.number}`}>
        <span>{account.provider}{account.owner ? ` · a.n. ${account.owner}` : ""}</span>
        <strong>{account.number}</strong>
        <button onClick={() => copy(account)}><Icon name={copied === account.number ? "check" : "copy"} size={16}/>{copied === account.number ? "Tersalin" : "Salin nomor"}</button>
      </article>)}</div>
    </div></div>
    <p className="copy-status" role="status">{copyError}</p>
  </section>;
}

function Wishes({ slug, guestName, wishes }) {
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (message.trim().length < 3) { setStatus("Tuliskan ucapan minimal 3 karakter."); return; }
    setLoading(true);
    setStatus("");
    try {
      await api(`/public/invitations/${slug}/wish`, { method: "PUT", body: JSON.stringify({ message, website }) });
      setMessage("");
      setStatus("Ucapanmu sudah diterima dan menunggu persetujuan.");
    } catch (requestError) { setStatus(requestError.message); }
    finally { setLoading(false); }
  }
  return <section className="invite-wishes" id="ucapan">
    <header data-reveal="">
      <h2>Tinggalkan kata yang akan kami ingat.</h2>
      <p>Ucapan dari {guestName} akan muncul setelah kami membacanya.</p>
    </header>
    <form onSubmit={submit}>
      <label>Ucapan<textarea maxLength="500" rows="4" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tuliskan doa dan ucapanmu di sini..." /></label>
      <label className="honeypot" aria-hidden="true">Website<input tabIndex="-1" autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
      <div><small>{message.length}/500</small><button disabled={loading}>{loading ? "Mengirim..." : "Kirim ucapan"}<Icon name="send" size={16}/></button></div>
      <p role="status">{status}</p>
    </form>
    {wishes.length > 0 && <div className="public-wishes">{wishes.map((wish, index) => <blockquote key={wish._id} data-reveal="" data-delay={index % 2 ? 110 : 0}><p>“{wish.message}”</p><cite>{wish.guestName}</cite></blockquote>)}</div>}
  </section>;
}

function CoupleTitle({ couple, separator = "&" }) {
  const { partnerOne, partnerTwo } = couple;
  if (!partnerOne || !partnerTwo) return partnerOne || partnerTwo;
  return <><span>{partnerOne}</span><em>{separator}</em><span>{partnerTwo}</span></>;
}

function RippleMark() {
  return <span className="ripple-mark" data-reveal="" aria-hidden="true"><i/><i/><i/></span>;
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

function formatPart(date, options) {
  return new Intl.DateTimeFormat("id-ID", options).format(new Date(`${date}T12:00:00`));
}

function formatDotted(date) {
  const [year, month, day] = date.split("-");
  return `${day} · ${month} · ${year}`;
}

function calculateRemaining(event) {
  const offsets = { "Asia/Jakarta": "+07:00", "Asia/Makassar": "+08:00", "Asia/Jayapura": "+09:00" };
  const target = new Date(`${event.date}T${event.startTime || "00:00"}:00${offsets[event.timezone] || "+07:00"}`).getTime();
  const difference = Math.max(0, target - Date.now());
  return { done: difference === 0, days: Math.floor(difference / 86400000), hours: Math.floor((difference / 3600000) % 24), minutes: Math.floor((difference / 60000) % 60), seconds: Math.floor((difference / 1000) % 60) };
}
