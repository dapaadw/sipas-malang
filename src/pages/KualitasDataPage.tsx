import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CloudDownload,
  Download,
  FileSpreadsheet,
  PencilLine,
  RotateCcw,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { StatusBadge } from '../components/StatusBadge';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { useSipasData } from '../context/DataContext';
import type { DataStatus } from '../types/sipas';

type IngestionTab = 'sheets' | 'upload' | 'manual';
type VarFilter = 'ALL' | DataStatus;

export const KualitasDataPage: React.FC = () => {
  const {
    dataset,
    kpis,
    validation,
    syncing,
    syncError,
    lastSyncSummary,
    defaultSheetUrl,
    syncFromGoogleSheet,
    importFromFile,
    updateDistrictManual,
    resetToBaseline,
    downloadXlsxTemplate,
  } = useSipasData();

  const [ingestionTab, setIngestionTab] = useState<IngestionTab>('sheets');
  const [sheetUrl, setSheetUrl] = useState(
    dataset.metadata.sheetUrl ?? defaultSheetUrl
  );
  const [sheetTarget, setSheetTarget] = useState<'timbulan' | 'neraca'>('timbulan');
  const [varFilter, setVarFilter] = useState<VarFilter>('ALL');

  // Manual standardized editor state
  const [editDistrictId, setEditDistrictId] = useState(dataset.districts[0]?.id ?? 'blimbing');
  const selectedEditDistrict =
    dataset.districts.find((d) => d.id === editDistrictId) ?? dataset.districts[0];

  const [pendudukInput, setPendudukInput] = useState('');
  const [tonHariInput, setTonHariInput] = useState('');
  const [tonTahunInput, setTonTahunInput] = useState('');

  useEffect(() => {
    if (!selectedEditDistrict) return;
    setPendudukInput(
      selectedEditDistrict.penduduk !== null ? String(selectedEditDistrict.penduduk) : 'NA'
    );
    setTonHariInput(
      selectedEditDistrict.tonHari !== null ? String(selectedEditDistrict.tonHari) : 'NA'
    );
    setTonTahunInput(
      selectedEditDistrict.tonTahun !== null ? String(selectedEditDistrict.tonTahun) : 'NA'
    );
  }, [selectedEditDistrict]);

  const filteredVariables =
    varFilter === 'ALL'
      ? dataset.variables
      : dataset.variables.filter((v) => v.status === varFilter);

  const handleSheetSync = async (e: React.FormEvent) => {
    e.preventDefault();
    await syncFromGoogleSheet(sheetUrl, sheetTarget);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importFromFile(file);
    e.target.value = '';
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditDistrict) return;
    updateDistrictManual(selectedEditDistrict.id, {
      pendudukRaw: pendudukInput,
      tonHariRaw: tonHariInput,
      tonTahunRaw: tonTahunInput,
    });
  };

  return (
    <div className="space-y-6">
      {/* Full 5-Stage System Workflow */}
      <WorkflowStepper metadata={dataset.metadata} validation={validation} />

      {/* Automated 6-Rule Validation Report */}
      <div className="print-card rounded-2xl border border-[#E5EAE7] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Laporan Pemeriksaan &amp; Validasi Data Otomatis
              </h2>
              <p className="text-xs text-slate-500">
                Memeriksa tahun, satuan (ton/hari &harr; ton/tahun), cakupan wilayah, sumber, penjagaan NA &ne; 0, dan rekonsiliasi pembulatan
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-200">
              {validation.passCount} Lolos
            </span>
            {validation.warningCount > 0 && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-200">
                {validation.warningCount} Peringatan
              </span>
            )}
            {validation.errorCount > 0 && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-red-700 ring-1 ring-red-200">
                {validation.errorCount} Galat
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-slate-200">
              {validation.naCount} Item NA Terlindungi
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {validation.checks.map((check) => {
            const isPass = check.status === 'pass';
            const isWarn = check.status === 'warning';
            return (
              <div
                key={check.id}
                className={`rounded-xl border p-4 ${
                  isPass
                    ? 'border-emerald-200/70 bg-emerald-50/30'
                    : isWarn
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-red-200 bg-red-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">{check.title}</p>
                  {isPass ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : isWarn ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                  )}
                </div>
                <p className="mt-1 text-xs font-medium text-slate-700">{check.summary}</p>
                <ul className="mt-2 space-y-1 text-[11.5px] text-slate-600">
                  {check.details.map((line, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Data Ingestion & Google Sheets Sync Panel */}
      <div className="no-print rounded-2xl border border-[#E5EAE7] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pusat Pengumpulan &amp; Sinkronisasi Spreadsheet (Google Sheets / .xlsx)
            </h3>
            <p className="text-xs text-slate-500">
              Realisasi Tahap 1–3 Alur Kerja: tarik data CSV Google Sheets, unggah template .xlsx/.csv, atau uji aturan NA &ne; 0
            </p>
          </div>

          {!dataset.metadata.isOfficialBaseline && (
            <button
              type="button"
              onClick={resetToBaseline}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset ke Data Resmi DLH 2024
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setIngestionTab('sheets')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              ingestionTab === 'sheets'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CloudDownload className="h-3.5 w-3.5" />
            Sinkron Google Sheets (CSV)
          </button>
          <button
            type="button"
            onClick={() => setIngestionTab('upload')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              ingestionTab === 'upload'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Unggah File (.xlsx / .csv)
          </button>
          <button
            type="button"
            onClick={() => setIngestionTab('manual')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              ingestionTab === 'manual'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PencilLine className="h-3.5 w-3.5" />
            Editor Terstandar &amp; Uji NA &ne; 0
          </button>
        </div>

        {syncError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900">
            <strong>Kegagalan Sinkronisasi:</strong> {syncError}
          </div>
        )}

        {lastSyncSummary && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-950">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="font-bold">Ringkasan Sinkronisasi Terakhir</strong>
              <span className="font-mono text-[11px] text-emerald-800">
                {new Date(lastSyncSummary.syncedAt).toLocaleString('id-ID')}
              </span>
            </div>
            <p className="mt-1 text-emerald-900">
              Terbaca <strong>{lastSyncSummary.rowsRead} baris</strong> ({lastSyncSummary.target}).{' '}
              Perubahan data sumber mentah (penduduk / ton/hari / ton/tahun):{' '}
              <strong>{lastSyncSummary.changedSourceFields} kolom</strong>.
            </p>
            {lastSyncSummary.derivedColumnNotices.length > 0 && (
              <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
                <p className="font-bold">
                  Catatan Kolom Rumus Otomatis ({lastSyncSummary.derivedColumnNotices.length}):
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {lastSyncSummary.derivedColumnNotices.map((notice, idx) => (
                    <li key={idx}>{notice}</li>
                  ))}
                </ul>
                <p className="mt-1.5 text-[11px] text-amber-900">
                  Tip: Ubah kolom <strong>timbulan_ton_hari</strong>,{' '}
                  <strong>timbulan_ton_tahun</strong>, atau <strong>penduduk_jiwa</strong> agar grafik dan KPI ikut berubah.
                </p>
              </div>
            )}
          </div>
        )}

        {ingestionTab === 'sheets' && (
          <form onSubmit={handleSheetSync} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-8">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  URL Google Sheets (Link Publikasikan ke Web CSV atau URL Sheet)
                </label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../pub?gid=0&single=true&output=csv"
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAF9] px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
              <div className="md:col-span-4">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Target Tabel
                </label>
                <select
                  value={sheetTarget}
                  onChange={(e) => setSheetTarget(e.target.value as 'timbulan' | 'neraca')}
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAF9] px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                >
                  <option value="timbulan">timbulan_kecamatan</option>
                  <option value="neraca">neraca_sampah</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Di Google Sheets: pilih{' '}
                <strong className="text-slate-700">
                  File &rarr; Bagikan &rarr; Publikasikan ke web &rarr; Comma-separated values (.csv)
                </strong>
                . Sel kosong atau <code className="rounded bg-slate-100 px-1">NA</code> otomatis dipertahankan sebagai <code className="rounded bg-slate-100 px-1">NA</code>.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={downloadXlsxTemplate}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Unduh Template .xlsx
                </button>
                <button
                  type="submit"
                  disabled={syncing}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                >
                  <CloudDownload className="h-3.5 w-3.5" />
                  {syncing ? 'Menarik & Memvalidasi...' : 'Tarik & Validasi Data'}
                </button>
              </div>
            </div>
          </form>
        )}

        {ingestionTab === 'upload' && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-[#F8FAF9] p-6 text-center">
              <FileSpreadsheet className="h-8 w-8 text-emerald-700" />
              <p className="mt-2 text-sm font-bold text-slate-900">
                Unggah Workbook Excel (.xlsx) atau CSV Terstandar
              </p>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                Gunakan template resmi SIPAS-Malang agar kolom <code className="rounded bg-white px-1">timbulan_kecamatan</code> dan <code className="rounded bg-white px-1">neraca_sampah</code> langsung terdeteksi &amp; tervalidasi.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <label className="cursor-pointer rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800">
                  Pilih File (.xlsx / .csv)
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={downloadXlsxTemplate}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Unduh Template .xlsx
                </button>
              </div>
            </div>
          </div>
        )}

        {ingestionTab === 'manual' && (
          <form onSubmit={handleManualSave} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Kecamatan
                </label>
                <select
                  value={editDistrictId}
                  onChange={(e) => setEditDistrictId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAF9] px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
                >
                  {dataset.districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Penduduk (jiwa)
                </label>
                <input
                  type="text"
                  value={pendudukInput}
                  onChange={(e) => setPendudukInput(e.target.value)}
                  placeholder="Angka atau NA"
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAF9] px-3 py-2 text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Timbulan (ton/hari)
                </label>
                <input
                  type="text"
                  value={tonHariInput}
                  onChange={(e) => setTonHariInput(e.target.value)}
                  placeholder="Kosong / NA = tetap NA"
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAF9] px-3 py-2 text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Timbulan (ton/tahun)
                </label>
                <input
                  type="text"
                  value={tonTahunInput}
                  onChange={(e) => setTonTahunInput(e.target.value)}
                  placeholder="Angka atau NA"
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAF9] px-3 py-2 text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Ketik <code className="rounded bg-slate-100 px-1">NA</code> atau kosongkan nilai untuk menguji bagaimana SIPAS-Malang menjaga status <strong>NA &ne; 0</strong> di seluruh grafik dan laporan validasi.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetToBaseline}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Baseline
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  Simpan &amp; Validasi
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* 9 Data Variables Inventory Table */}
      <div className="print-card overflow-hidden rounded-2xl border border-[#E5EAE7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Inventaris &amp; Status Ketersediaan Data ({kpis.variableCounts.total} Variabel)
            </h3>
            <p className="text-xs text-slate-500">
              {kpis.variableCounts.tersedia} Tersedia (A) · {kpis.variableCounts.parsial} Parsial (P) · {kpis.variableCounts.na} Tidak Tersedia (NA)
            </p>
          </div>
          <div className="no-print flex flex-wrap gap-1.5">
            {(['ALL', 'A', 'P', 'NA'] as VarFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setVarFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  varFilter === f
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'ALL'
                  ? `Semua (${kpis.variableCounts.total})`
                  : f === 'A'
                    ? `Tersedia (${kpis.variableCounts.tersedia})`
                    : f === 'P'
                      ? `Parsial (${kpis.variableCounts.parsial})`
                      : `NA (${kpis.variableCounts.na})`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAF9] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">No.</th>
                <th className="px-4 py-3">Variabel</th>
                <th className="px-4 py-3">Indikator</th>
                <th className="px-4 py-3">Sumber &amp; Cakupan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3">Catatan Tata Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVariables.map((v) => (
                <tr key={v.no} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 tabular-nums text-slate-500">{v.no}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{v.variabel}</td>
                  <td className="px-4 py-3 text-slate-700">{v.indikator}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div className="font-medium text-slate-800">{v.sumber}</div>
                    <div>{v.cakupan}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={v.status} showCode />
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">{v.catatan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5 Smart City Pillars Readiness & Solution Mapping */}
      <div className="print-card overflow-hidden rounded-2xl border border-[#E5EAE7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            Kesiapan Lima Pilar Smart City &amp; Keterkaitan dengan SIPAS-Malang
          </h3>
          <p className="text-xs text-slate-500">
            Dashboard SIPAS-Malang terutama menjawab kebutuhan Infrastructure &amp; Superstructure, serta menjadi dasar pemetaan Nature, Structure, dan Culture
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAF9] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Pilar</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Permasalahan / Kebutuhan</th>
                <th className="px-4 py-3">Arah Solusi</th>
                <th className="px-5 py-3">Kontribusi SIPAS-Malang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataset.pillars.map((p) => (
                <tr key={p.pilar} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    <div>{p.pilar}</div>
                    <div className="text-[11px] font-normal text-slate-500">
                      {p.indikatorUtama}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={p.ketersediaanData} showCode />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-700">
                    {p.permasalahanKebutuhan}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-emerald-800">
                    {p.arahSolusi}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">{p.peranSipas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Pillar-District Matrix */}
      <div className="print-card overflow-hidden rounded-2xl border border-[#E5EAE7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            Matriks Ketersediaan Bukti Lima Pilar per Kecamatan
          </h3>
          <p className="text-xs text-slate-500">
            P = bukti tersedia parsial atau di tingkat kota · NA = bukti spesifik kecamatan belum tersedia
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAF9] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Pilar Smart City</th>
                <th className="px-4 py-3 text-center">Blimbing</th>
                <th className="px-4 py-3 text-center">Kedungkandang</th>
                <th className="px-4 py-3 text-center">Klojen</th>
                <th className="px-4 py-3 text-center">Lowokwaru</th>
                <th className="px-4 py-3 text-center">Sukun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataset.pillarMatrix.map((row) => (
                <tr key={row.pilar}>
                  <td className="px-5 py-3 font-semibold text-slate-900">{row.pilar}</td>
                  {(['Blimbing', 'Kedungkandang', 'Klojen', 'Lowokwaru', 'Sukun'] as const).map(
                    (kec) => (
                      <td key={kec} className="px-4 py-3 text-center">
                        <StatusBadge status={row[kec]} compact />
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <DisclaimerBanner variant="info">
            Matriks ini adalah <strong>pemetaan ketersediaan bukti sekunder, bukan peringkat atau skor kesiapan antarkecamatan</strong>. Kecamatan Sukun memiliki bukti parsial tambahan terkait keberadaan lokasi TPA Supit Urang dan WIS.
          </DisclaimerBanner>
        </div>
      </div>
    </div>
  );
};
