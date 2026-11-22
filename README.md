# SIPAS-Malang — Sistem Informasi Pemantauan Sampah Kota Malang

Aplikasi web analitis berbasis data terbuka untuk mendukung **Smart Environment Kota Malang** (*Project Akhir Mata Kuliah Teknologi Smart City, Fakultas Ilmu Komputer, Universitas Brawijaya*).

---

## Fitur & Menu Aplikasi

1. **Dashboard Utama (`/`):** 4 kartu KPI utama DLH 2024 (`731,29 ton/hari`, `28,32%` pengurangan, `70,70%` penanganan, `99,02%` terkelola), peta interaktif Kota Malang (5 kecamatan + pin TPA Supit Urang), grafik perbandingan timbulan, komposisi neraca, dan alur kerja sistem.
2. **Perbandingan Kecamatan (`/kecamatan`):** Grafik batang interaktif dengan pengalih metrik (*Ton/hari*, *Ton/tahun*, *Kontribusi %*, *Per Kapita*), tabel sortir, catatan pembulatan DLH, dan penegasan bahwa angka merupakan estimasi tahunan (bukan tonase aktual TPA).
3. **Neraca Sampah (`/neraca`):** Grafik donat & batang horizontal neraca DLH 2024 (menyoroti beban pemrosesan akhir `179.078,12 ton/tahun`), tabel neraca resmi, dan 7 KPI beserta rumusnya.
4. **TPA Supit Urang & Fasilitas (`/tpa`):** Profil TPA Supit Urang (Mulyorejo, Sukun — melayani seluruh Kota Malang), perbandingan peran **WIS vs SIPAS-Malang**, roadmap integrasi WIS (`NA`), inventaris `148` fasilitas tingkat kota, tantangan RPJMD 2025–2029, dan risiko lingkungan.
5. **Ketersediaan & Validasi Data (`/kualitas`):** Alur kerja sistem 5 tahap, pemeriksaan otomatis 6 aturan validasi (tahun, satuan, cakupan, sumber, **`NA ≠ 0`**, rekonsiliasi), sinkronisasi Google Sheets CSV, unggah `.xlsx`/`.csv`, editor uji `NA`, inventaris 9 variabel, dan matriks 5 pilar Smart City.
6. **Laporan & Strategi (`/laporan`):** Ekspor `.xlsx`/`.csv`, cetak PDF, ringkasan eksekutif, matriks **SWOT & TOWS**, 4 program prioritas pemerintah, 5 tahapan implementasi, dan daftar pustaka resmi.

---

## Menjalankan Secara Lokal

Prasyarat: **Node.js `24.x`** (sesuai `engines.node` pada `package.json` dan lingkungan build Vercel).

```powershell
npm install
npm run dev
```

Perintah lain yang tersedia:

```powershell
npm test                  # Menjalankan unit test (Vitest)
npm run build             # Typecheck TypeScript + build produksi ke dist/
npm run preview           # Pratinjau hasil build produksi secara lokal
npm run generate:templates # Membuat ulang file .xlsx & .csv di folder templates/
```

---

## Sinkronisasi Google Sheets

- Link CSV Google Sheets publik praisi (default) dikonfigurasi via Environment Variable **`VITE_DEFAULT_SHEET_CSV_URL`** (lihat `.env.example`).
- Di Google Sheets, gunakan **File → Bagikan → Publikasikan ke web → Comma-separated values (.csv)**.
- **Penting:** Kolom yang dibaca sebagai input mentah adalah `penduduk_jiwa`, `timbulan_ton_hari`, `timbulan_ton_tahun`, `tahun`, `sumber`, dan `catatan` (sel kosong atau `NA` otomatis dijaga sebagai `NA`, bukan `0`). Kolom turunan seperti `kontribusi_persen` dan `per_kapita_kg_hari` selalu dihitung ulang oleh sistem sesuai rumus KPI.
- Paket template siap pakai tersedia di folder `templates/` dan panduan lengkapnya di [PANDUAN_GOOGLE_SHEETS_LOOKER_STUDIO.md](templates/PANDUAN_GOOGLE_SHEETS_LOOKER_STUDIO.md).
