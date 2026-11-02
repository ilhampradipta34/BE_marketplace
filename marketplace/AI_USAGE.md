# Penggunaan AI

## Alat yang dipakai

- OpenAI Codex di IDE digunakan untuk membantu merancang struktur API, menulis dan merapikan controller, request, resource, model, migrasi, seeder, dokumentasi, serta test.
- Terminal digunakan untuk menjalankan Composer, Artisan, Pest, Pint, dan Git. Perintah terminal bukan alat AI; hasilnya dipakai untuk memeriksa dependency, format, test, dan status perubahan.

## Prompt utama

Berikut empat prompt dari percakapan pengerjaan, disalin apa adanya:

1. `buatkan rest api dimana setelah bikin api atau fitur langsung git add dan commit lalu push saja, dan ini brief apinya nanti tolong buat konsep dimana resource dan request di folder HTTP yg sejajar dengan controller jadi nanti dicontroller tinggak manggilr resource model maupun request validasi di req dan ini briefnya`
2. `untuk bagian difolder api controller pake begin db transaction dan roolbak serta trycatch dan juga rapikan ya`
3. `untuk singaktan $v dan $r tolong diperjelas ya itu apa`
4. `README.md: langkah setup dari git clone sampai aplikasi berjalan (maksimal 6 perintah), akun login seeder, cara menjalankan test, serta penjelasan singkat alur POST /api/orders dari route sampai database. File .env tidak boleh ter-commit, sediakan .env.example. DECISIONS.md — jawab dengan kata-kata Anda sendiri dan sebutkan file atau fungsi terkait: a) Bagaimana Anda mencegah stok minus saat dua order masuk bersamaan? b) Mengapa struktur folder dan lapisan kode Anda seperti ini, dan apa yang akan Anda ubah jika aplikasi membesar? c) Satu bug atau masalah yang Anda temui saat mengerjakan, dan bagaimana Anda menemukannya. d) Bagian yang belum selesai atau masih lemah, serta langkah Anda selanjutnya. AI_USAGE.md: tools AI yang dipakai, untuk bagian apa, 3–5 prompt utama (disalin apa adanya), dan bagian kode yang Anda tulis atau ubah sendiri. Jika tidak memakai AI, tuliskan demikian klo belum dibuat tolong dibuat klo sudah ada ganti ke bahasa indonesia aja`

## Kontribusi pengembang dan bagian yang dibantu AI

Pengembang menentukan kebutuhan API, batas bisnis, struktur folder yang diinginkan, dan arahan revisi melalui prompt di atas. Implementasi kode Laravel dalam sesi ini dibuat dan diedit dengan bantuan Codex, kemudian diperiksa melalui perintah proyek. Karena itu saya tidak mengklaim file implementasi berikut ditulis seluruhnya secara manual oleh pengembang:

- Controller, request, dan resource: `app/Http/Controllers/Api`, `app/Http/Requests`, `app/Http/Resources`.
- Model, migrasi, factory, dan seeder: `app/Models`, `database/migrations`, `database/factories`, `database/seeders`.
- Route, konfigurasi, test, dan dokumentasi: `routes/api.php`, `bootstrap/app.php`, `config/auth.php`, `tests/Feature/MarketplaceApiTest.php`, `README.md`, `DECISIONS.md`, dan file ini.

Pengembang tetap perlu membaca dan memahami kode sebelum menyatakan implementasi sebagai hasil kerja mandiri, dan bertanggung jawab memeriksa kesesuaiannya dengan brief.
