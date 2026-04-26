# 🧭 ExploreBuddy

> **Teman perjalananmu untuk menemukan destinasi wisata terbaik di Indonesia.**

ExploreBuddy adalah chatbot berbasis AI yang membantu wisatawan menemukan rekomendasi tempat wisata, kuliner, itinerary, dan tips perjalanan di seluruh Indonesia — didukung oleh **Google Gemini 2.5 Flash** dan dibangun dengan **Node.js + Express**.

---

## ✨ Fitur Utama

- 🤖 **AI Chatbot** — Rekomendasi wisata cerdas menggunakan Google Gemini 2.5 Flash
- 🗺️ **Destinasi Populer** — Shortcut ke 8 kota wisata populer Indonesia (Bali, Jogja, Lombok, dll)
- 💬 **Session Management** — Riwayat percakapan tersimpan otomatis di localStorage, bisa dimuat ulang
- 🎒 **Packing Checklist** — Checklist perjalanan interaktif yang tersimpan di browser
- 🟢 **API Status Indicator** — Indikator real-time koneksi ke Gemini API
- 📱 **Responsive Design** — Tampilan optimal di desktop maupun mobile
- 🎨 **Teal UI Theme** — Antarmuka modern bergaya travel dengan tema warna teal

---

## 📁 Struktur Project

```
explorebuddy/
├── index.js          # Server Express + route /api/chat
├── package.json      # Dependencies
├── .env              # API key (tidak di-commit)
├── .gitignore
└── Public/
    ├── index.html    # Struktur UI utama
    ├── style.css     # Tema teal, layout sidebar + main
    └── script.js     # Logic chat, session, checklist, formatter
```

## 🚀 Cara Menjalankan

### 1. Clone repository

```bash
git clone https://github.com/username/explorebuddy.git
cd explorebuddy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat file `.env`

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Dapatkan API key gratis di [Google AI Studio](https://aistudio.google.com/app/apikey)

### 4. Jalankan server

```bash
node index.js
```

### 5. Buka di browser

```
http://localhost:3000
```

---

## 🔑 Environment Variables

| Variable | Keterangan |
|----------|------------|
| `GEMINI_API_KEY` | API key Google Gemini (wajib) |

---

## 💡 Cara Penggunaan

1. **Tanya langsung** — Ketik pertanyaan seperti *"Rekomendasikan wisata di Bali"*
2. **Klik destinasi populer** — Gunakan shortcut kota di sidebar kiri
3. **Lihat riwayat** — Klik judul percakapan lama di sidebar untuk memuatnya kembali
4. **Centang packing list** — Tandai barang bawaan sebelum berangkat
5. **Chat baru** — Klik tombol "Chat Baru" untuk memulai percakapan fresh

---

## 📸 Tampilan
