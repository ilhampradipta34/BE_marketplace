# Marketplace REST API

API backend marketplace berbasis Laravel 13, Eloquent, dan PostgreSQL. Endpoint selain login memakai bearer token Laravel Sanctum.

## Persiapan

Pastikan PHP 8.3+, Composer, dan PostgreSQL sudah tersedia. Buat database PostgreSQL bernama `marketplace`, atau sesuaikan konfigurasi database di `.env` setelah menyalin contoh. Jalankan perintah berikut dari terminal Bash/Git Bash:

```bash
git clone https://github.com/ilhampradipta34/BE_marketplace.git
cd BE_marketplace/marketplace
cp .env.example .env
composer install
php artisan key:generate && php artisan migrate --seed
php artisan serve
```

Aplikasi tersedia di `http://127.0.0.1:8000`. File `.env` bersifat lokal dan diabaikan Git; `.env.example` adalah template konfigurasi yang disimpan di repository. Jangan menambahkan kredensial rahasia ke `.env.example`.

## Data seeder dan login

`php artisan migrate --seed` membuat skema database dan menjalankan `DatabaseSeeder`. Seeder menambahkan satu admin, 15 produk, dan 10 pelanggan.

- Email: `admin@example.com`
- Password lokal: `password`

Gunakan password berbeda dan kuat untuk lingkungan selain lokal. Seeder ini ditujukan untuk database development/demo.

Login melalui `POST /api/login` dengan JSON berisi email dan password. Salin `data.token` dari response, lalu kirim di header `Authorization: Bearer <token>` untuk endpoint lainnya.

## Menjalankan test

Jalankan semua test Pest:

```bash
php artisan test
```

Untuk menjalankan test API saja:

```bash
php artisan test tests/Feature/MarketplaceApiTest.php
```

## Alur `POST /api/orders`

1. Route di `routes/api.php` memasang middleware `auth:sanctum` lalu meneruskan request ke `OrderController::store`.
2. `StoreOrderRequest` memeriksa `customer_id`, daftar `items`, `product_id`, dan `quantity`. Client tidak boleh menentukan harga atau total.
3. `OrderController::store` memulai transaksi melalui helper `ApiController::transaction`. Baris pelanggan dikunci untuk memeriksa batas tiga order `PENDING`; baris produk dikunci berurutan sebelum stok diperiksa.
4. Harga diambil dari model `Product`; controller menghitung subtotal dan total, membuat order `PENDING` serta itemnya, lalu mengurangi stok.
5. Jika seluruh langkah berhasil, transaksi di-commit dan `OrderResource` membentuk response. Jika validasi bisnis atau proses database gagal, transaksi di-rollback sehingga perubahan stok/order ikut dibatalkan.

## Struktur kode

- `app/Http/Controllers/Api`: alur endpoint dan orkestrasi bisnis.
- `app/Http/Requests`: validasi request masuk.
- `app/Http/Resources`: bentuk response JSON.
- `app/Models` dan `database/migrations`: model Eloquent, relasi, dan skema tabel.
- `database/factories` dan `database/seeders`: data uji dan data awal.
- `DECISIONS.md`: alasan teknis, keterbatasan, dan langkah lanjutan.
- `AI_USAGE.md`: penggunaan AI selama implementasi.
