import { useState } from "react";
import { api } from "../lib/api.js";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      onLogin(await api("/auth/login", { method: "POST", body: JSON.stringify(form) }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-art" aria-hidden="true">
        <div className="login-ripple login-ripple-one" />
        <div className="login-ripple login-ripple-two" />
        <p>Stillwater</p>
        <h1>Satu ruang tenang untuk hari yang paling berarti.</h1>
      </section>
      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <div>
            <span className="brand-mark">S</span>
            <h2>Selamat datang</h2>
            <p>Masuk untuk melanjutkan persiapan undanganmu.</p>
          </div>
          <label>Email<input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="nama@email.com" /></label>
          <label>Password<input type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Masukkan password" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary button-wide" disabled={loading}>{loading ? "Memeriksa..." : "Masuk ke dashboard"}</button>
        </form>
      </section>
    </main>
  );
}
