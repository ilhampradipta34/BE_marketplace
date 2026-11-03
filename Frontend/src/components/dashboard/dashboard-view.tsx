"use client";

import "./dashboard.css";
import dynamic from "next/dynamic";
import { signOut, useSession } from "next-auth/react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Boxes,
  Check,
  ChevronDown,
  CirclePlus,
  Clock3,
  Eye,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  PackageOpen,
  Pencil,
  Search,
  ShoppingBag,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { CustomerDialog, OrderDetailsDialog, ProductDialog } from "./management-dialogs";
import type { CreateOrderPayload, Customer, Order, Product } from "@/types/api";

const RevenueChart = dynamic(() => import("./revenue-chart"), {
  ssr: false,
  loading: () => <div className="chart-loading"><span className="spinner" /> Memuat grafik…</div>,
});

const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
    : "—";

export default function DashboardView() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [orderError, setOrderError] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  const {
    productsQuery,
    orderProductsQuery,
    customersQuery,
    orderCustomersQuery,
    ordersQuery,
    summaryOrdersQuery,
    orderDetailQuery,
    statusMutation,
    orderMutation,
    productMutation,
    customerMutation,
  } = useDashboardData({
    search,
    productPage,
    customerPage,
    orderFilters: { page: orderPage, status: orderStatus, from: dateFrom, to: dateTo },
    selectedOrderId,
    onError: setNotice,
    onOrderError: setOrderError,
    onOrderCreated: (orderNumber) => {
      setShowOrderForm(false);
      setOrderError("");
      setNotice(`Order ${orderNumber} berhasil dibuat.`);
    },
    onProductSaved: (message) => {
      setShowProductForm(false);
      setEditingProduct(null);
      setNotice(message);
    },
    onCustomerCreated: (message) => {
      setShowCustomerForm(false);
      setNotice(message);
    },
  });
  const products = productsQuery.data?.data ?? [];
  const orderProducts = orderProductsQuery.data?.data ?? [];
  const customers = customersQuery.data?.data ?? [];
  const orderCustomers = orderCustomersQuery.data?.data ?? [];
  const orders = ordersQuery.data?.data ?? [];
  const summaryOrders = summaryOrdersQuery.data?.data ?? [];
  const queryError = productsQuery.error ?? orderProductsQuery.error ?? customersQuery.error ?? orderCustomersQuery.error ?? ordersQuery.error ?? summaryOrdersQuery.error;

  const paidOrders = summaryOrders.filter((order) => order.status === "PAID");
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const revenueMonths = useMemo(() => {
    const currentMonth = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 5 + index, 1);
      return {
        key: `${month.getFullYear()}-${month.getMonth()}`,
        label: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(month),
        value: 0,
      };
    });

    for (const order of paidOrders) {
      if (!order.created_at) continue;
      const createdAt = new Date(order.created_at);
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const month = months.find((entry) => entry.key === key);
      if (month) month.value += order.total;
    }

    return months;
  }, [paidOrders]);
  const earlierRevenue = revenueMonths.slice(0, 3).reduce((sum, month) => sum + month.value, 0);
  const recentRevenue = revenueMonths.slice(3).reduce((sum, month) => sum + month.value, 0);
  const revenueTrend = earlierRevenue > 0
    ? Math.round(((recentRevenue - earlierRevenue) / earlierRevenue) * 100)
    : null;
  const pendingOrders = summaryOrders.filter((order) => order.status === "PENDING").length;
  const totalProducts = productsQuery.data?.meta?.total ?? products.length;
  const totalCustomers = customersQuery.data?.meta?.total ?? customers.length;
  const availableStock = orderProducts.reduce((sum, product) => sum + product.stock, 0);
  const currentDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="dashboard-shell min-h-screen bg-market-canvas text-market-ink antialiased">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""} bg-white shadow-market`}>
        <a className="brand sidebar-brand" href="/dashboard">
          <span className="brand-mark"><Leaf size={19} strokeWidth={2.6} /></span>
          <span>Nusa<span className="brand-accent">Market</span></span>
        </a>
        <div className="workspace-switch"><span className="workspace-avatar">N</span><span><b>Nusa Store</b><small>Workspace admin</small></span><ChevronDown size={16} /></div>
        <span className="nav-caption">MENU UTAMA</span>
        <nav className="side-nav" aria-label="Navigasi utama">
          <a className="nav-link nav-active" href="#overview" onClick={() => setMobileNav(false)}><LayoutDashboard size={18} /> Ikhtisar <span className="nav-active-indicator" /></a>
          <a className="nav-link" href="#products" onClick={() => setMobileNav(false)}><PackageOpen size={18} /> Produk</a>
          <a className="nav-link" href="#orders" onClick={() => setMobileNav(false)}><ShoppingBag size={18} /> Pesanan <span className="nav-count">{pendingOrders}</span></a>
          <a className="nav-link" href="#customers" onClick={() => setMobileNav(false)}><UsersRound size={18} /> Pelanggan</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-card"><span className="plan-icon"><WalletCards size={17} /></span><b>Semua terkendali</b><p>Data toko tersinkron dengan aman.</p><div className="plan-progress"><i /></div><small>Sinkronisasi aktif</small></div>
          <button className="profile-button" onClick={() => signOut({ callbackUrl: "/login" })}>
            <span className="profile-avatar">{session?.user?.name?.slice(0, 1) ?? "A"}</span>
            <span className="profile-text"><b>{session?.user?.name ?? "Admin"}</b><small>{session?.user?.email ?? "Administrator"}</small></span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {mobileNav && <button className="sidebar-backdrop" aria-label="Tutup menu" onClick={() => setMobileNav(false)} />}

      <main className="main-panel min-h-screen" id="overview">
        <header className="topbar sticky top-0 z-10 border-b border-market-line bg-white/90 backdrop-blur">
          <button className="icon-button mobile-menu" aria-label="Buka menu" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Workspace</span><span>/</span><b>Ikhtisar</b></div>
          <div className="topbar-actions"><span className="today-label"><span className="online-dot" /> Toko aktif</span><button className="icon-button notification-button" aria-label="Notifikasi"><Bell size={19} /><i /></button><span className="topbar-avatar">{session?.user?.name?.slice(0, 1) ?? "A"}</span></div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> {currentDate}</div><h1>Selamat siang, {session?.user?.name?.split(" ")[0] ?? "Admin"}<span className="wave">✳</span></h1><p>Ini ringkasan aktivitas tokomu hari ini.</p></div>
            <button className="button button-primary" onClick={() => { setNotice(""); setOrderError(""); setShowOrderForm(true); }}><CirclePlus size={18} /> Buat pesanan</button>
          </div>

          {(notice || queryError || statusMutation.error) && <div className={`notice ${queryError || statusMutation.error ? "notice-error" : ""}`} role={queryError || statusMutation.error ? "alert" : "status"} aria-live="polite"><span>{queryError || statusMutation.error ? <X size={16} /> : <Check size={16} />} {notice || queryError?.message || statusMutation.error?.message}</span><button aria-label="Tutup pesan" onClick={() => { setNotice(""); statusMutation.reset(); }}><X size={16} /></button></div>}

          <section className="stats-grid" aria-label="Ringkasan toko">
            <StatCard icon={<WalletCards size={18} />} label="Pendapatan tercatat" value={money.format(revenue)} trend={`Dari ${paidOrders.length} order lunas`} tone="mint" />
            <StatCard icon={<ShoppingBag size={18} />} label="Pesanan menunggu" value={String(pendingOrders).padStart(2, "0")} trend="Perlu ditindaklanjuti" tone="lavender" />
            <StatCard icon={<Boxes size={18} />} label="Unit dalam stok" value={String(availableStock).padStart(2, "0")} trend={`${totalProducts} produk terdaftar`} tone="peach" />
            <StatCard icon={<UsersRound size={18} />} label="Pelanggan" value={String(totalCustomers).padStart(2, "0")} trend="Pelanggan terdaftar" tone="sky" />
          </section>

          <section className="overview-grid">
            <article className="panel revenue-panel rounded-2xl border border-market-line bg-white shadow-sm">
              <div className="panel-heading"><div><h2>Ringkasan penjualan</h2><p>Performa tokomu dalam 6 bulan terakhir</p></div><button className="select-button">6 bulan <ChevronDown size={15} /></button></div>
              <div className="revenue-total"><strong>{money.format(revenue)}</strong>{revenueTrend !== null && <span className={`trend-pill ${revenueTrend < 0 ? "trend-down" : ""}`}>{revenueTrend < 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{Math.abs(revenueTrend)}%</span>}<small>total dari order lunas</small></div>
              <RevenueChart data={revenueMonths} />
            </article>
            <article className="panel activity-panel rounded-2xl border border-market-line bg-white shadow-sm">
              <div className="panel-heading"><div><h2>Aktivitas toko</h2><p>Data hari ini</p></div><button className="dots-button" aria-label="Opsi"><span>•••</span></button></div>
              <div className="activity-list">
                <Activity icon={<ShoppingBag size={16} />} tone="activity-green" title="Pesanan baru" detail={`${pendingOrders} pesanan menunggu pembayaran`} value={String(pendingOrders).padStart(2, "0")} />
                <Activity icon={<Check size={16} />} tone="activity-blue" title="Pesanan lunas" detail="Siap diproses dan dikirim" value={String(paidOrders.length).padStart(2, "0")} />
                <Activity icon={<PackageOpen size={16} />} tone="activity-amber" title="Produk aktif" detail="Tersedia di katalog toko" value={String(totalProducts).padStart(2, "0")} />
              </div>
              <div className="activity-note"><Clock3 size={15} /><span>Data diperbarui otomatis saat halaman dibuka.</span></div>
            </article>
          </section>

          <section className="panel table-panel rounded-2xl border border-market-line bg-white shadow-sm" id="orders">
            <div className="panel-heading table-heading"><div><h2>Riwayat pesanan</h2><p>Filter status/tanggal, lihat detail, dan kelola pesanan</p></div><div className="management-filters"><select aria-label="Filter status pesanan" value={orderStatus} onChange={(event) => { setOrderPage(1); setOrderStatus(event.target.value); }}><option value="">Semua status</option><option value="PENDING">Menunggu</option><option value="PAID">Lunas</option><option value="CANCELLED">Dibatalkan</option></select><label>Dari<input type="date" value={dateFrom} onChange={(event) => { setOrderPage(1); setDateFrom(event.target.value); }} /></label><label>Sampai<input type="date" value={dateTo} onChange={(event) => { setOrderPage(1); setDateTo(event.target.value); }} /></label></div></div>
            <OrderTable orders={orders} isLoading={ordersQuery.isLoading} isMutating={statusMutation.isPending} onAction={(orderId, action) => statusMutation.mutate({ orderId, action })} onDetails={setSelectedOrderId} />
            <PageControls page={ordersQuery.data?.meta?.page ?? orderPage} perPage={ordersQuery.data?.meta?.per_page ?? 10} total={ordersQuery.data?.meta?.total ?? orders.length} onPageChange={setOrderPage} />
          </section>

          <section className="panel table-panel products-panel rounded-2xl border border-market-line bg-white shadow-sm" id="products">
            <div className="panel-heading table-heading"><div><h2>Produk</h2><p>Tambah, cari, dan ubah katalog produk</p></div><div className="product-tools"><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => { setProductPage(1); setSearch(event.target.value); }} placeholder="Cari nama/kode…" /></label><button className="button button-primary" onClick={() => { setEditingProduct(null); setShowProductForm(true); }}><CirclePlus size={16} /> Tambah produk</button></div></div>
            <ProductTable products={products} isLoading={productsQuery.isLoading} onEdit={(product) => { setEditingProduct(product); setShowProductForm(true); }} />
            <PageControls page={productsQuery.data?.meta?.page ?? productPage} perPage={productsQuery.data?.meta?.per_page ?? 10} total={productsQuery.data?.meta?.total ?? products.length} onPageChange={setProductPage} />
          </section>

          <section className="panel table-panel rounded-2xl border border-market-line bg-white shadow-sm" id="customers">
            <div className="panel-heading table-heading"><div><h2>Pelanggan</h2><p>Daftar pelanggan untuk transaksi</p></div><button className="button button-primary" onClick={() => setShowCustomerForm(true)}><CirclePlus size={16} /> Tambah pelanggan</button></div>
            <CustomerTable customers={customers} isLoading={customersQuery.isLoading} />
            <PageControls page={customersQuery.data?.meta?.page ?? customerPage} perPage={customersQuery.data?.meta?.per_page ?? 10} total={customersQuery.data?.meta?.total ?? customers.length} onPageChange={setCustomerPage} />
          </section>

          <footer className="page-footer"><span>© 2026 Nusa Market</span><span><i className="online-dot" /> Sistem beroperasi normal</span></footer>
        </div>
      </main>

      {showOrderForm && <OrderDialog products={orderProducts} customers={orderCustomers} isSaving={orderMutation.isPending} serverError={orderError || orderProductsQuery.error?.message || orderCustomersQuery.error?.message || ""} onClose={() => setShowOrderForm(false)} onSubmit={(payload) => { setOrderError(""); orderMutation.mutate(payload); }} />}
      {showProductForm && <ProductDialog product={editingProduct} isSaving={productMutation.isPending} error={productMutation.error?.message} onClose={() => { setShowProductForm(false); setEditingProduct(null); productMutation.reset(); }} onSubmit={(payload) => productMutation.mutate({ id: editingProduct?.id, payload })} />}
      {showCustomerForm && <CustomerDialog isSaving={customerMutation.isPending} error={customerMutation.error?.message} onClose={() => { setShowCustomerForm(false); customerMutation.reset(); }} onSubmit={(payload) => customerMutation.mutate(payload)} />}
      {selectedOrderId !== null && <OrderDetailsDialog order={orderDetailQuery.data?.data} isLoading={orderDetailQuery.isLoading} error={orderDetailQuery.error?.message} onClose={() => setSelectedOrderId(null)} />}
    </div>
  );
}

function StatCard({ icon, label, value, trend, tone }: { icon: React.ReactNode; label: string; value: string; trend: string; tone: string }) {
  return <article className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><span className="stat-label">{label}</span><strong>{value}</strong><div className="stat-foot"><span className="stat-trend"><ArrowUpRight size={13} /> {trend}</span><span className="stat-sparkline">⌁</span></div></article>;
}

function Activity({ icon, tone, title, detail, value }: { icon: React.ReactNode; tone: string; title: string; detail: string; value: string }) {
  return <div className="activity-row"><span className={`activity-icon ${tone}`}>{icon}</span><span className="activity-copy"><b>{title}</b><small>{detail}</small></span><strong>{value}</strong></div>;
}

function OrderTable({ orders, isLoading, isMutating, onAction, onDetails }: { orders: Order[]; isLoading: boolean; isMutating: boolean; onAction: (orderId: number, action: "pay" | "cancel") => void; onDetails: (orderId: number) => void }) {
  if (isLoading) return <div className="table-empty"><span className="spinner" /> Memuat pesanan…</div>;
  if (!orders.length) return <div className="table-empty"><ShoppingBag size={20} /> Belum ada pesanan. Buat pesanan pertama untuk mulai.</div>;

  return <div className="table-scroll"><table><thead><tr><th>NO. PESANAN</th><th>PELANGGAN</th><th>TANGGAL</th><th>TOTAL</th><th>STATUS</th><th>AKSI</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><b className="order-number">{order.order_number}</b></td><td><span className="customer-cell"><span className="customer-avatar">{order.customer?.name.slice(0, 1) ?? "P"}</span>{order.customer?.name ?? "Pelanggan"}</span></td><td>{date(order.created_at)}</td><td className="amount-cell">{money.format(order.total)}</td><td><StatusBadge status={order.status} /></td><td><div className="row-actions"><button onClick={() => onDetails(order.id)} title="Lihat detail"><Eye size={14} /> Detail</button>{order.status === "PENDING" && <button disabled={isMutating} onClick={() => onAction(order.id, "pay")}>Tandai lunas</button>}{["PENDING", "PAID"].includes(order.status) && <button className="cancel-action" disabled={isMutating} onClick={() => onAction(order.id, "cancel")}>Batalkan</button>}</div></td></tr>)}</tbody></table></div>;
}

function ProductTable({ products, isLoading, onEdit }: { products: Product[]; isLoading: boolean; onEdit: (product: Product) => void }) {
  if (isLoading) return <div className="table-empty"><span className="spinner" /> Memuat produk…</div>;
  if (!products.length) return <div className="table-empty"><PackageOpen size={20} /> Produk tidak ditemukan.</div>;

  return <div className="table-scroll"><table><thead><tr><th>PRODUK</th><th>KODE</th><th>VARIAN</th><th>HARGA</th><th>STOK</th><th>STATUS</th><th /></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><span className="product-cell"><span className="product-art"><PackageOpen size={17} /></span><b>{product.name}</b></span></td><td className="muted-cell">{product.product_code}</td><td>{product.variant ?? "—"}</td><td className="amount-cell">{money.format(product.price)}</td><td><b>{product.stock}</b> unit</td><td><span className={`stock-status ${product.stock > 5 ? "stock-ready" : "stock-low"}`}><i />{product.stock > 5 ? "Tersedia" : "Menipis"}</span></td><td><button className="row-edit" onClick={() => onEdit(product)}><Pencil size={14} /> Ubah</button></td></tr>)}</tbody></table></div>;
}

function CustomerTable({ customers, isLoading }: { customers: Customer[]; isLoading: boolean }) {
  if (isLoading) return <div className="table-empty"><span className="spinner" /> Memuat pelanggan…</div>;
  if (!customers.length) return <div className="table-empty"><UsersRound size={20} /> Belum ada pelanggan.</div>;
  return <div className="table-scroll"><table><thead><tr><th>NAMA</th><th>EMAIL</th><th>TELEPON</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><span className="customer-cell"><span className="customer-avatar">{customer.name.slice(0, 1)}</span><b>{customer.name}</b></span></td><td>{customer.email}</td><td>{customer.phone || "—"}</td></tr>)}</tbody></table></div>;
}

function PageControls({ page, perPage, total, onPageChange }: { page: number; perPage: number; total: number; onPageChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  return <div className="page-controls"><span>Menampilkan {total === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, total)} dari {total} data</span><div><button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Sebelumnya</button><b>Halaman {page} dari {pages}</b><button disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Berikutnya</button></div></div>;
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const labels = { PENDING: "Menunggu", PAID: "Lunas", CANCELLED: "Dibatalkan" };
  return <span className={`status-badge status-${status.toLowerCase()}`}><i />{labels[status]}</span>;
}

function OrderDialog({ products, customers, isSaving, serverError, onClose, onSubmit }: { products: Product[]; customers: { id: number; name: string; email: string }[]; isSaving: boolean; serverError: string; onClose: () => void; onSubmit: (payload: CreateOrderPayload) => void }) {
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ productId: "", quantity: 1 }]);
  const [error, setError] = useState("");
  const total = useMemo(() => lines.reduce((sum, line) => {
    const product = products.find((entry) => entry.id === Number(line.productId));
    return sum + (product?.price ?? 0) * line.quantity;
  }, 0), [lines, products]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || lines.some((line) => !line.productId)) {
      setError("Pilih pelanggan dan produk untuk setiap baris.");
      return;
    }
    if (new Set(lines.map((line) => line.productId)).size !== lines.length) {
      setError("Produk yang sama tidak boleh dipilih dua kali.");
      return;
    }
    setError("");
    onSubmit({ customer_id: Number(customerId), items: lines.map((line) => ({ product_id: Number(line.productId), quantity: line.quantity })) });
  }

  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="order-dialog" role="dialog" aria-modal="true" aria-labelledby="order-dialog-title"><header className="dialog-header"><div><span className="eyebrow">PESANAN BARU</span><h2 id="order-dialog-title">Buat pesanan</h2><p>Harga dan total dihitung otomatis oleh sistem.</p></div><button className="icon-button" aria-label="Tutup" onClick={onClose}><X size={19} /></button></header><form onSubmit={submit}><label className="field-label" htmlFor="customer">Pelanggan</label><select id="customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)} required><option value="">Pilih pelanggan</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name} · {customer.email}</option>)}</select><div className="dialog-lines-heading"><span className="field-label">Produk</span><button type="button" className="add-line" onClick={() => setLines([...lines, { productId: "", quantity: 1 }])}><CirclePlus size={15} /> Tambah produk</button></div>{lines.map((line, index) => <div className="order-line" key={index}><select aria-label={`Produk ${index + 1}`} value={line.productId} onChange={(event) => setLines(lines.map((current, lineIndex) => lineIndex === index ? { ...current, productId: event.target.value } : current))} required><option value="">Pilih produk</option>{products.map((product) => <option key={product.id} value={product.id} disabled={product.stock < 1}>{product.name} · {product.variant} · stok {product.stock}</option>)}</select><input aria-label="Jumlah" type="number" min="1" max="5" value={line.quantity} onChange={(event) => setLines(lines.map((current, lineIndex) => lineIndex === index ? { ...current, quantity: Math.min(5, Math.max(1, Number(event.target.value))) } : current))} />{lines.length > 1 && <button type="button" className="remove-line" aria-label="Hapus produk" onClick={() => setLines(lines.filter((_, lineIndex) => lineIndex !== index))}><X size={15} /></button>}</div>)}<div className="dialog-total"><span>Estimasi total</span><b>{money.format(total)}</b></div>{(error || serverError) && <div className="form-error" role="alert" aria-live="assertive">{error && <p>{error}</p>}{serverError && <pre>{serverError}</pre>}</div>}<footer className="dialog-footer"><button type="button" className="button button-quiet" onClick={onClose}>Batal</button><button className="button button-primary" type="submit" disabled={isSaving || !products.length || !customers.length}>{isSaving ? "Menyimpan…" : "Buat pesanan"}<ArrowRight size={16} /></button></footer></form></section></div>;
}
