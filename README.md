# Nusa Market

Aplikasi marketplace sederhana dengan REST API Laravel dan panel admin Next.js. Backend menggunakan Laravel 13, Eloquent, PostgreSQL, dan Laravel Sanctum. Frontend menggunakan Next.js App Router, TypeScript, Auth.js, dan TanStack Query.

## Struktur repository

- `Backend/marketplace/` — aplikasi Laravel, API, migrasi, seeder, dan test Pest.
- `Frontend/` — panel admin Next.js.
- `DECISIONS.md` — keputusan teknis dan keterbatasan.
- `AI_USAGE.md` — penggunaan AI dan prompt utama.

## Setup lokal (6 langkah)

Prasyarat: PHP 8.3+, Composer, Node.js/npm, dan PostgreSQL. Buat database PostgreSQL bernama `marketplace`. Setelah clone, sesuaikan kredensial PostgreSQL pada `.env` backend.

1. Clone repository dan masuk ke foldernya:

   ```powershell
   git clone https://github.com/ilhampradipta34/BE_marketplace.git; Set-Location BE_marketplace
   ```

2. Buat file konfigurasi lokal dari contoh:

   ```powershell
   Copy-Item Backend/marketplace/.env.example Backend/marketplace/.env; Copy-Item Frontend/.env.example Frontend/.env.local
   ```

3. Instal dependency backend dan frontend:

   ```powershell
   composer install --working-dir=Backend/marketplace; npm --prefix Frontend install
   ```

4. Sebelum perintah berikut, isi kredensial database di `Backend/marketplace/.env` dan `AUTH_SECRET` di `Frontend/.env.local` dengan rahasia acak. Nilainya dapat dibuat dari folder `Frontend` memakai `npx auth secret`; `BACKEND_API_URL` default-nya sudah menunjuk ke `http://127.0.0.1:8000/api`. Pastikan database `marketplace` sudah dibuat, lalu jalankan migrasi dan seeder:

   ```powershell
   Push-Location Backend/marketplace; php artisan key:generate; php artisan migrate --seed; Pop-Location
   ```

5. Jalankan API pada terminal pertama:

   ```powershell
   Set-Location Backend/marketplace; php artisan serve
   ```

6. Jalankan UI pada terminal kedua dari root repository:

   ```powershell
   npm --prefix Frontend run dev
   ```

Buka `http://localhost:3000` untuk panel admin dan `http://127.0.0.1:8000` untuk server Laravel.

## Akun login seeder

Seeder membuat satu admin, 15 produk, dan 10 pelanggan:

- Email: `admin@example.com`
- Kata sandi lokal: `password`

Gunakan akun ini hanya untuk development/demo. Jangan gunakan kata sandi tersebut di server publik.

## Test backend

Dari root repository jalankan:

```powershell
cd Backend/marketplace
php artisan test
```

Test API berada di `Backend/marketplace/tests/Feature/MarketplaceApiTest.php`.

## Alur `POST /api/orders`

1. `Backend/marketplace/routes/api.php` melindungi route dengan middleware `auth:sanctum` dan mengarahkannya ke `OrderController::store`.
2. `StoreOrderRequest` memvalidasi pelanggan dan setiap item. Klien hanya mengirim `customer_id`, `product_id`, dan `quantity`; harga maupun total tidak diterima dari klien.
3. `OrderController::store` membuka transaksi melalui `ApiController::transaction`, mengunci baris pelanggan dan produk memakai `lockForUpdate()`, lalu memeriksa batas jumlah item, stok, dan jumlah order pending pelanggan.
4. Harga dibaca dari model `Product`. Controller menghitung subtotal/total, membuat order `PENDING` dan itemnya, serta mengurangi stok dalam transaksi yang sama.
5. Jika proses berhasil, transaksi disimpan dan `OrderResource` membentuk response. Jika validasi bisnis atau penyimpanan gagal, transaksi di-rollback agar order, item, dan perubahan stok tidak tersisa sebagian.

## Konfigurasi environment dan Git

File rahasia `.env` backend dan `.env.local` frontend tidak boleh di-commit. Repository menyediakan `Backend/marketplace/.env.example` dan `Frontend/.env.example` sebagai template. Jangan menaruh token atau kredensial asli ke file contoh.
