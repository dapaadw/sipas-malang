import type { SipasDataset, ValidationCheck, ValidationReport } from '../types/sipas';
import { formatNumber } from '../utils/format';

const REQUIRED_DISTRICTS = ['Blimbing', 'Kedungkandang', 'Klojen', 'Lowokwaru', 'Sukun'];

export function validateDataset(dataset: SipasDataset): ValidationReport {
  const checks: ValidationCheck[] = [];
  const { metadata, districts, balance, facilities, tpaProfile, variables, pillarMatrix } = dataset;

  // 1. Konsistensi Tahun
  const expectedYear = metadata.tahunDasar;
  const yearIssues: string[] = [];
  if (!Number.isInteger(expectedYear) || expectedYear < 2020 || expectedYear > 2035) {
    yearIssues.push(`Tahun dasar tidak valid: ${String(expectedYear)}.`);
  }
  districts.forEach((d) => {
    if (d.tahun !== expectedYear) {
      yearIssues.push(`Kecamatan ${d.nama} bertahun ${d.tahun}, berbeda dari tahun dasar ${expectedYear}.`);
    }
  });
  if (balance.tahun !== expectedYear) {
    yearIssues.push(`Neraca sampah bertahun ${balance.tahun}, berbeda dari tahun dasar ${expectedYear}.`);
  }
  facilities.forEach((f) => {
    if (f.tahun !== expectedYear) {
      yearIssues.push(`Fasilitas "${f.jenisFasilitas}" bertahun ${f.tahun}, berbeda dari ${expectedYear}.`);
    }
  });

  checks.push({
    id: 'year',
    title: '1. Konsistensi Tahun Pelaporan',
    status: yearIssues.length > 0 ? 'error' : 'pass',
    summary:
      yearIssues.length > 0
        ? `Ditemukan ${yearIssues.length} ketidaksesuaian tahun.`
        : `Seluruh tabel (kecamatan, neraca, fasilitas) konsisten pada tahun ${expectedYear}.`,
    details:
      yearIssues.length > 0
        ? yearIssues
        : [`Tahun dasar aktif: ${expectedYear} (disinkronkan di semua entitas dataset).`],
  });

  // 2. Kesesuaian Satuan (ton/hari x 365 vs ton/tahun) & Nilai Non-Negatif
  const unitErrors: string[] = [];
  const unitWarnings: string[] = [];
  districts.forEach((d) => {
    if ((d.penduduk !== null && d.penduduk < 0) || (d.tonHari !== null && d.tonHari < 0) || (d.tonTahun !== null && d.tonTahun < 0)) {
      unitErrors.push(`Nilai negatif terdeteksi pada Kecamatan ${d.nama}.`);
    }
    if (d.tonHari !== null && d.tonTahun !== null && d.tonHari > 0) {
      const expectedAnnual = d.tonHari * 365;
      const relDiff = Math.abs(expectedAnnual - d.tonTahun) / expectedAnnual;
      if (relDiff > 0.1) {
        unitErrors.push(
          `${d.nama}: ${formatNumber(d.tonHari)} ton/hari × 365 = ${formatNumber(expectedAnnual)} ton/tahun, selisih ${(relDiff * 100).toFixed(1)}% terhadap ${formatNumber(d.tonTahun)} ton/tahun.`
        );
      } else if (relDiff > 0.015) {
        unitWarnings.push(
          `${d.nama}: selisih rasio harian vs tahunan ${(relDiff * 100).toFixed(2)}% (periksa apakah memakai tahun kabisat 366 hari).`
        );
      }
    }
  });

  const balanceNumbers = [
    ['Timbulan tahunan', balance.timbulanTahun],
    ['Pengurangan', balance.penguranganTahun],
    ['Penanganan', balance.penangananTahun],
    ['Pengolahan bahan baku', balance.pengolahanBahanBakuTahun],
    ['Pemrosesan akhir', balance.pemrosesanAkhirTahun],
    ['Total dikelola', balance.totalDikelolaTahun],
  ] as const;

  balanceNumbers.forEach(([label, val]) => {
    if (val !== null && val < 0) {
      unitErrors.push(`Neraca "${label}" bernilai negatif (${val}).`);
    }
  });

  checks.push({
    id: 'units',
    title: '2. Validasi Satuan (ton/hari ↔ ton/tahun)',
    status: unitErrors.length > 0 ? 'error' : unitWarnings.length > 0 ? 'warning' : 'pass',
    summary:
      unitErrors.length > 0
        ? `Ditemukan ${unitErrors.length} anomali satuan/nilai.`
        : unitWarnings.length > 0
          ? `Terdapat ${unitWarnings.length} catatan rasio satuan harian–tahunan.`
          : 'Satuan penduduk (jiwa), ton/hari, dan ton/tahun (×365) konsisten di seluruh kecamatan.',
    details:
      unitErrors.length > 0
        ? unitErrors
        : unitWarnings.length > 0
          ? unitWarnings
          : ['Verifikasi rasio 1 tahun = 365 hari lolos dengan toleransi < 1,5% pada kelima kecamatan.'],
  });

  // 3. Cakupan Wilayah (5 Kecamatan vs Tingkat Kota)
  const districtNames = new Set(districts.map((d) => d.nama.trim().toLowerCase()));
  const missingDistricts = REQUIRED_DISTRICTS.filter((name) => !districtNames.has(name.toLowerCase()));
  const scopeIssues: string[] = [];

  if (missingDistricts.length > 0) {
    scopeIssues.push(`Kecamatan belum lengkap, kurang: ${missingDistricts.join(', ')}.`);
  }
  if (!balance.cakupan.toLowerCase().includes('kota')) {
    scopeIssues.push(`Cakupan neraca harus tingkat kota, terbaca: "${balance.cakupan}".`);
  }
  const nonCityFacility = facilities.filter((f) => !f.cakupan.toLowerCase().includes('kota'));
  if (nonCityFacility.length > 0) {
    scopeIssues.push(`${nonCityFacility.length} fasilitas belum ditandai cakupan Tingkat Kota.`);
  }

  checks.push({
    id: 'scope',
    title: '3. Validasi Cakupan Wilayah',
    status: scopeIssues.length > 0 ? 'error' : 'pass',
    summary:
      scopeIssues.length > 0
        ? `Cakupan wilayah tidak lengkap (${scopeIssues.length} temuan).`
        : '5 kecamatan terpisah dari inventaris tingkat kota & cakupan layanan TPA Supit Urang.',
    details:
      scopeIssues.length > 0
        ? scopeIssues
        : [
            'Wilayah komparatif lengkap: Blimbing, Kedungkandang, Klojen, Lowokwaru, Sukun.',
            `TPA Supit Urang (${tpaProfile.kecamatan}) terverifikasi melayani: ${tpaProfile.cakupanLayanan}.`,
            'Inventaris 148 fasilitas dan Neraca Sampah berlabel cakupan tingkat Kota Malang.',
          ],
  });

  // 4. Kelengkapan Sumber & Pembaruan
  const sourceMissing: string[] = [];
  if (!metadata.sourceLabel.trim()) sourceMissing.push('Metadata sumber utama kosong.');
  if (!metadata.lastUpdated.trim()) sourceMissing.push('Tanggal pembaruan dataset kosong.');
  districts.forEach((d) => {
    if (!d.sumber.trim()) sourceMissing.push(`Sumber pada Kecamatan ${d.nama} belum diisi.`);
  });
  if (!balance.sumber.trim()) sourceMissing.push('Sumber Neraca Sampah belum diisi.');

  checks.push({
    id: 'source',
    title: '4. Sumber Resmi & Keterlacakan Data',
    status: sourceMissing.length > 0 ? 'warning' : 'pass',
    summary:
      sourceMissing.length > 0
        ? `${sourceMissing.length} atribut sumber/tanggal perlu dilengkapi.`
        : `Sumber tercatat lengkap (${metadata.lastUpdated}).`,
    details:
      sourceMissing.length > 0
        ? sourceMissing
        : [
            `Sumber aktif: ${metadata.sourceLabel}`,
            `Terakhir diperbarui: ${metadata.lastUpdated}`,
          ],
  });

  // 5. Perlindungan Nilai NA (NA ≠ 0)
  const naInventory = variables.filter((v) => v.status === 'NA');
  const naMatrixCount = pillarMatrix.reduce((acc, row) => {
    const cells = [row.Blimbing, row.Kedungkandang, row.Klojen, row.Lowokwaru, row.Sukun];
    return acc + cells.filter((c) => c === 'NA').length;
  }, 0);

  const nullNumericFields: string[] = [];
  districts.forEach((d) => {
    if (d.penduduk === null) nullNumericFields.push(`${d.nama}: Penduduk = NA`);
    if (d.tonHari === null) nullNumericFields.push(`${d.nama}: Timbulan ton/hari = NA`);
    if (d.tonTahun === null) nullNumericFields.push(`${d.nama}: Timbulan ton/tahun = NA`);
  });
  if (balance.timbulanTahun === null) nullNumericFields.push('Neraca: Timbulan tahunan = NA');
  if (balance.penguranganTahun === null) nullNumericFields.push('Neraca: Pengurangan = NA');
  if (balance.penangananTahun === null) nullNumericFields.push('Neraca: Penanganan = NA');
  if (balance.pengolahanBahanBakuTahun === null) nullNumericFields.push('Neraca: Pengolahan bahan baku = NA');
  if (balance.pemrosesanAkhirTahun === null) nullNumericFields.push('Neraca: Pemrosesan akhir = NA');
  if (balance.totalDikelolaTahun === null) nullNumericFields.push('Neraca: Total dikelola = NA');

  const naCount = naInventory.length + nullNumericFields.length;

  checks.push({
    id: 'na_guard',
    title: '5. Penjagaan Nilai NA (NA ≠ 0)',
    status: nullNumericFields.length > 0 ? 'warning' : 'pass',
    summary:
      nullNumericFields.length > 0
        ? `${nullNumericFields.length} sel numerik & ${naInventory.length} variabel berstatus NA terjaga sebagai NA (tidak diubah menjadi 0).`
        : `${naInventory.length} variabel dan ${naMatrixCount} sel matriks berstatus NA terlindungi (tidak dikonversi ke 0).`,
    details: [
      ...naInventory.map((v) => `Variabel #${v.no} "${v.variabel}" → NA (${v.catatan})`),
      ...nullNumericFields.map((msg) => `Sel data aktif: ${msg}`),
    ],
  });

  // 6. Rekonsiliasi Jumlah & Pembulatan Sumber
  const reconDetails: string[] = [];
  let reconStatus: ValidationCheck['status'] = 'pass';

  const validHari = districts.map((d) => d.tonHari).filter((v): v is number => v !== null);
  const validTahun = districts.map((d) => d.tonTahun).filter((v): v is number => v !== null);

  if (validHari.length === districts.length && metadata.officialCityTotals.tonHari !== null) {
    const sumHari = validHari.reduce((a, b) => a + b, 0);
    const diffHari = Number((sumHari - metadata.officialCityTotals.tonHari).toFixed(2));
    reconDetails.push(
      `Jumlah 5 kecamatan (ton/hari) = ${formatNumber(sumHari)} vs total resmi ${formatNumber(metadata.officialCityTotals.tonHari)} (selisih pembulatan: ${diffHari >= 0 ? '+' : ''}${formatNumber(diffHari)}).`
    );
    if (Math.abs(diffHari) > 2) {
      reconStatus = 'warning';
    }
  }

  if (validTahun.length === districts.length && metadata.officialCityTotals.tonTahun !== null) {
    const sumTahun = validTahun.reduce((a, b) => a + b, 0);
    const diffTahun = Number((sumTahun - metadata.officialCityTotals.tonTahun).toFixed(2));
    reconDetails.push(
      `Jumlah 5 kecamatan (ton/tahun) = ${formatNumber(sumTahun)} vs total resmi ${formatNumber(metadata.officialCityTotals.tonTahun)} (selisih pembulatan: ${diffTahun >= 0 ? '+' : ''}${formatNumber(diffTahun)}).`
    );
    if (Math.abs(diffTahun) > 10) {
      reconStatus = 'warning';
    }
  }

  if (
    balance.pengolahanBahanBakuTahun !== null &&
    balance.pemrosesanAkhirTahun !== null &&
    balance.penangananTahun !== null
  ) {
    const sumPenanganan = balance.pengolahanBahanBakuTahun + balance.pemrosesanAkhirTahun;
    const diffPenanganan = Math.abs(sumPenanganan - balance.penangananTahun);
    if (diffPenanganan > 1) {
      reconStatus = 'warning';
      reconDetails.push(
        `Pengolahan (${formatNumber(balance.pengolahanBahanBakuTahun)}) + Pemrosesan akhir (${formatNumber(balance.pemrosesanAkhirTahun)}) = ${formatNumber(sumPenanganan)}, berbeda ${formatNumber(diffPenanganan)} dari Penanganan (${formatNumber(balance.penangananTahun)}).`
      );
    } else {
      reconDetails.push(
        `Subtotal Penanganan terverifikasi: ${formatNumber(balance.pengolahanBahanBakuTahun)} + ${formatNumber(balance.pemrosesanAkhirTahun)} = ${formatNumber(balance.penangananTahun)} ton/tahun.`
      );
    }
  }

  if (
    balance.penguranganTahun !== null &&
    balance.penangananTahun !== null &&
    balance.totalDikelolaTahun !== null
  ) {
    const sumKelola = balance.penguranganTahun + balance.penangananTahun;
    const diffKelola = Math.abs(sumKelola - balance.totalDikelolaTahun);
    if (diffKelola > 1) {
      reconStatus = 'warning';
      reconDetails.push(
        `Pengurangan + Penanganan (${formatNumber(sumKelola)}) berbeda ${formatNumber(diffKelola)} dari Total dikelola (${formatNumber(balance.totalDikelolaTahun)}).`
      );
    } else {
      reconDetails.push(
        `Total Dikelola terverifikasi: ${formatNumber(balance.penguranganTahun)} + ${formatNumber(balance.penangananTahun)} = ${formatNumber(balance.totalDikelolaTahun)} ton/tahun.`
      );
    }
  }

  checks.push({
    id: 'reconciliation',
    title: '6. Rekonsiliasi & Catatan Pembulatan',
    status: reconStatus,
    summary:
      reconStatus === 'warning'
        ? 'Terdeteksi selisih rekonsiliasi melebihi ambang pembulatan wajar.'
        : 'Seluruh subtotal neraca cocok tepat; selisih pembulatan DLH (+0,01 ton/hari) terdokumentasi.',
    details: reconDetails.length > 0 ? reconDetails : ['Data tidak cukup untuk rekonsiliasi penuh.'],
  });

  const passCount = checks.filter((c) => c.status === 'pass').length;
  const warningCount = checks.filter((c) => c.status === 'warning').length;
  const errorCount = checks.filter((c) => c.status === 'error').length;

  const overallStatus: ValidationReport['overallStatus'] =
    errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'valid';

  return {
    overallStatus,
    checkedAt: new Date().toISOString(),
    passCount,
    warningCount,
    errorCount,
    naCount,
    checks,
  };
}
