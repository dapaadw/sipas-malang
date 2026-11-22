import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const templatesDir = path.join(rootDir, 'templates');
const csvDir = path.join(templatesDir, 'csv');

fs.mkdirSync(csvDir, { recursive: true });

const timbulanKecamatan = [
  {
    tahun: 2024,
    kecamatan: 'Blimbing',
    penduduk_jiwa: 182851,
    timbulan_ton_hari: 153.04,
    timbulan_ton_tahun: 55859.17,
    kontribusi_persen: 20.93,
    per_kapita_kg_hari: 0.84,
    cakupan: 'Kecamatan',
    sumber: 'DLH Kota Malang, Data Timbulan Sampah Tahun 2024',
    status_data: 'A',
    catatan: 'Estimasi timbulan tahunan resmi DLH',
  },
  {
    tahun: 2024,
    kecamatan: 'Kedungkandang',
    penduduk_jiwa: 209375,
    timbulan_ton_hari: 164.01,
    timbulan_ton_tahun: 59862.31,
    kontribusi_persen: 22.43,
    per_kapita_kg_hari: 0.78,
    cakupan: 'Kecamatan',
    sumber: 'DLH Kota Malang, Data Timbulan Sampah Tahun 2024',
    status_data: 'A',
    catatan: 'Kontribusi timbulan tertinggi di Kota Malang',
  },
  {
    tahun: 2024,
    kecamatan: 'Klojen',
    penduduk_jiwa: 93990,
    timbulan_ton_hari: 116.39,
    timbulan_ton_tahun: 42481.05,
    kontribusi_persen: 15.92,
    per_kapita_kg_hari: 1.24,
    cakupan: 'Kecamatan',
    sumber: 'DLH Kota Malang, Data Timbulan Sampah Tahun 2024',
    status_data: 'A',
    catatan: 'Total terendah, tetapi estimasi per kapita tertinggi',
  },
  {
    tahun: 2024,
    kecamatan: 'Lowokwaru',
    penduduk_jiwa: 164106,
    timbulan_ton_hari: 144.15,
    timbulan_ton_tahun: 52614.75,
    kontribusi_persen: 19.71,
    per_kapita_kg_hari: 0.88,
    cakupan: 'Kecamatan',
    sumber: 'DLH Kota Malang, Data Timbulan Sampah Tahun 2024',
    status_data: 'A',
    catatan: 'Estimasi timbulan tahunan resmi DLH',
  },
  {
    tahun: 2024,
    kecamatan: 'Sukun',
    penduduk_jiwa: 196860,
    timbulan_ton_hari: 153.71,
    timbulan_ton_tahun: 56102.57,
    kontribusi_persen: 21.02,
    per_kapita_kg_hari: 0.78,
    cakupan: 'Kecamatan',
    sumber: 'DLH Kota Malang, Data Timbulan Sampah Tahun 2024',
    status_data: 'A',
    catatan: 'Lokasi TPA Supit Urang (Mulyorejo), melayani seluruh kota',
  },
];

const neracaSampah = [
  {
    tahun: 2024,
    komponen: 'Timbulan sampah',
    parent_komponen: '-',
    volume_ton_tahun: 266920.85,
    persentase_timbulan: 100.0,
    cakupan: 'Kota Malang',
    sumber: 'DLH Kota Malang, Laporan Neraca Pengelolaan Sampah Tahun 2024',
  },
  {
    tahun: 2024,
    komponen: 'Pengurangan sampah',
    parent_komponen: 'Total dikelola',
    volume_ton_tahun: 75591.5,
    persentase_timbulan: 28.32,
    cakupan: 'Kota Malang',
    sumber: 'DLH Kota Malang, Laporan Neraca Pengelolaan Sampah Tahun 2024',
  },
  {
    tahun: 2024,
    komponen: 'Penanganan sampah',
    parent_komponen: 'Total dikelola',
    volume_ton_tahun: 188723.24,
    persentase_timbulan: 70.7,
    cakupan: 'Kota Malang',
    sumber: 'DLH Kota Malang, Laporan Neraca Pengelolaan Sampah Tahun 2024',
  },
  {
    tahun: 2024,
    komponen: 'Pengolahan menjadi bahan baku',
    parent_komponen: 'Penanganan sampah',
    volume_ton_tahun: 9645.12,
    persentase_timbulan: 3.61,
    cakupan: 'Kota Malang',
    sumber: 'DLH Kota Malang, Laporan Neraca Pengelolaan Sampah Tahun 2024',
  },
  {
    tahun: 2024,
    komponen: 'Pemrosesan akhir',
    parent_komponen: 'Penanganan sampah',
    volume_ton_tahun: 179078.12,
    persentase_timbulan: 67.09,
    cakupan: 'Kota Malang',
    sumber: 'DLH Kota Malang, Laporan Neraca Pengelolaan Sampah Tahun 2024',
  },
  {
    tahun: 2024,
    komponen: 'Total sampah dikelola',
    parent_komponen: 'Ringkasan Neraca',
    volume_ton_tahun: 264314.74,
    persentase_timbulan: 99.02,
    cakupan: 'Kota Malang',
    sumber: 'DLH Kota Malang, Laporan Neraca Pengelolaan Sampah Tahun 2024',
  },
];

const inventarisFasilitas = [
  {
    no: 1,
    tahun: 2024,
    jenis_fasilitas: 'Komposting skala kecil RT/RW',
    jumlah_unit: 25,
    cakupan: 'Kota Malang',
    sumber: 'DLH Kota Malang, Neraca Pengelolaan Sampah Tahun 2024',
    catatan: 'Inventaris tingkat kota, bukan per kecamatan',
  },
  {
    no: 2,
    tahun: 2024,
    jenis_fasilitas: 'Bank Sampah Induk',
    jumlah_unit: 1,
    cakupan: 'Kota Malang',
    sumber: 'DLH Kota Malang, Neraca Pengelolaan Sampah Tahun 2024',
    catatan: 'Inventaris tingkat kota, bukan per kecamatan',
  },
  {
    no: 3,
    tahun: 2024,
    jenis_fasilitas: 'TPS3R dikelola lembaga masyarakat',
    jumlah_unit: 5,
    cakupan: 'Kota Malang',
    sumber: 'DLH Kota Malang, Neraca Pengelolaan Sampah Tahun 2024',
    catatan: 'Inventaris tingkat kota, bukan per kecamatan',
  },
  {
    no: 4,
    tahun: 2024,
    jenis_fasilitas: 'Pusat Olah Organik (POO)',
    jumlah_unit: 58,
    cakupan: 'Kota Malang',
    sumber: 'DLH Kota Malang, Neraca Pengelolaan Sampah Tahun 2024',
    catatan: 'Inventaris tingkat kota, bukan per kecamatan',
  },
  {
    no: 5,
    tahun: 2024,
    jenis_fasilitas: 'Pengepul / Lapak',
    jumlah_unit: 59,
    cakupan: 'Kota Malang',
    sumber: 'DLH Kota Malang, Neraca Pengelolaan Sampah Tahun 2024',
    catatan: 'Inventaris tingkat kota, bukan per kecamatan',
  },
];

const profilTpaSupitUrang = [
  { atribut: 'Nama Fasilitas', nilai: 'Tempat Pemrosesan Akhir (TPA) Supit Urang' },
  { atribut: 'Alamat', nilai: 'Jalan Rawisari, Kelurahan Mulyorejo, Kecamatan Sukun, Kota Malang' },
  { atribut: 'Koordinat', nilai: '-7.9837, 112.5781' },
  { atribut: 'Cakupan Layanan', nilai: 'Seluruh wilayah Kota Malang (5 kecamatan)' },
  { atribut: 'Sistem Pencatatan', nilai: 'Jembatan timbang terhubung dengan Waste Information System (WIS)' },
  { atribut: 'Status Integrasi WIS per Kecamatan', nilai: 'NA' },
  { atribut: 'Peran SIPAS-Malang', nilai: 'Dashboard analitis berbasis data terbuka, bukan pengganti WIS' },
];

const inventarisVariabelData = [
  {
    no: 1,
    variabel: 'Timbulan sampah',
    indikator: 'Ton/hari dan ton/tahun',
    sumber: 'DLH 2024',
    cakupan: '5 Kecamatan & Kota',
    status: 'A',
    catatan: 'Tersedia lengkap',
  },
  {
    no: 2,
    variabel: 'Kependudukan',
    indikator: 'Jumlah penduduk (jiwa)',
    sumber: 'DLH 2024 dan BPS 2025',
    cakupan: '5 Kecamatan & Kota',
    status: 'A',
    catatan: 'Tersedia lengkap',
  },
  {
    no: 3,
    variabel: 'Pengurangan sampah',
    indikator: 'Ton/tahun dan persentase',
    sumber: 'Neraca DLH 2024',
    cakupan: 'Kota Malang',
    status: 'A',
    catatan: 'Tersedia (75.591,50 t / 28,32%)',
  },
  {
    no: 4,
    variabel: 'Penanganan sampah',
    indikator: 'Ton/tahun dan persentase',
    sumber: 'Neraca DLH 2024',
    cakupan: 'Kota Malang',
    status: 'A',
    catatan: 'Tersedia (188.723,24 t / 70,70%)',
  },
  {
    no: 5,
    variabel: 'Fasilitas pengolahan',
    indikator: 'Jumlah fasilitas kota',
    sumber: 'Neraca DLH 2024',
    cakupan: 'Kota Malang (148 unit)',
    status: 'A',
    catatan: 'Belum terpecah per kecamatan',
  },
  {
    no: 6,
    variabel: 'Kondisi fasilitas setiap kecamatan',
    indikator: 'Kapasitas dan kondisi operasional',
    sumber: 'Dokumen fasilitas',
    cakupan: 'Sebagian / Tingkat Kota',
    status: 'P',
    catatan: 'Parsial',
  },
  {
    no: 7,
    variabel: 'Data sampah masuk TPA per asal kecamatan',
    indikator: 'Ton/hari berdasarkan asal',
    sumber: 'Data operasional WIS',
    cakupan: 'Tidak tersedia secara terbuka',
    status: 'NA',
    catatan: 'Ditandai NA (bukan 0)',
  },
  {
    no: 8,
    variabel: 'Perilaku pemilahan masyarakat',
    indikator: '% rumah tangga memilah per kecamatan',
    sumber: 'Survei atau data administratif',
    cakupan: 'Tidak tersedia',
    status: 'NA',
    catatan: 'Ditandai NA (bukan 0)',
  },
  {
    no: 9,
    variabel: 'Kualitas lingkungan sekitar TPA',
    indikator: 'Pengukuran air, udara, tanah',
    sumber: 'Laporan uji lingkungan',
    cakupan: 'Sekitar TPA / Tingkat Kota',
    status: 'P',
    catatan: 'Parsial',
  },
];

const kesiapanLimaPilar = [
  {
    pilar: 'Nature',
    indikator_utama: 'Timbulan dan kondisi lingkungan',
    ketersediaan_data: 'P',
    permasalahan_kebutuhan: 'Tekanan timbulan dan risiko lingkungan',
    arah_solusi: 'Pemantauan indikator lingkungan dan timbulan sampah',
  },
  {
    pilar: 'Structure',
    indikator_utama: 'SDM, anggaran, kelembagaan',
    ketersediaan_data: 'P',
    permasalahan_kebutuhan: 'Koordinasi pengelolaan dan pelaporan',
    arah_solusi: 'Pembagian peran serta standardisasi pelaporan',
  },
  {
    pilar: 'Infrastructure',
    indikator_utama: 'TPS3R, fasilitas, pengolahan, WIS',
    ketersediaan_data: 'P',
    permasalahan_kebutuhan: 'Data fasilitas dan sistem digital tersebar',
    arah_solusi: 'Dashboard dan integrasi informasi',
  },
  {
    pilar: 'Superstructure',
    indikator_utama: 'Regulasi dan kebijakan',
    ketersediaan_data: 'A',
    permasalahan_kebutuhan: 'Kebutuhan standar pengelolaan data',
    arah_solusi: 'SOP pencatatan, validasi, dan pelaporan',
  },
  {
    pilar: 'Culture',
    indikator_utama: 'Pemilahan dan partisipasi masyarakat',
    ketersediaan_data: 'P',
    permasalahan_kebutuhan: 'Pemilahan dan partisipasi masyarakat',
    arah_solusi: 'Edukasi serta penyajian informasi pengurangan sampah',
  },
];

const matriksPilarKecamatan = [
  { pilar: 'Nature', Blimbing: 'P', Kedungkandang: 'P', Klojen: 'P', Lowokwaru: 'P', Sukun: 'P' },
  { pilar: 'Structure', Blimbing: 'NA', Kedungkandang: 'NA', Klojen: 'NA', Lowokwaru: 'NA', Sukun: 'P' },
  { pilar: 'Infrastructure', Blimbing: 'NA', Kedungkandang: 'NA', Klojen: 'NA', Lowokwaru: 'NA', Sukun: 'P' },
  { pilar: 'Superstructure', Blimbing: 'P', Kedungkandang: 'P', Klojen: 'P', Lowokwaru: 'P', Sukun: 'P' },
  { pilar: 'Culture', Blimbing: 'NA', Kedungkandang: 'NA', Klojen: 'NA', Lowokwaru: 'NA', Sukun: 'P' },
];

const kpiRingkasan = [
  { kpi: 'Timbulan sampah harian (Total Kota Resmi)', nilai: 731.29, satuan: 'ton/hari', catatan: 'Selisih pembulatan +0,01 terhadap jumlah 5 kecamatan (731,30)' },
  { kpi: 'Timbulan sampah tahunan (Total Kota Resmi)', nilai: 266920.85, satuan: 'ton/tahun', catatan: 'Selisih pembulatan -1,00 terhadap jumlah 5 kecamatan (266.919,85)' },
  { kpi: 'Tingkat pengurangan sampah', nilai: 28.32, satuan: '%', catatan: '75.591,50 / 266.920,85 × 100%' },
  { kpi: 'Tingkat penanganan sampah', nilai: 70.7, satuan: '%', catatan: '188.723,24 / 266.920,85 × 100%' },
  { kpi: 'Tingkat sampah terkelola', nilai: 99.02, satuan: '%', catatan: '264.314,74 / 266.920,85 × 100%' },
  { kpi: 'Jumlah fasilitas pengolahan kota', nilai: 148, satuan: 'unit', catatan: 'Inventaris tingkat kota (bukan per kecamatan)' },
  { kpi: 'Sampah masuk TPA per kecamatan (WIS)', nilai: 'NA', satuan: 'ton/hari', catatan: 'Belum tersedia secara terbuka (wajib ditulis NA)' },
];

function addSheet(wb, name, rows, colWidths) {
  const ws = XLSX.utils.json_to_sheet(rows);
  if (colWidths) {
    ws['!cols'] = colWidths.map((wch) => ({ wch }));
  }
  XLSX.utils.book_append_sheet(wb, ws, name);
}

const wb = XLSX.utils.book_new();
addSheet(wb, 'timbulan_kecamatan', timbulanKecamatan, [8, 16, 15, 18, 20, 18, 18, 12, 42, 12, 48]);
addSheet(wb, 'neraca_sampah', neracaSampah, [8, 30, 20, 18, 20, 14, 54]);
addSheet(wb, 'inventaris_fasilitas', inventarisFasilitas, [6, 8, 36, 14, 14, 48, 42]);
addSheet(wb, 'profil_tpa_supit_urang', profilTpaSupitUrang, [34, 72]);
addSheet(wb, 'inventaris_variabel_data', inventarisVariabelData, [6, 36, 40, 32, 26, 10, 32]);
addSheet(wb, 'kesiapan_lima_pilar', kesiapanLimaPilar, [16, 34, 18, 38, 44]);
addSheet(wb, 'matriks_pilar_kecamatan', matriksPilarKecamatan, [18, 12, 16, 12, 14, 12]);
addSheet(wb, 'kpi_ringkasan', kpiRingkasan, [40, 14, 14, 62]);

const xlsxPath = path.join(templatesDir, 'SIPAS-Malang_Database_2024.xlsx');
XLSX.writeFile(wb, xlsxPath);
console.log('Generated:', xlsxPath);

function writeUtf8BomCsv(filename, rows) {
  const headers = Object.keys(rows[0]);
  const escapeCell = (val) => {
    if (val === null || val === undefined) return 'NA';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map((r) => headers.map((h) => escapeCell(r[h])).join(',')),
  ];
  const outPath = path.join(csvDir, filename);
  fs.writeFileSync(outPath, '\uFEFF' + lines.join('\r\n'), 'utf8');
  console.log('Generated:', outPath);
}

writeUtf8BomCsv('timbulan_kecamatan.csv', timbulanKecamatan);
writeUtf8BomCsv('neraca_sampah.csv', neracaSampah);
writeUtf8BomCsv('inventaris_fasilitas.csv', inventarisFasilitas);
writeUtf8BomCsv('inventaris_variabel_data.csv', inventarisVariabelData);
writeUtf8BomCsv('kesiapan_lima_pilar.csv', kesiapanLimaPilar);
