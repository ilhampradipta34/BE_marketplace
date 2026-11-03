"use client";

import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { ArrowRight, ChartNoAxesCombined, Leaf, LockKeyhole, Mail } from "lucide-react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Email atau kata sandi tidak cocok. Coba periksa kembali.");
      return;
    }

    window.location.assign("/dashboard");
  }

  return (
    <main className="login-shell">
      <section className="login-aside">
        <div className="brand brand-light">
          <span className="brand-mark"><Leaf size={20} strokeWidth={2.5} /></span>
          <span>Nusa<span className="brand-accent">Market</span></span>
        </div>
        <div className="aside-copy">
          <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Ruang kerja admin</span>
          <h1>Kelola bisnis,<br />dengan lebih <em>tenang.</em></h1>
          <p>Semua produk, pelanggan, dan pesanan dalam satu ruang yang mudah dipahami.</p>
        </div>
        <div className="aside-card">
          <div className="aside-chart-icon"><ChartNoAxesCombined size={19} /></div>
          <div><strong>Ringkas. Jelas. Terkendali.</strong><span>Aktivitas toko Anda selalu terpantau.</span></div>
          <span className="live-pulse" />
        </div>
        <span className="aside-footnote">MARKETPLACE MANAGEMENT · EST. 2026</span>
      </section>

      <section className="login-main">
        <div className="login-mobile-brand brand">
          <span className="brand-mark"><Leaf size={20} strokeWidth={2.5} /></span>
          <span>Nusa<span className="brand-accent">Market</span></span>
        </div>
        <div className="login-card">
          <div className="login-heading">
            <span className="eyebrow">SELAMAT DATANG KEMBALI</span>
            <h2>Masuk ke akun Anda</h2>
            <p>Gunakan akun admin untuk melanjutkan.</p>
          </div>
          <form className="login-fields" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">Alamat email</label>
            <div className="input-wrap"><Mail size={18} /><input id="email" name="email" type="email" placeholder="admin@example.com" autoComplete="username" required /></div>
            <div className="password-label"><label className="field-label" htmlFor="password">Kata sandi</label></div>
            <div className="input-wrap"><LockKeyhole size={18} /><input id="password" name="password" type="password" placeholder="Masukkan kata sandi" autoComplete="current-password" required /></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary login-submit" type="submit" disabled={loading}>
              {loading ? "Memeriksa akun…" : "Masuk ke dashboard"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>
          <div className="login-security"><span className="security-dot" /> Sesi Anda dilindungi dan dienkripsi</div>
        </div>
        <p className="login-copyright">© 2026 Nusa Market <span>·</span> Dibuat untuk kerja yang lebih baik.</p>
      </section>
    </main>
  );
}
