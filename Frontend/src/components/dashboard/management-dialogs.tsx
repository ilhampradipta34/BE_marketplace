"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, X } from "lucide-react";
import type { Customer, CustomerInput, Order, Product, ProductInput } from "@/types/api";

const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function DialogFrame({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="order-dialog" role="dialog" aria-modal="true" aria-labelledby="management-dialog-title"><header className="dialog-header"><div><span className="eyebrow">KELOLA DATA</span><h2 id="management-dialog-title">{title}</h2><p>{subtitle}</p></div><button className="icon-button" aria-label="Tutup" onClick={onClose}><X size={19} /></button></header>{children}</section></div>;
}

function ErrorMessage({ message }: { message?: string }) {
  return message ? <div className="form-error" role="alert"><pre>{message}</pre></div> : null;
}

export function ProductDialog({ product, isSaving, error, onClose, onSubmit }: { product: Product | null; isSaving: boolean; error?: string; onClose: () => void; onSubmit: (payload: ProductInput) => void }) {
  const [form, setForm] = useState<ProductInput>({ product_code: "", name: "", variant: "", price: 1, stock: 0 });
  useEffect(() => {
    setForm(product ? { product_code: product.product_code, name: product.name, variant: product.variant ?? "", price: product.price, stock: product.stock } : { product_code: "", name: "", variant: "", price: 1, stock: 0 });
  }, [product]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ ...form, variant: form.variant || null, price: Number(form.price), stock: Number(form.stock) });
  }
  return <DialogFrame title={product ? "Ubah produk" : "Tambah produk"} subtitle="Kode produk harus unik; harga lebih dari nol dan stok tidak boleh negatif." onClose={onClose}><form className="management-form" onSubmit={submit}>
    <label>Kode produk<input required maxLength={80} value={form.product_code} onChange={(event) => setForm({ ...form, product_code: event.target.value })} /></label>
    <label>Nama produk<input required maxLength={255} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
    <label>Varian<input maxLength={100} value={form.variant ?? ""} onChange={(event) => setForm({ ...form, variant: event.target.value })} /></label>
    <div className="management-form-row"><label>Harga<input required type="number" min="0.01" step="any" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></label><label>Stok<input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} /></label></div>
    <ErrorMessage message={error} /><footer className="dialog-footer"><button type="button" className="button button-quiet" onClick={onClose}>Batal</button><button className="button button-primary" disabled={isSaving}>{isSaving ? "Menyimpan…" : "Simpan produk"}<ArrowRight size={16} /></button></footer>
  </form></DialogFrame>;
}

export function CustomerDialog({ isSaving, error, onClose, onSubmit }: { isSaving: boolean; error?: string; onClose: () => void; onSubmit: (payload: CustomerInput) => void }) {
  const [form, setForm] = useState<CustomerInput>({ name: "", email: "", phone: "" });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ ...form, phone: form.phone || null });
  }
  return <DialogFrame title="Tambah pelanggan" subtitle="Masukkan data pelanggan untuk digunakan pada pesanan." onClose={onClose}><form className="management-form" onSubmit={submit}>
    <label>Nama<input required maxLength={255} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
    <label>Email<input required type="email" maxLength={255} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
    <label>Telepon<input maxLength={30} value={form.phone ?? ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
    <ErrorMessage message={error} /><footer className="dialog-footer"><button type="button" className="button button-quiet" onClick={onClose}>Batal</button><button className="button button-primary" disabled={isSaving}>{isSaving ? "Menyimpan…" : "Simpan pelanggan"}<ArrowRight size={16} /></button></footer>
  </form></DialogFrame>;
}

export function OrderDetailsDialog({ order, isLoading, error, onClose }: { order?: Order; isLoading: boolean; error?: string; onClose: () => void }) {
  return <DialogFrame title="Detail pesanan" subtitle={order?.order_number ?? "Rincian item, pelanggan, status, dan total."} onClose={onClose}>
    {isLoading ? <div className="table-empty">Memuat detail pesanan…</div> : error ? <ErrorMessage message={error} /> : order ? <div className="order-details">
      <div className="order-detail-meta"><span>Status<b>{order.status}</b></span><span>Pelanggan<b>{order.customer?.name ?? "—"}</b></span><span>Tanggal<b>{order.created_at ? new Date(order.created_at).toLocaleString("id-ID") : "—"}</b></span></div>
      <div className="table-scroll"><table><thead><tr><th>PRODUK</th><th>JUMLAH</th><th>HARGA SATUAN</th><th>SUBTOTAL</th></tr></thead><tbody>{order.items.map((item, index) => <tr key={`${item.product_id}-${index}`}><td>{item.product_name ?? `Produk #${item.product_id}`}</td><td>{item.quantity}</td><td>{money.format(item.unit_price)}</td><td>{money.format(item.subtotal)}</td></tr>)}</tbody></table></div>
      <div className="dialog-total"><span>Total pesanan</span><b>{money.format(order.total)}</b></div>
    </div> : null}
  </DialogFrame>;
}
