# Panduan Menghubungkan Template SIPAS-Malang ke Google Sheets, Looker Studio, dan Web App

Paket template di folder `templates/` disusun agar **satu basis data Google Sheets** dapat menggerakkan **Looker Studio** (sesuai rancangan teknologi Buku I & tab `BACA INI`) sekaligus **Web App SIPAS-Malang**.

---

## 1. Isi Paket Template

- `SIPAS-Malang_Database_2024.xlsx` — Workbook lengkap berisi **8 sheet terstandar**:
  1. `timbulan_kecamatan`
  2. `neraca_sampah`
  3. `inventaris_fasilitas`
  4. `profil_tpa_supit_urang`
  5. `inventaris_variabel_data`
  6. `kesiapan_lima_pilar`
  7. `matriks_pilar_kecamatan`
  8. `kpi_ringkasan`
- `csv/` — Versi CSV individual (UTF-8 BOM) untuk impor cepat per tabel.

---

## 2. Langkah Impor ke Google Sheets

1. Buka [Google Drive](https://drive.google.com) dan unggah file `SIPAS-Malang_Database_2024.xlsx`.
2. Klik dua kali file tersebut lalu pilih **Buka dengan Google Spreadsheet (Google Sheets)**.
3. Pilih **File → Simpan sebagai Google Spreadsheet** agar menjadi format native Google Sheets (memudahkan integrasi Looker Studio).
4. **Aturan Validasi Wajib saat Mengisi / Memperbarui Data:**
   - **NA ≠ 0:** Data yang belum tersedia di sumber publik (seperti sampah masuk TPA per kecamatan dari WIS atau perilaku pemilahan masyarakat) **wajib ditulis `NA`** atau dibiarkan kosong — **jangan pernah diisi `0`**.
   - **Konsistensi Tahun & Satuan:** Pastikan `tahun` seragam dan `timbulan_ton_hari × 365 ≈ timbulan_ton_tahun`.
   - **Cakupan Wilayah:** Pisahkan data tingkat kecamatan (`Blimbing`, `Kedungkandang`, `Klojen`, `Lowokwaru`, `Sukun`) dari data tingkat `Kota Malang` (Neraca 2024 & 148 fasilitas pengolahan).

---

## 3. Menyambungkan ke Looker Studio (5 Menu Dashboard)

1. Buka [Looker Studio](https://lookerstudio.google.com) → klik **Buat (Create) → Laporan (Report)**.
2. Pada panel *Tambahkan data ke laporan*, pilih konektor **Google Sheets** dan pilih file Google Sheets SIPAS-Malang.
3. Tambahkan sheet berikut sebagai sumber data terpisah di Looker Studio:
   - `timbulan_kecamatan`
   - `neraca_sampah`
   - `inventaris_fasilitas`
   - `inventaris_variabel_data`
   - `kesiapan_lima_pilar`
4. Susun 5 halaman sesuai struktur `BACA INI`:
   - **Halaman 1 — Dashboard Utama:** Kartu skor `731,29 ton/hari`, `28,32%` pengurangan, `99,02%` terkelola, serta ringkasan grafik batang timbulan. Tambahkan catatan teks: *"Estimasi Tahunan DLH 2024 · Bukan Monitoring Real-Time"*.
   - **Halaman 2 — Perbandingan Kecamatan:** Grafik kolom vertikal `timbulan_ton_hari` per `kecamatan` + tabel `penduduk_jiwa`, `timbulan_ton_hari`, `timbulan_ton_tahun`, `kontribusi_persen`.
   - **Halaman 3 — Neraca Pengelolaan Sampah:** Grafik donut/batang dari `neraca_sampah` menyoroti beban `Pemrosesan akhir` (`179.078,12 ton/tahun`).
   - **Halaman 4 — Informasi TPA Supit Urang & Fasilitas:** Tabel `profil_tpa_supit_urang` dan grafik batang `inventaris_fasilitas` (total `148 unit`, cakupan kota).
   - **Halaman 5 — Ketersediaan & Kualitas Data:** Tabel `inventaris_variabel_data` (soroti status `A`, `P`, `NA`) dan tabel `kesiapan_lima_pilar`.

---

## 4. Sinkronisasi Langsung Google Sheets → Web App SIPAS-Malang

1. Di Google Sheets, klik **File → Bagikan (Share) → Publikasikan ke web (Publish to web)**.
2. Pilih tab **`timbulan_kecamatan`** (atau **`neraca_sampah`**) dan ubah format menjadi **Comma-separated values (.csv)**.
3. Klik **Publikasikan** lalu salin tautan CSV yang muncul.
4. Buka Web App SIPAS-Malang → masuk ke menu **Ketersediaan & Validasi Data** → pilih tab **Sinkron Google Sheets (CSV)** → tempel tautan dan klik **Tarik & Validasi Data**.
5. Web App akan menjalankan pemeriksaan 6 aturan validasi secara otomatis dan memperbarui seluruh grafik serta KPI.
