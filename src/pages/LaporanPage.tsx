import React from 'react';
import {
  BookOpen,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Layers,
  Printer,
  Target,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useSipasData } from '../context/DataContext';
import {
  BIBLIOGRAPHY,
  IMPLEMENTATION_STAGES,
  PRIORITY_PROGRAMS,
  SWOT_ITEMS,
  TOWS_STRATEGIES,
} from '../data/baseline2024';
import { formatInt, formatNumber, formatPercent } from '../utils/format';

export const LaporanPage: React.FC = () => {
  const {
    dataset,
    kpis,
    validation,
    downloadXlsxTemplate,
    downloadTimbulanCsv,
    downloadNeracaCsv,
  } = useSipasData();

  return (
    <div className="space-y-6">
      {/* Export & Print Action Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Ekspor Basis Data &amp; Cetak Ringkasan Eksekutif
          </h2>
          <p className="text-xs text-slate-500">
            Unduh workbook terstandar untuk Google Sheets / Looker Studio atau cetak laporan menjadi PDF
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadXlsxTemplate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Unduh Workbook Google Sheets (.xlsx)
          </button>
          <button
            type="button"
            onClick={downloadTimbulanCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            CSV Timbulan
          </button>
          <button
            type="button"
            onClick={downloadNeracaCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            CSV Neraca
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* Print-ready Executive Summary */}
      <div className="print-card rounded-2xl border border-[#E5EAE7] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Ringkasan Eksekutif SIPAS-Malang
            </span>
            <h3 className="mt-1 text-lg font-extrabold text-slate-900">
              Tata Kelola Data Persampahan Kota Malang (Tahun {dataset.metadata.tahunDasar})
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Sumber aktif: {dataset.metadata.sourceLabel} · Status validasi:{' '}
              {validation.passCount}/6 aturan lolos
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Project Akhir Teknologi Smart City</div>
            <div className="font-semibold text-slate-700">
              FILKOM Universitas Brawijaya
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-[#F8FAF9] p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">Penduduk (5 Kec.)</span>
            <p className="mt-1 tabular-nums text-base font-extrabold text-slate-900">
              {formatInt(kpis.totalPenduduk)} jiwa
            </p>
          </div>
          <div className="rounded-xl bg-[#F8FAF9] p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">Estimasi Timbulan</span>
            <p className="mt-1 tabular-nums text-base font-extrabold text-slate-900">
              {formatNumber(kpis.totalTimbulanHari)} ton/hr
            </p>
          </div>
          <div className="rounded-xl bg-[#F8FAF9] p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">Sampah Terkelola</span>
            <p className="mt-1 tabular-nums text-base font-extrabold text-emerald-800">
              {formatPercent(kpis.tingkatTerkelolaPersen)}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-amber-800">Pemrosesan Akhir TPA</span>
            <p className="mt-1 tabular-nums text-base font-extrabold text-amber-950">
              {formatNumber(dataset.balance.pemrosesanAkhirTahun)} t/thn
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          Berdasarkan data DLH Kota Malang tahun {dataset.metadata.tahunDasar}, estimasi timbulan sampah mencapai{' '}
          <strong>{formatNumber(kpis.totalTimbulanHari)} ton/hari</strong> ({formatNumber(kpis.totalTimbulanTahun)} ton/tahun), dengan kontribusi tertinggi di Kecamatan{' '}
          <strong>{kpis.tertinggiTimbulan?.nama ?? 'NA'}</strong> ({formatPercent(kpis.tertinggiTimbulan?.kontribusiPersen ?? null)}) dan terendah di{' '}
          <strong>{kpis.terendahTimbulan?.nama ?? 'NA'}</strong> ({formatPercent(kpis.terendahTimbulan?.kontribusiPersen ?? null)}). Meskipun tingkat pengelolaan mencapai{' '}
          <strong>{formatPercent(kpis.tingkatTerkelolaPersen)}</strong>, beban pemrosesan akhir di TPA Supit Urang masih sebesar{' '}
          <strong>{formatNumber(dataset.balance.pemrosesanAkhirTahun)} ton/tahun</strong> ({formatPercent(kpis.proporsiPemrosesanAkhirPersen)}). SIPAS-Malang mengintegrasikan data tervalidasi ini sambil menandai kesenjangan data operasional WIS dan perilaku pemilahan sebagai <strong>NA</strong>.
        </p>
      </div>

      {/* SWOT & TOWS Strategy Matrix */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="print-card rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h3 className="text-base font-bold text-slate-900">
            Matriks Analisis SWOT
          </h3>
          <p className="text-xs text-slate-500">
            Faktor tingkat kota diperlakukan sebagai sistem kota, bukan kondisi satu kecamatan
          </p>
          <div className="mt-4 space-y-3">
            {SWOT_ITEMS.map((item) => (
              <div
                key={item.komponen}
                className="rounded-xl border border-slate-200/80 bg-[#F8FAF9] p-3.5"
              >
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    item.komponen === 'Strengths'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.komponen === 'Weaknesses'
                        ? 'bg-amber-100 text-amber-800'
                        : item.komponen === 'Opportunities'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.komponen} ({item.labelId})
                </span>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
                  {item.hasilIdentifikasi}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="print-card rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h3 className="text-base font-bold text-slate-900">
            Matriks Strategi TOWS
          </h3>
          <p className="text-xs text-slate-500">
            Prioritas strategi: pengembangan sistem pemantauan persampahan berbasis data terbuka
          </p>
          <div className="mt-4 space-y-3">
            {TOWS_STRATEGIES.map((t) => (
              <div
                key={t.strategi}
                className="rounded-xl border border-slate-200/80 bg-[#F8FAF9] p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-emerald-900 px-2 py-0.5 text-[11px] font-bold text-white">
                    Strategi {t.strategi}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{t.nama}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
                  {t.rumusan}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Priority Programs (from BACA INI Section 7) */}
      <div className="print-card overflow-hidden rounded-2xl border border-[#E5EAE7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <Target className="h-5 w-5 text-emerald-700" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Empat Program Prioritas Rekomendasi Pemerintah
            </h3>
            <p className="text-xs text-slate-500">
              Prioritas awal yang realistis adalah integrasi data dan dashboard SIPAS-Malang
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAF9] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">No.</th>
                <th className="px-4 py-3">Program Prioritas</th>
                <th className="px-4 py-3">Bentuk Implementasi</th>
                <th className="px-5 py-3">Hasil yang Diharapkan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PRIORITY_PROGRAMS.map((prog) => (
                <tr key={prog.no} className={prog.prioritasAwal ? 'bg-emerald-50/40' : ''}>
                  <td className="px-5 py-3.5 tabular-nums font-bold text-slate-500">
                    {prog.no}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    <div>{prog.program}</div>
                    {prog.prioritasAwal && (
                      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Prioritas Awal Realistis
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-700">
                    {prog.bentukImplementasi}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-medium text-slate-700">
                    {prog.hasilDiharapkan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5 Implementation Stages + Bibliography */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5 print-card rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">
              Tahapan Implementasi Sistem
            </h3>
          </div>
          <div className="mt-4 space-y-2.5">
            {IMPLEMENTATION_STAGES.map((st) => (
              <div
                key={st.no}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-[#F8FAF9] p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                  {st.no}
                </span>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">{st.kegiatan}</p>
                  <p className="mt-0.5 text-slate-600">{st.hasil}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
            <span>Status integrasi WIS real-time</span>
            <StatusBadge status="NA" compact />
          </div>
        </div>

        <div className="lg:col-span-7 print-card rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">
              Daftar Pustaka &amp; Sumber Data Resmi
            </h3>
          </div>
          <ol className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-700">
            {BIBLIOGRAPHY.map((b, i) => (
              <li key={b.id} className="flex items-start gap-2 rounded-lg bg-[#F8FAF9] p-2.5">
                <span className="font-bold text-slate-500 tabular-nums">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  <span>{b.sitasi}</span>
                  {b.url && (
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                    >
                      Buka Sumber Resmi
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
