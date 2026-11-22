import type * as XLSXTypes from 'xlsx';
import type {
  BalanceSheetRecord,
  ComputedKpis,
  DistrictWasteRecord,
  SipasDataset,
  SyncSummary,
  ValidationReport,
} from '../types/sipas';
import { parseCsv, parseNullableNumber, toCsv } from '../utils/csv';

export const FALLBACK_GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS9z1lY8vzHXbKd1x3fKozYEr2BXFiE6Yo_o4RBM_bCW5NUvPKUnE8HMvFccJz8Ow/pub?output=csv';

const envSheetUrl =
  typeof import.meta !== 'undefined'
    ? ((import.meta as unknown as { env?: Record<string, string | undefined> }).env
        ?.VITE_DEFAULT_SHEET_CSV_URL ?? '')
    : '';

export const DEFAULT_GOOGLE_SHEET_CSV_URL =
  envSheetUrl.trim() || FALLBACK_GOOGLE_SHEET_CSV_URL;

async function loadXlsx(): Promise<typeof XLSXTypes> {
  const mod = await import('xlsx');
  return ((mod as unknown as { default?: typeof XLSXTypes }).default ??
    mod) as typeof XLSXTypes;
}

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function getField(row: Record<string, unknown>, candidates: string[]): unknown {
  const entries = Object.entries(row);
  for (const candidate of candidates) {
    const hit = entries.find(([k]) => normalizeKey(k) === candidate);
    if (hit !== undefined) return hit[1];
  }
  return undefined;
}

function toCellValue(val: number | string | null | undefined): string | number {
  if (val === null || val === undefined) return 'NA';
  return val;
}

export async function buildWorkbookSheets(
  dataset: SipasDataset,
  kpis: ComputedKpis,
  report: ValidationReport
): Promise<XLSXTypes.WorkBook> {
  const XLSX = await loadXlsx();
  const wb = XLSX.utils.book_new();

  // 1. timbulan_kecamatan
  const timbulanRows = dataset.districts.map((d) => ({
    tahun: d.tahun,
    kecamatan: d.nama,
    penduduk_jiwa: toCellValue(d.penduduk),
    timbulan_ton_hari: toCellValue(d.tonHari),
    timbulan_ton_tahun: toCellValue(d.tonTahun),
    cakupan: d.cakupan,
    sumber: d.sumber,
    status_data: d.statusData,
    catatan: d.catatan ?? '',
  }));
  const wsTimbulan = XLSX.utils.json_to_sheet(timbulanRows);
  wsTimbulan['!cols'] = [
    { wch: 8 },
    { wch: 16 },
    { wch: 15 },
    { wch: 18 },
    { wch: 20 },
    { wch: 12 },
    { wch: 42 },
    { wch: 12 },
    { wch: 48 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTimbulan, 'timbulan_kecamatan');

  // 2. neraca_sampah
  const b = dataset.balance;
  const neracaRows = [
    {
      tahun: b.tahun,
      komponen: 'Timbulan sampah',
      parent_komponen: '-',
      volume_ton_tahun: toCellValue(b.timbulanTahun),
      persentase_timbulan: '100%',
      cakupan: b.cakupan,
      sumber: b.sumber,
    },
    {
      tahun: b.tahun,
      komponen: 'Pengurangan sampah',
      parent_komponen: 'Total dikelola',
      volume_ton_tahun: toCellValue(b.penguranganTahun),
      persentase_timbulan:
        kpis.tingkatPenguranganPersen !== null
          ? `${kpis.tingkatPenguranganPersen.toFixed(2)}%`
          : 'NA',
      cakupan: b.cakupan,
      sumber: b.sumber,
    },
    {
      tahun: b.tahun,
      komponen: 'Penanganan sampah',
      parent_komponen: 'Total dikelola',
      volume_ton_tahun: toCellValue(b.penangananTahun),
      persentase_timbulan:
        kpis.tingkatPenangananPersen !== null
          ? `${kpis.tingkatPenangananPersen.toFixed(2)}%`
          : 'NA',
      cakupan: b.cakupan,
      sumber: b.sumber,
    },
    {
      tahun: b.tahun,
      komponen: 'Pengolahan menjadi bahan baku',
      parent_komponen: 'Penanganan sampah',
      volume_ton_tahun: toCellValue(b.pengolahanBahanBakuTahun),
      persentase_timbulan:
        kpis.proporsiPengolahanBahanBakuPersen !== null
          ? `${kpis.proporsiPengolahanBahanBakuPersen.toFixed(2)}%`
          : 'NA',
      cakupan: b.cakupan,
      sumber: b.sumber,
    },
    {
      tahun: b.tahun,
      komponen: 'Pemrosesan akhir',
      parent_komponen: 'Penanganan sampah',
      volume_ton_tahun: toCellValue(b.pemrosesanAkhirTahun),
      persentase_timbulan:
        kpis.proporsiPemrosesanAkhirPersen !== null
          ? `${kpis.proporsiPemrosesanAkhirPersen.toFixed(2)}%`
          : 'NA',
      cakupan: b.cakupan,
      sumber: b.sumber,
    },
    {
      tahun: b.tahun,
      komponen: 'Total sampah dikelola',
      parent_komponen: 'Ringkasan Neraca',
      volume_ton_tahun: toCellValue(b.totalDikelolaTahun),
      persentase_timbulan:
        kpis.tingkatTerkelolaPersen !== null
          ? `${kpis.tingkatTerkelolaPersen.toFixed(2)}%`
          : 'NA',
      cakupan: b.cakupan,
      sumber: b.sumber,
    },
  ];
  const wsNeraca = XLSX.utils.json_to_sheet(neracaRows);
  wsNeraca['!cols'] = [
    { wch: 8 },
    { wch: 30 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 52 },
  ];
  XLSX.utils.book_append_sheet(wb, wsNeraca, 'neraca_sampah');

  // 3. inventaris_fasilitas
  const fasRows = dataset.facilities.map((f, idx) => ({
    no: idx + 1,
    tahun: f.tahun,
    jenis_fasilitas: f.jenisFasilitas,
    jumlah_unit: toCellValue(f.jumlahUnit),
    cakupan: f.cakupan,
    sumber: f.sumber,
    catatan: f.catatan,
  }));
  const wsFas = XLSX.utils.json_to_sheet(fasRows);
  wsFas['!cols'] = [
    { wch: 6 },
    { wch: 8 },
    { wch: 36 },
    { wch: 14 },
    { wch: 14 },
    { wch: 48 },
    { wch: 48 },
  ];
  XLSX.utils.book_append_sheet(wb, wsFas, 'inventaris_fasilitas');

  // 4. profil_tpa_supit_urang
  const tpa = dataset.tpaProfile;
  const tpaRows = [
    { atribut: 'Nama Fasilitas', nilai: tpa.nama },
    { atribut: 'Alamat', nilai: tpa.alamat },
    { atribut: 'Kelurahan / Kecamatan', nilai: `${tpa.kelurahan}, ${tpa.kecamatan}` },
    { atribut: 'Koordinat (Lat, Lng)', nilai: `${tpa.lat}, ${tpa.lng}` },
    { atribut: 'Cakupan Layanan', nilai: tpa.cakupanLayanan },
    { atribut: 'Sistem Pencatatan', nilai: tpa.sistemPencatatan },
    { atribut: 'Status Integrasi WIS per Kecamatan', nilai: tpa.statusIntegrasiWis },
    { atribut: 'Syarat Integrasi WIS', nilai: tpa.syaratIntegrasiWis },
    { atribut: 'Penegasan Kec. Sukun', nilai: tpa.penegasanSukun },
  ];
  const wsTpa = XLSX.utils.json_to_sheet(tpaRows);
  wsTpa['!cols'] = [{ wch: 34 }, { wch: 85 }];
  XLSX.utils.book_append_sheet(wb, wsTpa, 'profil_tpa_supit_urang');

  // 5. inventaris_variabel_data
  const varRows = dataset.variables.map((v) => ({
    no: v.no,
    variabel: v.variabel,
    indikator: v.indikator,
    sumber: v.sumber,
    cakupan: v.cakupan,
    status: v.status,
    catatan: v.catatan,
  }));
  const wsVar = XLSX.utils.json_to_sheet(varRows);
  wsVar['!cols'] = [
    { wch: 5 },
    { wch: 36 },
    { wch: 42 },
    { wch: 34 },
    { wch: 24 },
    { wch: 8 },
    { wch: 52 },
  ];
  XLSX.utils.book_append_sheet(wb, wsVar, 'inventaris_variabel_data');

  // 6. kesiapan_lima_pilar
  const pilarRows = dataset.pillars.map((p) => ({
    pilar: p.pilar,
    indikator_utama: p.indikatorUtama,
    ketersediaan_data: p.ketersediaanData,
    keterangan: p.keterangan,
    permasalahan_kebutuhan: p.permasalahanKebutuhan,
    arah_solusi: p.arahSolusi,
  }));
  const wsPilar = XLSX.utils.json_to_sheet(pilarRows);
  wsPilar['!cols'] = [
    { wch: 16 },
    { wch: 32 },
    { wch: 18 },
    { wch: 56 },
    { wch: 36 },
    { wch: 42 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPilar, 'kesiapan_lima_pilar');

  // 7. matriks_pilar_kecamatan
  const wsMat = XLSX.utils.json_to_sheet(dataset.pillarMatrix);
  wsMat['!cols'] = [
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMat, 'matriks_pilar_kecamatan');

  // 8. kpi_ringkasan
  const kpiRows = [
    {
      kpi: 'Total Timbulan Harian (Kota)',
      nilai: toCellValue(kpis.totalTimbulanHari),
      satuan: 'ton/hari',
      cakupan: 'Kota Malang (Estimasi DLH)',
    },
    {
      kpi: 'Total Timbulan Tahunan (Kota)',
      nilai: toCellValue(kpis.totalTimbulanTahun),
      satuan: 'ton/tahun',
      cakupan: 'Kota Malang (Estimasi DLH)',
    },
    {
      kpi: 'Tingkat Pengurangan Sampah',
      nilai: kpis.tingkatPenguranganPersen !== null ? Number(kpis.tingkatPenguranganPersen.toFixed(2)) : 'NA',
      satuan: '%',
      cakupan: 'Kota Malang',
    },
    {
      kpi: 'Tingkat Penanganan Sampah',
      nilai: kpis.tingkatPenangananPersen !== null ? Number(kpis.tingkatPenangananPersen.toFixed(2)) : 'NA',
      satuan: '%',
      cakupan: 'Kota Malang',
    },
    {
      kpi: 'Tingkat Sampah Terkelola',
      nilai: kpis.tingkatTerkelolaPersen !== null ? Number(kpis.tingkatTerkelolaPersen.toFixed(2)) : 'NA',
      satuan: '%',
      cakupan: 'Kota Malang',
    },
    {
      kpi: 'Total Fasilitas Pengolahan Kota',
      nilai: toCellValue(kpis.totalFasilitas),
      satuan: 'unit',
      cakupan: 'Kota Malang',
    },
    ...kpis.districtKpis.map((dk) => ({
      kpi: `Kontribusi Timbulan ${dk.nama}`,
      nilai: dk.kontribusiPersen !== null ? Number(dk.kontribusiPersen.toFixed(2)) : 'NA',
      satuan: '%',
      cakupan: dk.nama,
    })),
  ];
  const wsKpi = XLSX.utils.json_to_sheet(kpiRows);
  wsKpi['!cols'] = [{ wch: 34 }, { wch: 16 }, { wch: 14 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, wsKpi, 'kpi_ringkasan');

  // 9. hasil_validasi
  const valRows = report.checks.map((c) => ({
    aturan: c.title,
    status: c.status.toUpperCase(),
    ringkasan: c.summary,
    rincian: c.details.join(' | '),
  }));
  const wsVal = XLSX.utils.json_to_sheet(valRows);
  wsVal['!cols'] = [{ wch: 36 }, { wch: 12 }, { wch: 54 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsVal, 'hasil_validasi');

  return wb;
}

export async function downloadWorkbookXlsx(
  dataset: SipasDataset,
  kpis: ComputedKpis,
  report: ValidationReport,
  filename = `SIPAS-Malang_Database_${dataset.metadata.tahunDasar}.xlsx`
): Promise<void> {
  const XLSX = await loadXlsx();
  const wb = await buildWorkbookSheets(dataset, kpis, report);
  XLSX.writeFile(wb, filename);
}

export function downloadCsvFile(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  const csv = '\uFEFF' + toCsv(headers, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function applyTimbulanRows(
  rows: Record<string, unknown>[],
  base: SipasDataset,
  metaOverride: Partial<SipasDataset['metadata']>
): SipasDataset {
  if (!rows.length) {
    throw new Error('Tabel timbulan kosong atau header tidak dikenali.');
  }

  let matchedCount = 0;
  let detectedYear = base.metadata.tahunDasar;

  const updatedDistricts: DistrictWasteRecord[] = base.districts.map((existing) => {
    const match = rows.find((r) => {
      const nameVal = getField(r, ['kecamatan', 'nama', 'nama_kecamatan', 'wilayah']);
      return (
        typeof nameVal === 'string' &&
        nameVal.trim().toLowerCase() === existing.nama.toLowerCase()
      );
    });

    if (!match) return existing;
    matchedCount++;

    const yearRaw = parseNullableNumber(getField(match, ['tahun', 'year']));
    if (yearRaw !== null && Number.isInteger(yearRaw)) {
      detectedYear = yearRaw;
    }

    const penduduk = parseNullableNumber(
      getField(match, ['penduduk_jiwa', 'penduduk', 'jumlah_penduduk'])
    );
    const tonHari = parseNullableNumber(
      getField(match, ['timbulan_ton_hari', 'ton_hari', 'timbulan_harian'])
    );
    const tonTahun = parseNullableNumber(
      getField(match, ['timbulan_ton_tahun', 'ton_tahun', 'timbulan_tahunan'])
    );
    const sumberRaw = getField(match, ['sumber', 'source']);
    const catatanRaw = getField(match, ['catatan', 'notes']);

    const anyNull = penduduk === null || tonHari === null || tonTahun === null;

    return {
      ...existing,
      tahun: yearRaw !== null ? Math.round(yearRaw) : existing.tahun,
      penduduk,
      tonHari,
      tonTahun,
      sumber:
        typeof sumberRaw === 'string' && sumberRaw.trim()
          ? sumberRaw.trim()
          : existing.sumber,
      statusData: anyNull ? 'P' : 'A',
      catatan: typeof catatanRaw === 'string' ? catatanRaw.trim() : existing.catatan,
    };
  });

  if (matchedCount === 0) {
    throw new Error(
      'Tidak ditemukan nama kecamatan Kota Malang (Blimbing, Kedungkandang, Klojen, Lowokwaru, Sukun) pada data yang diimpor.'
    );
  }

  const totalPenduduk = updatedDistricts.every((d) => d.penduduk !== null)
    ? updatedDistricts.reduce((s, d) => s + (d.penduduk ?? 0), 0)
    : null;
  const totalTonHari = updatedDistricts.every((d) => d.tonHari !== null)
    ? Number(updatedDistricts.reduce((s, d) => s + (d.tonHari ?? 0), 0).toFixed(2))
    : null;
  const totalTonTahun = updatedDistricts.every((d) => d.tonTahun !== null)
    ? Number(updatedDistricts.reduce((s, d) => s + (d.tonTahun ?? 0), 0).toFixed(2))
    : null;

  return {
    ...base,
    metadata: {
      ...base.metadata,
      ...metaOverride,
      tahunDasar: detectedYear,
      isOfficialBaseline: false,
      lastUpdated: new Date().toISOString().slice(0, 10),
      officialCityTotals: {
        penduduk: totalPenduduk,
        tonHari: totalTonHari,
        tonTahun: totalTonTahun,
      },
    },
    districts: updatedDistricts,
  };
}

export function applyNeracaRows(
  rows: Record<string, unknown>[],
  base: SipasDataset,
  metaOverride: Partial<SipasDataset['metadata']>
): SipasDataset {
  if (!rows.length) {
    throw new Error('Tabel neraca kosong atau header tidak dikenali.');
  }

  const nextBalance: BalanceSheetRecord = { ...base.balance };
  let matchedCount = 0;

  for (const row of rows) {
    const kompRaw = getField(row, ['komponen', 'component', 'indikator']);
    const volRaw = parseNullableNumber(
      getField(row, ['volume_ton_tahun', 'volume', 'ton_tahun', 'nilai'])
    );
    const tahunRaw = parseNullableNumber(getField(row, ['tahun', 'year']));
    const sumberRaw = getField(row, ['sumber', 'source']);

    if (tahunRaw !== null && Number.isInteger(tahunRaw)) {
      nextBalance.tahun = tahunRaw;
    }
    if (typeof sumberRaw === 'string' && sumberRaw.trim()) {
      nextBalance.sumber = sumberRaw.trim();
    }

    if (typeof kompRaw === 'string') {
      const k = kompRaw.toLowerCase().trim();
      if (k.includes('timbulan')) {
        nextBalance.timbulanTahun = volRaw;
        matchedCount++;
      } else if (k.includes('pengurangan')) {
        nextBalance.penguranganTahun = volRaw;
        matchedCount++;
      } else if (k.includes('penanganan')) {
        nextBalance.penangananTahun = volRaw;
        matchedCount++;
      } else if (k.includes('bahan baku') || k.includes('pengolahan')) {
        nextBalance.pengolahanBahanBakuTahun = volRaw;
        matchedCount++;
      } else if (k.includes('pemrosesan akhir')) {
        nextBalance.pemrosesanAkhirTahun = volRaw;
        matchedCount++;
      } else if (k.includes('dikelola')) {
        nextBalance.totalDikelolaTahun = volRaw;
        matchedCount++;
      }
    }
  }

  if (matchedCount === 0) {
    throw new Error(
      'Tidak ditemukan kolom "komponen" & "volume_ton_tahun" yang sesuai untuk Neraca Sampah.'
    );
  }

  return {
    ...base,
    metadata: {
      ...base.metadata,
      ...metaOverride,
      tahunDasar: nextBalance.tahun,
      isOfficialBaseline: false,
      lastUpdated: new Date().toISOString().slice(0, 10),
    },
    balance: nextBalance,
  };
}

export function appendCacheBuster(rawUrl: string, timestamp = Date.now()): string {
  const parsed = new URL(rawUrl);
  parsed.searchParams.set('_ts', String(timestamp));
  return parsed.toString();
}

export function inspectTimbulanSync(
  rows: Record<string, unknown>[],
  prevDistricts: DistrictWasteRecord[],
  nextDataset: SipasDataset,
  sourceUrl?: string
): SyncSummary {
  let changedSourceFields = 0;
  const derivedColumnNotices: string[] = [];

  nextDataset.districts.forEach((nextD) => {
    const prevD = prevDistricts.find((p) => p.id === nextD.id);
    if (!prevD) return;
    if (prevD.penduduk !== nextD.penduduk) changedSourceFields++;
    if (prevD.tonHari !== nextD.tonHari) changedSourceFields++;
    if (prevD.tonTahun !== nextD.tonTahun) changedSourceFields++;
  });

  const totalTonTahun = nextDataset.metadata.officialCityTotals.tonTahun;

  for (const row of rows) {
    const nameVal = getField(row, ['kecamatan', 'nama', 'nama_kecamatan', 'wilayah']);
    if (typeof nameVal !== 'string') continue;
    const matched = nextDataset.districts.find(
      (d) => d.nama.toLowerCase() === nameVal.trim().toLowerCase()
    );
    if (!matched) continue;

    const sheetContrib = parseNullableNumber(
      getField(row, ['kontribusi_persen', 'kontribusi'])
    );
    if (sheetContrib !== null && matched.tonTahun !== null && totalTonTahun && totalTonTahun > 0) {
      const computedContrib = Number(((matched.tonTahun / totalTonTahun) * 100).toFixed(2));
      if (Math.abs(sheetContrib - computedContrib) >= 0.01) {
        derivedColumnNotices.push(
          `${matched.nama}: kolom "kontribusi_persen" di Sheet (${sheetContrib.toFixed(2).replace('.', ',')}%) berbeda dari rumus otomatis (${computedContrib.toFixed(2).replace('.', ',')}%) karena SIPAS-Malang menghitung ulang persentase langsung dari "timbulan_ton_tahun".`
        );
      }
    }

    const sheetPerCapita = parseNullableNumber(
      getField(row, ['per_kapita_kg_hari', 'per_kapita'])
    );
    if (
      sheetPerCapita !== null &&
      matched.tonHari !== null &&
      matched.penduduk !== null &&
      matched.penduduk > 0
    ) {
      const computedPerCapita = Number(((matched.tonHari * 1000) / matched.penduduk).toFixed(2));
      if (Math.abs(sheetPerCapita - computedPerCapita) >= 0.01) {
        derivedColumnNotices.push(
          `${matched.nama}: kolom "per_kapita_kg_hari" di Sheet (${sheetPerCapita.toFixed(2).replace('.', ',')}) berbeda dari rumus otomatis (${computedPerCapita.toFixed(2).replace('.', ',')}) yang dihitung dari "timbulan_ton_hari" & "penduduk_jiwa".`
        );
      }
    }
  }

  return {
    syncedAt: new Date().toISOString(),
    target: 'timbulan',
    rowsRead: rows.length,
    changedSourceFields,
    derivedColumnNotices,
    sourceUrl,
  };
}

export async function importWorkbookFileWithSummary(
  file: File,
  base: SipasDataset
): Promise<{ dataset: SipasDataset; summary: SyncSummary }> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith('.csv')) {
    const text = await file.text();
    const rows = parseCsv(text);
    if (!rows.length) {
      throw new Error('File CSV kosong atau format baris tidak valid.');
    }
    const headers = Object.keys(rows[0]).map(normalizeKey);
    const metaPatch = {
      sourceType: 'file_upload' as const,
      sourceLabel: `Dataset Unggahan CSV (${file.name})`,
      fileName: file.name,
    };

    if (headers.some((h) => h === 'kecamatan' || h === 'nama_kecamatan')) {
      const dataset = applyTimbulanRows(rows, base, metaPatch);
      return {
        dataset,
        summary: inspectTimbulanSync(rows, base.districts, dataset),
      };
    }
    if (headers.some((h) => h === 'komponen')) {
      const dataset = applyNeracaRows(rows, base, metaPatch);
      return {
        dataset,
        summary: {
          syncedAt: new Date().toISOString(),
          target: 'neraca',
          rowsRead: rows.length,
          changedSourceFields: 0,
          derivedColumnNotices: [],
        },
      };
    }
    throw new Error(
      'Header CSV tidak dikenali. Gunakan template "timbulan_kecamatan.csv" atau "neraca_sampah.csv".'
    );
  }

  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
    const XLSX = await loadXlsx();
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    let next = base;
    let updatedAny = false;
    let totalRows = 0;
    let derivedNotices: string[] = [];
    const metaPatch = {
      sourceType: 'file_upload' as const,
      sourceLabel: `Dataset Unggahan Workbook (${file.name})`,
      fileName: file.name,
    };

    const timbulanSheetName = wb.SheetNames.find(
      (n) => normalizeKey(n).includes('timbulan') || normalizeKey(n).includes('kecamatan')
    );
    if (timbulanSheetName) {
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        wb.Sheets[timbulanSheetName],
        { defval: '' }
      );
      const prevDistricts = next.districts;
      next = applyTimbulanRows(rows, next, metaPatch);
      totalRows += rows.length;
      derivedNotices = inspectTimbulanSync(rows, prevDistricts, next).derivedColumnNotices;
      updatedAny = true;
    }

    const neracaSheetName = wb.SheetNames.find((n) =>
      normalizeKey(n).includes('neraca')
    );
    if (neracaSheetName) {
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        wb.Sheets[neracaSheetName],
        { defval: '' }
      );
      next = applyNeracaRows(rows, next, metaPatch);
      totalRows += rows.length;
      updatedAny = true;
    }

    if (!updatedAny && wb.SheetNames.length > 0) {
      const firstRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        wb.Sheets[wb.SheetNames[0]],
        { defval: '' }
      );
      const firstHeaders = firstRows[0] ? Object.keys(firstRows[0]).map(normalizeKey) : [];
      if (firstHeaders.includes('kecamatan')) {
        const prevDistricts = next.districts;
        next = applyTimbulanRows(firstRows, next, metaPatch);
        totalRows += firstRows.length;
        derivedNotices = inspectTimbulanSync(firstRows, prevDistricts, next).derivedColumnNotices;
        updatedAny = true;
      } else if (firstHeaders.includes('komponen')) {
        next = applyNeracaRows(firstRows, next, metaPatch);
        totalRows += firstRows.length;
        updatedAny = true;
      }
    }

    if (!updatedAny) {
      throw new Error(
        'Workbook tidak memiliki sheet "timbulan_kecamatan" atau "neraca_sampah" yang valid.'
      );
    }

    return {
      dataset: next,
      summary: {
        syncedAt: new Date().toISOString(),
        target: 'workbook',
        rowsRead: totalRows,
        changedSourceFields: next.districts.reduce((acc, d) => {
          const prev = base.districts.find((p) => p.id === d.id);
          if (!prev) return acc;
          return (
            acc +
            (prev.penduduk !== d.penduduk ? 1 : 0) +
            (prev.tonHari !== d.tonHari ? 1 : 0) +
            (prev.tonTahun !== d.tonTahun ? 1 : 0)
          );
        }, 0),
        derivedColumnNotices: derivedNotices,
      },
    };
  }

  throw new Error('Format file harus .xlsx, .xls, atau .csv.');
}

export async function importWorkbookFile(
  file: File,
  base: SipasDataset
): Promise<SipasDataset> {
  const { dataset } = await importWorkbookFileWithSummary(file, base);
  return dataset;
}

export function normalizeGoogleSheetCsvUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error('URL Google Sheets wajib diisi.');
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('Format URL tidak valid. Pastikan diawali https://');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Protokol URL harus https:// atau http://');
  }

  if (parsed.hostname.includes('docs.google.com') && parsed.pathname.includes('/spreadsheets/d/')) {
    if (
      parsed.pathname.includes('/pub') ||
      parsed.searchParams.get('output') === 'csv' ||
      parsed.searchParams.get('format') === 'csv'
    ) {
      return trimmed;
    }
    const idMatch = parsed.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch) {
      const sheetId = idMatch[1];
      const gidFromHash = parsed.hash.match(/gid=(\d+)/)?.[1];
      const gid = parsed.searchParams.get('gid') ?? gidFromHash ?? '0';
      return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    }
  }

  return trimmed;
}

export async function fetchGoogleSheetCsvWithSummary(
  rawUrl: string,
  target: 'timbulan' | 'neraca',
  base: SipasDataset
): Promise<{ dataset: SipasDataset; summary: SyncSummary }> {
  const csvUrl = normalizeGoogleSheetCsvUrl(rawUrl);
  const requestUrl = appendCacheBuster(csvUrl);

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method: 'GET',
      cache: 'no-store',
    });
  } catch {
    throw new Error(
      'Gagal menghubungi Google Sheets (kemungkinan CORS atau jaringan). Pastikan sheet sudah diatur "Publikasikan ke web → CSV" atau unduh sebagai .csv lalu unggah manual.'
    );
  }

  if (!response.ok) {
    throw new Error(
      `Google Sheets merespons status ${response.status}. Pastikan akses publik / "Publish to web (CSV)" aktif.`
    );
  }

  const text = await response.text();
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error(
      'URL mengembalikan halaman HTML (bukan CSV). Gunakan link dari "File → Bagikan → Publikasikan ke web → CSV".'
    );
  }

  const rows = parseCsv(text);
  const metaPatch = {
    sourceType: 'google_sheets' as const,
    sourceLabel: 'Sinkronisasi Google Sheets (CSV Publik)',
    sheetUrl: csvUrl,
  };

  if (target === 'timbulan') {
    const dataset = applyTimbulanRows(rows, base, metaPatch);
    return {
      dataset,
      summary: inspectTimbulanSync(rows, base.districts, dataset, csvUrl),
    };
  }

  const dataset = applyNeracaRows(rows, base, metaPatch);
  return {
    dataset,
    summary: {
      syncedAt: new Date().toISOString(),
      target: 'neraca',
      rowsRead: rows.length,
      changedSourceFields: 0,
      derivedColumnNotices: [],
      sourceUrl: csvUrl,
    },
  };
}

export async function fetchGoogleSheetCsv(
  rawUrl: string,
  target: 'timbulan' | 'neraca',
  base: SipasDataset
): Promise<SipasDataset> {
  const { dataset } = await fetchGoogleSheetCsvWithSummary(rawUrl, target, base);
  return dataset;
}
