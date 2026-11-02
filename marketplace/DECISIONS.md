# Keputusan Teknis dan Evaluasi

## a. Mencegah stok menjadi minus ketika order bersamaan

`OrderController::store` menjalankan pemeriksaan stok dan pembuatan order di dalam transaksi melalui `ApiController::transaction`. Sebelum membaca stok, controller mengambil baris produk dengan `lockForUpdate()` dan mengurutkannya berdasarkan ID. Di PostgreSQL, transaksi kedua yang meminta produk sama akan menunggu kunci transaksi pertama; setelah menunggu, ia membaca stok terbaru. Jika stok tidak cukup, `ValidationException` melempar alur keluar dan helper transaksi melakukan rollback. Pengurangan stok, pembuatan order, dan pembuatan item dengan demikian berhasil atau dibatalkan sebagai satu unit.

`OrderController::cancel` juga mengunci baris order dan produk saat mengembalikan stok, sehingga dua pembatalan bersamaan tidak memulihkan stok dua kali: request kedua akan membaca status terbaru dan ditolak jika order sudah `CANCELLED`.

## b. Alasan struktur folder dan rencana saat aplikasi membesar

`routes/api.php` memetakan alamat API ke controller. `app/Http/Requests` berisi validasi input, `app/Http/Controllers/Api` mengatur alur request dan transaksi, `app/Models` mengakses data melalui Eloquent, dan `app/Http/Resources` mengatur bentuk response. Pemisahan ini membantu menemukan aturan input, alur bisnis, dan format JSON tanpa menumpuk semuanya dalam satu controller.

Jika aplikasi membesar, saya akan memindahkan use case seperti pembuatan order ke kelas layanan khusus, menambah policy untuk aturan akses, memisahkan domain atau modul marketplace, menambahkan dokumentasi OpenAPI, dan menaruh pekerjaan lambat di queue bila memang diperlukan. Controller kemudian cukup memvalidasi, memanggil use case, dan mengembalikan resource.

## c. Masalah yang ditemui dan cara menemukannya

Pada awal pengerjaan, dependency Sanctum belum tercantum atau terpasang. Saya menemukan masalah saat mencoba endpoint ber-middleware `auth:sanctum` dan menjalankan test: aplikasi melaporkan guard atau `SanctumServiceProvider` tidak ditemukan. Saya memeriksa dependency Composer dan konfigurasi autentikasi, memasang `laravel/sanctum`, mengaktifkan trait `HasApiTokens` pada `User`, lalu menjalankan kembali package discovery dan test sampai autentikasi aktif.

## d. Bagian yang masih lemah dan langkah berikutnya

- Aturan khusus varian yang disebut sebagai bagian 3 pada brief tidak disertakan dalam informasi yang tersedia. Saat ini `variant` hanya disimpan sebagai keterangan produk; tiap produk dibeli berdasarkan ID produk. Saya perlu menerapkan validasi atau relasi varian setelah aturan bagian 3 dipastikan.
- Test mencakup order sukses, stok tidak cukup, pengembalian stok, transisi status, batas pembelian, dan autentikasi. Belum ada test integrasi yang mengirim beberapa request bersamaan ke PostgreSQL untuk membuktikan perilaku locking di bawah beban nyata. Langkah berikutnya adalah menambah test paralel pada PostgreSQL.
- Nomor invoice memakai angka acak empat digit dengan pemeriksaan awal dan unique constraint. Dua transaksi masih mungkin memilih nomor yang sama di antara pemeriksaan dan insert. Langkah berikutnya adalah menangani pelanggaran unique constraint dengan retry terbatas.
- Sanctum menghasilkan personal access token opaque, bukan JWT. Jika kontrak integrasi benar-benar mewajibkan JWT, skema autentikasi perlu disepakati dan diganti dengan implementasi JWT yang sesuai.

## File terkait

- Transaksi umum: `app/Http/Controllers/Api/ApiController.php`, fungsi `transaction`.
- Pembuatan dan pembatalan order, penguncian stok, serta transisi status: `app/Http/Controllers/Api/OrderController.php`, fungsi `store`, `cancel`, dan `changeStatus`.
- Validasi payload order: `app/Http/Requests/StoreOrderRequest.php`.
- Test perilaku API: `tests/Feature/MarketplaceApiTest.php`.
