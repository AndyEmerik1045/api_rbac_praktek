# Laporan Praktikum: Implementasi RBAC API Service dengan Bun.js

**Mata Kuliah:** Pemrograman Web Lanjut (Pertemuan 13)

**Nama:** AndyEmerik1045

**Topik:** Implementasi Role-Based Access Control (RBAC) API Service menggunakan Bun.js dengan Clean Architecture

---

## Pendahuluan

Praktikum ini bertujuan membangun sebuah REST API Service yang mengimplementasikan Role-Based Access Control (RBAC) menggunakan Bun.js sebagai runtime, Express.js sebagai framework HTTP, Prisma ORM untuk manajemen database MySQL, serta JWT dan Bcrypt untuk keamanan autentikasi. Seluruh kode dibangun mengikuti prinsip Clean Architecture untuk menghindari "Spaghetti Code" dan menjaga kode tetap bersih, modular, serta mudah diuji.

---

## Langkah-langkah Pengerjaan

### Langkah 1 — Setup Struktur Folder Clean Architecture

**Tujuan:** Memisahkan tanggung jawab kode ke dalam lapisan-lapisan yang jelas sesuai prinsip Clean Architecture, sehingga setiap bagian aplikasi memiliki satu tanggung jawab yang spesifik.

Dibuat struktur folder berikut menggunakan perintah `mkdir -p`:

```
src/
├── config/           ← konfigurasi environment
├── constants/        ← enum dan konstanta
├── core/
│   ├── entities/     ← model bisnis murni
│   └── use-cases/    ← logika bisnis (Register, Login)
├── infrastructure/
│   ├── database/     ← Prisma singleton
│   └── security/     ← JWT & Bcrypt
├── interfaces/
│   ├── controllers/  ← request/response handler
│   ├── middlewares/  ← auth & RBAC middleware
│   └── routes/       ← definisi endpoint
└── utils/
```

**Output:** Seluruh folder berhasil dibuat dan diverifikasi dengan perintah `find src -type d`, menghasilkan 13 direktori termasuk `src/types/` yang sudah ada dari repo dosen.

---

### Langkah 2 — Konfigurasi Environment dan Prisma

**Tujuan:** Mengelola kredensial dan konfigurasi aplikasi secara aman menggunakan file `.env`, serta mengkonfigurasi Prisma agar terintegrasi dengan variabel lingkungan.

Dibuat tiga file konfigurasi:

- `.env` — menyimpan variabel seperti `PORT`, `DB_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, dan `SALT_ROUNDS`. File ini sudah terdaftar di `.gitignore` sehingga tidak ter-push ke GitHub.
- `src/config/env.ts` — mengekspos variabel environment ke seluruh aplikasi secara terstruktur dengan tipe TypeScript yang ketat.
- `prisma.config.ts` — mengkonfigurasi lokasi schema, path migrasi, dan skrip seeding yang dijalankan menggunakan Bun runtime.

**Output:** Ketiga file berhasil dibuat dan diverifikasi. Variabel `DB_URL` mengarah ke database MySQL lokal `rbac_db` di port 3306.

---

### Langkah 3 — Prisma Schema RBAC dan Migrasi Database

**Tujuan:** Mendefinisikan model data untuk sistem RBAC dengan relasi yang tepat antara User, Role, dan Permission, lalu menyinkronkan skema tersebut ke database MySQL.

Skema Prisma didefinisikan dengan tiga model:

- `User` — memiliki relasi Many-to-One ke `Role` melalui `roleId`.
- `Role` — memiliki relasi Many-to-Many ke `Permission` menggunakan named relation `"PermissionToRole"`.
- `Permission` — diidentifikasi dengan field `slug` yang unik (contoh: `"admin:read"`, `"user:create"`).

Ditambahkan `binaryTargets = ["native", "debian-openssl-3.0.x"]` pada generator karena Codespace menggunakan OpenSSL versi 3.0.x yang berbeda dari default Prisma.

**Output:** Migrasi `20260429021957_init_rbac` berhasil diaplikasikan. Tabel `User`, `Role`, `Permission`, dan tabel pivot `_PermissionToRole` terbentuk di database `rbac_db`. Prisma Client v6.19.3 berhasil digenerate.

---

### Langkah 4 — Seeding Database

**Tujuan:** Mengisi database dengan data awal Role dan Permission menggunakan Upsert Pattern agar skrip aman dijalankan berulang kali tanpa menyebabkan duplikasi data.

File `prisma/seed.ts` dibuat dengan alur:
1. Membuat 5 permission: `user:create`, `user:read`, `user:update`, `user:delete`, `admin:read`.
2. Membuat role `ADMIN` dan menghubungkan semua permission kepadanya.
3. Membuat role `USER` dan hanya menghubungkan permission `user:read`.

**Output:** Seeding berhasil dijalankan dengan `bun prisma/seed.ts`. Database terisi dengan data:

| id | name |
|---|---|
| ffd6aa43-83ae-4807-9348-3bb754777437 | ADMIN |
| 3f5e37fd-34a9-44c5-b351-bd7facd0ed34 | USER |

---

### Langkah 5 — Infrastructure Layer: Prisma Singleton, JWT, dan Bcrypt

**Tujuan:** Mengimplementasikan detail teknis (database dan keamanan) di lapisan infrastruktur agar lapisan Core tidak bergantung langsung pada library eksternal.

Dibuat tiga file:

- `src/infrastructure/database/prisma.ts` — Singleton Pattern untuk Prisma Client, mencegah kebocoran koneksi database saat hot-reload di environment development.
- `src/infrastructure/security/jwt.service.ts` — mengekspos fungsi `sign()` untuk membuat token dan `verify()` untuk memvalidasi token JWT.
- `src/infrastructure/security/bcrypt.service.ts` — mengekspos fungsi `hash()` untuk mengenkripsi password dan `compare()` untuk memverifikasinya.

**Output:** Ketiga file berhasil dibuat. Lapisan ini bersifat independen dan dapat diganti implementasinya tanpa mempengaruhi lapisan Core.

---

### Langkah 6 — Core Layer: Entities dan Use Cases

**Tujuan:** Membangun jantung aplikasi yang berisi logika bisnis murni, independen dari framework dan database.

Dibuat tiga file:

- `src/core/entities/user.entity.ts` — mendefinisikan interface `UserEntity` dan `UserPayload` sebagai kontrak tipe data.
- `src/core/use-cases/auth/register.use-case.ts` — logika registrasi: cek email duplikat, hash password, lalu simpan user baru ke database.
- `src/core/use-cases/auth/login.use-case.ts` — logika login: cari user berdasarkan email, verifikasi password dengan Bcrypt, buat dan kembalikan JWT token.

**Output:** Use case berhasil dibuat dengan prinsip Single Responsibility — satu file untuk satu alur kerja spesifik.

---

### Langkah 7 — Interfaces Layer: Middlewares dan Controllers

**Tujuan:** Membangun lapisan adaptor yang menghubungkan request HTTP dari pengguna ke use case yang sesuai, serta mengamankan akses dengan middleware autentikasi dan otorisasi.

Dibuat tiga file:

- `src/interfaces/middlewares/auth.middleware.ts` — memvalidasi JWT token dari header `Authorization: Bearer <token>`. Jika valid, payload token disimpan ke `req.user` dan request dilanjutkan. Jika tidak, mengembalikan response 401.
- `src/interfaces/middlewares/rbac.middleware.ts` — fungsi `checkPermission(slug)` yang mengecek apakah role user memiliki permission yang diperlukan dari database secara real-time. Jika tidak, mengembalikan response 403.
- `src/interfaces/controllers/auth.controller.ts` — menerima request dari route, memanggil use case yang sesuai, dan mengembalikan response yang tepat.

**Output:** Middleware dan controller berhasil dibuat. RBAC diimplementasikan berbasis slug permission dari database, bukan sekadar nama role.

---

### Langkah 8 — Routes dan app.ts

**Tujuan:** Mendefinisikan semua endpoint API dan merakit aplikasi Express dengan seluruh middleware keamanan.

Dibuat tiga file:

- `src/interfaces/routes/auth.routes.ts` — mendefinisikan dua endpoint: `POST /api/auth/register` dan `POST /api/auth/login`.
- `src/interfaces/routes/user.routes.ts` — mendefinisikan dua endpoint: `GET /api/test` (butuh auth) dan `GET /api/admin` (butuh auth + permission `admin:read`).
- `src/app.ts` — merakit Express app dengan Helmet (keamanan HTTP header), JSON parser, health check endpoint `/health`, dan semua route.

**Output:** Seluruh file berhasil dibuat dan server siap dijalankan.

---

### Langkah 9 — Testing dan Verifikasi

**Tujuan:** Memastikan seluruh endpoint berfungsi sesuai spesifikasi RBAC.

Pengujian dilakukan menggunakan `curl` dari terminal Codespace setelah server dijalankan dengan `bun run dev`.

**Health Check:**
- `GET /health` → `{"status":"ok"}` ✅

**Register:**
- `POST /api/auth/register` (ADMIN) → user terbuat dengan password ter-hash Bcrypt `$2b$10$...` ✅
- `POST /api/auth/register` (USER) → user terbuat dengan roleId USER ✅

**Login:**
- `POST /api/auth/login` (ADMIN) → JWT token digenerate ✅
- `POST /api/auth/login` (USER) → JWT token digenerate ✅

**RBAC Verification:**

| Endpoint | Token | Response |
|---|---|---|
| `GET /api/test` | ADMIN | `{"message":"Auth success","user":{"id":"...","role":"ADMIN",...}}` ✅ |
| `GET /api/admin` | ADMIN | `{"message":"Welcome Admin"}` ✅ |
| `GET /api/admin` | USER | `{"message":"No access"}` ✅ |

---

## Kesimpulan

Implementasi RBAC API Service dengan Bun.js menggunakan Clean Architecture berhasil diselesaikan dengan seluruh fitur berfungsi sesuai spesifikasi. Clean Architecture terbukti memisahkan tanggung jawab kode dengan jelas — lapisan Core tidak mengetahui detail Express atau Prisma, lapisan Infrastructure dapat diganti tanpa mempengaruhi logika bisnis, dan lapisan Interfaces bertindak sebagai jembatan antara pengguna dan sistem. Sistem RBAC berbasis permission slug memberikan fleksibilitas tinggi karena pengecekan akses dilakukan secara real-time dari database, bukan hanya berdasarkan nama role semata.
