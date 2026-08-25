import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import Icon from "../components/Icon.jsx";
import { Empty } from "./Admin.jsx";

export default function Wishes({ pending, setPending }) {
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState(pending);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api(`/wishes?status=${status}`).then((data) => active && setItems(data)).catch((requestError) => active && setError(requestError.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [status]);

  async function moderate(wish, nextStatus) {
    try {
      await api(`/wishes/${wish._id}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      setItems((current) => current.filter((item) => item._id !== wish._id));
      if (status === "pending") setPending((current) => current.filter((item) => item._id !== wish._id));
    } catch (requestError) { setError(requestError.message); }
  }

  async function remove(wish) {
    if (!window.confirm(`Hapus ucapan dari ${wish.guestName}?`)) return;
    try {
      await api(`/wishes/${wish._id}`, { method: "DELETE" });
      setItems((current) => current.filter((item) => item._id !== wish._id));
      setPending((current) => current.filter((item) => item._id !== wish._id));
    } catch (requestError) { setError(requestError.message); }
  }

  return <div className="page wishes-page"><header className="page-header"><div><h1>Ucapan tamu</h1><p>Ucapan baru tidak akan muncul sebelum kamu menyetujuinya.</p></div></header>
    <div className="segmented wish-tabs">{[["pending", "Menunggu"], ["approved", "Disetujui"], ["rejected", "Ditolak"]].map(([value, label]) => <button key={value} className={status === value ? "active" : ""} onClick={() => setStatus(value)}>{label}{value === "pending" && pending.length > 0 && <b>{pending.length}</b>}</button>)}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading ? <p className="inline-loading">Mengambil ucapan...</p> : items.length ? <div className="wish-list">{items.map((wish) => <article key={wish._id}><header><span className="avatar-letter">{wish.guestName.charAt(0)}</span><div><h2>{wish.guestName}</h2><time>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(wish.createdAt))}</time></div></header><blockquote>{wish.message}</blockquote><footer>{status !== "approved" && <button className="button button-primary" onClick={() => moderate(wish, "approved")}><Icon name="check" size={17}/>Setujui</button>}{status !== "rejected" && <button className="button button-secondary" onClick={() => moderate(wish, "rejected")}><Icon name="close" size={17}/>Tolak</button>}<button className="icon-button danger" onClick={() => remove(wish)} aria-label="Hapus ucapan"><Icon name="trash"/></button></footer></article>)}</div> : <Empty title="Belum ada ucapan di sini" text={status === "pending" ? "Ucapan baru dari tamu akan menunggu persetujuanmu." : `Tidak ada ucapan berstatus ${status}.`} />}
  </div>;
}
