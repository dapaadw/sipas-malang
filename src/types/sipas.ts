export type DataStatus = 'A' | 'P' | 'NA';

export type DataSourceType =
  | 'official_baseline_2024'
  | 'google_sheets'
  | 'file_upload'
  | 'manual_edit';

export interface DistrictWasteRecord {
  id: string;
  nama: string;
  tahun: number;
  penduduk: number | null;
  tonHari: number | null;
  tonTahun: number | null;
  cakupan: string;
  sumber: string;
  statusData: DataStatus;
  lat: number;
  lng: number;
  fokusKajian: string;
  catatan?: string;
}

export interface BalanceSheetRecord {
  tahun: number;
  timbulanTahun: number | null;
  penguranganTahun: number | null;
  penangananTahun: number | null;
  pengolahanBahanBakuTahun: number | null;
  pemrosesanAkhirTahun: number | null;
  totalDikelolaTahun: number | null;
  cakupan: string;
  sumber: string;
}

export interface FacilityRecord {
  id: string;
  tahun: number;
  jenisFasilitas: string;
  jumlahUnit: number | null;
  cakupan: string;
  sumber: string;
  catatan: string;
}

export interface TpaProfile {
  nama: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  lat: number;
  lng: number;
  cakupanLayanan: string;
  sistemPencatatan: string;
  peranWis: string;
  peranSipas: string;
  statusIntegrasiWis: DataStatus;
  syaratIntegrasiWis: string;
  tantanganRpjmd: string[];
  risikoLingkungan: string[];
  penegasanSukun: string;
}

export interface DataVariableInventory {
  no: number;
  variabel: string;
  indikator: string;
  sumber: string;
  cakupan: string;
  status: DataStatus;
  catatan: string;
}

export type PillarName =
  | 'Nature'
  | 'Structure'
  | 'Infrastructure'
  | 'Superstructure'
  | 'Culture';

export interface PillarReadiness {
  pilar: PillarName;
  indikatorUtama: string;
  ketersediaanData: DataStatus;
  keterangan: string;
  permasalahanKebutuhan: string;
  arahSolusi: string;
  peranSipas: string;
}

export interface PillarDistrictMatrixRow {
  pilar: PillarName;
  Blimbing: DataStatus;
  Kedungkandang: DataStatus;
  Klojen: DataStatus;
  Lowokwaru: DataStatus;
  Sukun: DataStatus;
}

export interface SwotItem {
  komponen: 'Strengths' | 'Weaknesses' | 'Opportunities' | 'Threats';
  labelId: string;
  hasilIdentifikasi: string;
}

export interface TowsStrategy {
  strategi: 'SO' | 'WO' | 'ST' | 'WT';
  nama: string;
  rumusan: string;
}

export interface PriorityProgram {
  no: number;
  program: string;
  bentukImplementasi: string;
  hasilDiharapkan: string;
  prioritasAwal: boolean;
}

export interface ImplementationStage {
  no: number;
  kegiatan: string;
  hasil: string;
}

export interface BibliographyEntry {
  id: string;
  sitasi: string;
  url?: string;
}

export interface DatasetMetadata {
  sourceType: DataSourceType;
  sourceLabel: string;
  tahunDasar: number;
  isOfficialBaseline: boolean;
  lastUpdated: string;
  sheetUrl?: string;
  fileName?: string;
  officialCityTotals: {
    penduduk: number | null;
    tonHari: number | null;
    tonTahun: number | null;
  };
}

export interface SipasDataset {
  metadata: DatasetMetadata;
  districts: DistrictWasteRecord[];
  balance: BalanceSheetRecord;
  facilities: FacilityRecord[];
  tpaProfile: TpaProfile;
  variables: DataVariableInventory[];
  pillars: PillarReadiness[];
  pillarMatrix: PillarDistrictMatrixRow[];
}

export interface DistrictKpi {
  id: string;
  nama: string;
  penduduk: number | null;
  tonHari: number | null;
  tonTahun: number | null;
  kontribusiPersen: number | null;
  perKapitaKgHari: number | null;
}

export interface ComputedKpis {
  totalPenduduk: number | null;
  totalTimbulanHari: number | null;
  totalTimbulanTahun: number | null;
  sumDistrictHari: number | null;
  sumDistrictTahun: number | null;
  tingkatPenguranganPersen: number | null;
  tingkatPenangananPersen: number | null;
  tingkatTerkelolaPersen: number | null;
  proporsiPengolahanBahanBakuPersen: number | null;
  proporsiPemrosesanAkhirPersen: number | null;
  proporsiPemrosesanAkhirDariPenangananPersen: number | null;
  belumTerkelolaTahun: number | null;
  belumTerkelolaPersen: number | null;
  totalFasilitas: number | null;
  rataPerKapitaKgHari: number | null;
  districtKpis: DistrictKpi[];
  tertinggiTimbulan: DistrictKpi | null;
  terendahTimbulan: DistrictKpi | null;
  tertinggiPerKapita: DistrictKpi | null;
  variableCounts: {
    total: number;
    tersedia: number;
    parsial: number;
    na: number;
  };
}

export type ValidationSeverity = 'pass' | 'warning' | 'error';

export type ValidationCheckId =
  | 'year'
  | 'units'
  | 'scope'
  | 'source'
  | 'na_guard'
  | 'reconciliation';

export interface ValidationCheck {
  id: ValidationCheckId;
  title: string;
  status: ValidationSeverity;
  summary: string;
  details: string[];
}

export interface ValidationReport {
  overallStatus: 'valid' | 'warning' | 'error';
  checkedAt: string;
  passCount: number;
  warningCount: number;
  errorCount: number;
  naCount: number;
  checks: ValidationCheck[];
}

export interface SyncSummary {
  syncedAt: string;
  target: 'timbulan' | 'neraca' | 'workbook';
  rowsRead: number;
  changedSourceFields: number;
  derivedColumnNotices: string[];
  sourceUrl?: string;
}
