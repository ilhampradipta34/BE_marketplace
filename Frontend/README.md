# Nusa Market — Frontend

Frontend panel admin marketplace menggunakan Next.js App Router, TypeScript, Auth.js Credentials, dan TanStack Query. Permintaan ke Laravel diteruskan oleh route proxy server Next.js agar bearer token Sanctum tidak dikirim ke kode JavaScript browser.

## Menjalankan secara lokal

1. Pastikan API Laravel berjalan dari `Backend/marketplace` pada `http://127.0.0.1:8000` dan database sudah di-seed.
2. Dari folder `Frontend`, instal paket:

   ```bash
   npm install
   ```

3. Salin `.env.example` menjadi `.env.local`, lalu isi `AUTH_SECRET` dengan rahasia acak. Bisa dibuat menggunakan `npx auth secret`. `BACKEND_API_URL` harus mengarah ke URL API Laravel, default-nya `http://127.0.0.1:8000/api`.
4. Jalankan UI:

   ```bash
   npm run dev
   ```

5. Buka `http://localhost:3000`. Login seeder lokal: `admin@example.com` / `password`.

`AUTH_SECRET` harus dirahasiakan dan `.env.local` tidak boleh dimasukkan ke Git. Folder `src/types` menyimpan kontrak TypeScript response API dan augmentasi tipe Auth.js.
