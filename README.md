# Serpihan Kata ✨

Aplikasi Next.js dengan Socket.IO dan Prisma yang terhubung ke MySQL, serta sistem notifikasi real-time menggunakan Redis (lokal atau Upstash), dengan dukungan backend tambahan dari NestJS.

---

## 📦 Langkah Instalasi

### 1. Clone Repo

```bash
git clone https://github.com/username/serpihan-kata.git
cd serpihan-kata
```

### 2. Install Dependency

```bash
npm install
```

### 3. Siapkan MySQL

- Buka **XAMPP** dan jalankan MySQL
- Buat database baru dengan nama: `serpihan_kata`

### 4. Setup Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

> `migrate dev` akan membuat tabel berdasarkan `schema.prisma` dan otomatis menjalankan Prisma Client.

---

## 🔐 Sertifikat HTTPS Lokal

Aplikasi ini berjalan di HTTPS lokal. Untuk itu, kamu perlu membuat sertifikat SSL lokal menggunakan [mkcert](https://github.com/FiloSottile/mkcert).

### Cara Generate Sertifikat Lokal:

1. Install `mkcert` (cek dokumentasi untuk sistem operasi kamu)
2. Jalankan perintah berikut:

```bash
mkcert -install
mkcert -key-file certificates/key.pem -cert-file certificates/cert.pem localhost
```

> Folder `certificates` akan berisi `cert.pem` dan `key.pem`. Pastikan sesuai dengan path di script `npm run https-local`.

**Catatan:**  
Tidak disarankan mengupload file sertifikat (`.pem`) ke GitHub, karena walaupun lokal, ini tetap sensitif. Tambahkan ke `.gitignore`.

---

## 🚀 Menjalankan Aplikasi

### Jalankan Frontend + Socket.IO:

```bash
npm run https-local
```

Buka terminal baru:

```bash
npm run socket
```

---

## 🔔 Sistem Notifikasi (Redis + NestJS)

Untuk fitur notifikasi real-time, kamu membutuhkan backend tambahan yang terhubung ke Redis:

📦 **Repository Backend (NestJS)**  
https://github.com/muhammadedowardaya/serpihan-kata-backend

Backend ini:

- Dibangun dengan **NestJS**
- Menggunakan **Redis** untuk sistem pub/sub notifikasi
- Terhubung via WebSocket dengan frontend ini

### Cara Menjalankan Redis

Kamu bisa menggunakan Redis secara **lokal** tanpa Upstash. Cukup install Redis dan jalankan:

```bash
redis-server
```

### Lalu, kenapa ada Upstash?

Upstash adalah Redis-as-a-Service (gratis hingga batas tertentu). Cocok jika kamu ingin deploy backend secara online, tanpa install Redis server sendiri. Tapi untuk lokal, **cukup pakai `redis-server` biasa**.

---

## 🧠 Catatan Tambahan

- Semua API utama saat ini masih berada di frontend (Next.js).  
  Namun, **akan lebih ideal** jika kamu memindahkan semua logic API ke backend NestJS agar lebih terstruktur dan scalable.
- Kamu tidak perlu mengatur `.env` untuk `DATABASE_URL` jika mengikuti instruksi: menggunakan XAMPP dan membuat DB `serpihan_kata`.

---

## 🧑‍💻 Kontribusi

Pull request, issue, dan ide sangat diterima. Silakan fork dan modifikasi proyek ini sesuai kebutuhan kamu.

---

MIT © 2025 – [Nama Kamu]
