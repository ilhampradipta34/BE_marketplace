# Keputusan Teknis

## a. Cara mencegah stok minus saat dua order datang bersamaan

Di `Backend/marketplace/app/Http/Controllers/Api/OrderController.php`, fungsi `store` menjalankan pemeriksaan stok dan pengurangan stok dalam satu transaksi yang dibungkus helper `transaction` di `ApiController`. Baris produk diambil dengan `lockForUpdate()` setelah ID produk diurutkan. Pada PostgreSQL, transaksi lain yang meminta baris produk yang sama menunggu sampai transaksi pertama selesai, lalu membaca stok yang sudah terbaru. Jika jumlah tidak cukup, validasi melempar error sehingga seluruh transaksi dibatalkan.

Fungsi `cancel` mengunci order dan produk saat mengembalikan stok, lalu mengubah statusnya. Pemeriksaan status di dalam lock mencegah dua permintaan pembatalan mengembalikan stok yang sama dua kali. Mekanisme ini bergantung pada database yang mendukung row-level locking; konfigurasi yang disediakan memakai PostgreSQL.

## b. Alasan struktur folder dan rencana jika aplikasi membesar

Di backend, `routes/api.php` memetakan URL; `app/Http/Requests` memvalidasi input; `app/Http/Controllers/Api` mengatur alur API dan transaksi; `app/Models` memetakan tabel/relasi Eloquent; `app/Http/Resources` membentuk response JSON; sedangkan `database/migrations`, `factories`, dan `seeders` mengelola skema dan data awal. Pemisahan ini membuat aturan input, alur bisnis, dan format response lebih mudah dicari.

Di frontend, `src/lib/api-client.ts` menangani request, `src/hooks/use-dashboard-data.ts` mengelola query/mutasi TanStack Query, `src/types` menyimpan kontrak TypeScript, dan `src/components` menyusun UI. Route proxy Next.js meneruskan request terlindungi ke Laravel tanpa mengekspos token Sanctum ke JavaScript browser.

Jika aplikasi berkembang, saya akan memindahkan use case order ke kelas layanan/domain, menambah policy untuk akses, menambah dokumentasi OpenAPI, dan menambah test integrasi konkurensi di PostgreSQL. Di frontend, modul produk, pelanggan, dan order dapat dipisah menjadi fitur masing-masing beserta hook dan komponen khusus.

## c. Masalah yang ditemui dan cara menemukannya

Saat mencoba membuka `http://localhost:8000/api`, browser menampilkan 404. Saya menelusuri `Backend/marketplace/routes/api.php` dan melihat bahwa aplikasi memang tidak mendefinisikan route `GET /api` sebagai halaman indeks. Endpoint yang tersedia berada di bawah prefix API, misalnya `POST /api/login` dan `GET /api/products`; endpoint selain login memerlukan token. Daftar route bisa diperiksa dengan `php artisan route:list --path=api` dari folder backend. Jadi URL dasar server bukan endpoint katalog API.

## d. Bagian yang belum selesai atau masih lemah

- Brief menyebut aturan varian di bagian 3, tetapi rincian aturan itu tidak tersedia. Saat ini `variant` hanya menjadi atribut produk dan order memilih produk berdasarkan ID. Langkah berikutnya adalah mengonfirmasi aturan varian lalu menambahkan validasi/model yang sesuai.
- Test Pest mencakup tujuh skenario, termasuk batas 5 unit dan maksimal 3 order pending. Belum ada test integrasi yang mengirim request secara paralel ke PostgreSQL untuk menguji locking di bawah konkurensi nyata.
- Nomor invoice memakai angka acak empat digit dan pemeriksaan unik sebelum insert. Unique constraint di database menjadi perlindungan terakhir, tetapi benturan tetap dapat membuat satu request gagal. Langkah berikutnya adalah menambahkan retry terbatas saat unique constraint gagal.
- Sanctum mengeluarkan personal access token opaque, bukan JWT. Jika penilaian mensyaratkan JWT secara literal, jenis token dan kebutuhan integrasinya perlu dipastikan lalu autentikasi disesuaikan.
- Ringkasan dashboard mengambil maksimal 100 order/produk untuk menghitung sebagian statistik. Jika data melewati batas itu, agregat sebaiknya disediakan melalui endpoint statistik backend.

File utama terkait transaksi dan status: `Backend/marketplace/app/Http/Controllers/Api/ApiController.php` (`transaction`) dan `Backend/marketplace/app/Http/Controllers/Api/OrderController.php` (`store`, `cancel`, `changeStatus`). Validasi order ada di `Backend/marketplace/app/Http/Requests/StoreOrderRequest.php`; test API ada di `Backend/marketplace/tests/Feature/MarketplaceApiTest.php`.
