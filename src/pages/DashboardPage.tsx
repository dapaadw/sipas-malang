import React, { useState } from 'react';
import {
  ArrowRight,
  Database,
  Factory,
  Recycle,
  Scale,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { MalangMap } from '../components/MalangMap';
import { StatusBadge } from '../components/StatusBadge';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { useSipasData } from '../context/DataContext';
import { formatInt, formatNumber, formatPercent } from '../utils/format';

export const DashboardPage: React.FC = () => {
  const { dataset, kpis, validation, setActiveTab } = useSipasData();
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('kedungkandang');

  const sortedDistricts = [...kpis.districtKpis].sort(
    (a, b) => (b.tonHari ?? -1) - (a.tonHari ?? -1)
  );
  const maxTonHari = Math.max(
    ...sortedDistricts.map((d) => d.tonHari ?? 0),
    1
  );

  const selectedDistrict =
    dataset.districts.find((d) => d.id === selectedDistrictId) ?? dataset.districts[0];
  const selectedKpi = kpis.districtKpis.find((d) => d.id === selectedDistrict.id);

  return (
    <div className="space-y-6">
      {/* Transparent Provenance Header */}
      <div className="rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-[#0F3D2B] via-[#155039] to-[#1D6A4C] p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              {dataset.metadata.isOfficialBaseline
                ? `Data Dasar Resmi DLH ${dataset.metadata.tahunDasar} · Estimasi Tahunan (Non Real-Time)`
                : `${dataset.metadata.sourceLabel} · Tahun ${dataset.metadata.tahunDasar}`}
            </div>
            <h2 className="mt-3 text-xl font-extrabold tracking-tight sm:text-2xl">
              Sistem Informasi Pemantauan Sampah Kota Malang
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-emerald-100/90">
              Dashboard pemantauan timbulan lima kecamatan, neraca pengelolaan sampah kota, dan kajian fasilitas akhir TPA Supit Urang untuk mendukung Smart Environment Kota Malang.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('kecamatan')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-950 shadow-xs transition hover:bg-emerald-50"
            >
              Analisis 5 Kecamatan
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kualitas')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              Sinkron Google Sheets
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Estimasi Timbulan Harian"
          value={formatNumber(kpis.totalTimbulanHari)}
          unit="ton/hari"
          subtitle={`${formatNumber(kpis.totalTimbulanTahun)} ton/tahun · ${formatInt(kpis.totalPenduduk)} jiwa`}
          badge="Estimasi DLH"
          icon={Scale}
          tone="blue"
        />
        <KpiCard
          label="Pengurangan Sampah"
          value={formatPercent(kpis.tingkatPenguranganPersen)}
          subtitle={`${formatNumber(dataset.balance.penguranganTahun)} ton/tahun`}
          badge="Neraca 2024"
          icon={TrendingDown}
          tone="emerald"
        />
        <KpiCard
          label="Penanganan Sampah"
          value={formatPercent(kpis.tingkatPenangananPersen)}
          subtitle={`Pemrosesan akhir ${formatNumber(dataset.balance.pemrosesanAkhirTahun)} t/thn`}
          badge="Beban TPA Tinggi"
          icon={Factory}
          tone="amber"
        />
        <KpiCard
          label="Total Sampah Terkelola"
          value={formatPercent(kpis.tingkatTerkelolaPersen)}
          subtitle={`${formatNumber(dataset.balance.totalDikelolaTahun)} t/thn · ${formatInt(kpis.totalFasilitas)} unit fasilitas`}
          badge="Tingkat Kota"
          icon={Recycle}
          tone="emerald"
        />
      </div>

      {/* Map & District Comparison Bento */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sebaran Estimasi Timbulan &amp; Lokasi TPA Supit Urang
              </h3>
              <p className="text-xs text-slate-500">
                Peta interaktif 5 kecamatan komparatif dan posisi TPA Supit Urang (Kel. Mulyorejo, Kec. Sukun)
              </p>
            </div>
          </div>
          <MalangMap
            districts={dataset.districts}
            districtKpis={kpis.districtKpis}
            tpaProfile={dataset.tpaProfile}
            selectedDistrictId={selectedDistrictId}
            onSelectDistrict={setSelectedDistrictId}
            heightClass="h-[360px]"
          />
        </div>

        {/* Horizontal Progress Ranking Card (inspired by BACA INI reference chart) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Perbandingan Estimasi Timbulan
                </h3>
                <p className="text-xs text-slate-500">
                  Data DLH Kota Malang Tahun {dataset.metadata.tahunDasar}, ton/hari
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('kecamatan')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Detail &rarr;
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {sortedDistricts.map((d) => {
                const pct = d.tonHari !== null ? (d.tonHari / maxTonHari) * 100 : 0;
                const isSelected = d.id === selectedDistrictId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDistrictId(d.id)}
                    className={`block w-full rounded-xl p-2 text-left transition ${
                      isSelected
                        ? 'bg-blue-50/70 ring-1 ring-blue-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-semibold text-slate-800">
                        {d.nama}
                        {d.id === 'sukun' && (
                          <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            Lokasi TPA
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums font-bold text-slate-900">
                        {formatNumber(d.tonHari)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected District Focus Summary */}
          <div className="mt-5 rounded-xl border border-slate-200/80 bg-[#F8FAF9] p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Sorotan: Kec. {selectedDistrict.nama}
              </span>
              <StatusBadge status={selectedDistrict.statusData} showCode />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="block text-slate-500">Penduduk</span>
                <strong className="tabular-nums text-slate-900">
                  {formatInt(selectedDistrict.penduduk)}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Kontribusi</span>
                <strong className="tabular-nums text-slate-900">
                  {formatPercent(selectedKpi?.kontribusiPersen ?? null)}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Per Kapita</span>
                <strong className="tabular-nums text-slate-900">
                  {selectedKpi?.perKapitaKgHari !== null && selectedKpi?.perKapitaKgHari !== undefined
                    ? `${formatNumber(selectedKpi.perKapitaKgHari)} kg/hr`
                    : 'NA'}
                </strong>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {selectedDistrict.fokusKajian}.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Summary Row: Neraca Composition + Data Quality */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Komposisi Neraca Pengelolaan Sampah
              </h3>
              <p className="text-xs text-slate-500">
                Proporsi terhadap total timbulan {formatNumber(dataset.balance.timbulanTahun)} ton/tahun
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('neraca')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Lihat Neraca &rarr;
            </button>
          </div>

          {/* Proportional Stacked Bar */}
          <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-emerald-600"
              style={{ width: `${kpis.tingkatPenguranganPersen ?? 0}%` }}
              title={`Pengurangan: ${formatPercent(kpis.tingkatPenguranganPersen)}`}
            />
            <div
              className="bg-blue-500"
              style={{ width: `${kpis.proporsiPengolahanBahanBakuPersen ?? 0}%` }}
              title={`Pengolahan bahan baku: ${formatPercent(kpis.proporsiPengolahanBahanBakuPersen)}`}
            />
            <div
              className="bg-amber-500"
              style={{ width: `${kpis.proporsiPemrosesanAkhirPersen ?? 0}%` }}
              title={`Pemrosesan akhir (TPA): ${formatPercent(kpis.proporsiPemrosesanAkhirPersen)}`}
            />
            <div
              className="bg-slate-400"
              style={{ width: `${kpis.belumTerkelolaPersen ?? 0}%` }}
              title={`Belum terkelola: ${formatPercent(kpis.belumTerkelolaPersen)}`}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                Pengurangan
              </div>
              <p className="mt-1 tabular-nums text-sm font-bold text-slate-900">
                {formatNumber(dataset.balance.penguranganTahun)} t{' '}
                <span className="font-normal text-slate-500">
                  ({formatPercent(kpis.tingkatPenguranganPersen)})
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Pengolahan Bahan Baku
              </div>
              <p className="mt-1 tabular-nums text-sm font-bold text-slate-900">
                {formatNumber(dataset.balance.pengolahanBahanBakuTahun)} t{' '}
                <span className="font-normal text-slate-500">
                  ({formatPercent(kpis.proporsiPengolahanBahanBakuPersen)})
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-3">
              <div className="flex items-center gap-1.5 font-medium text-amber-900">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Pemrosesan Akhir (TPA)
              </div>
              <p className="mt-1 tabular-nums text-sm font-bold text-amber-950">
                {formatNumber(dataset.balance.pemrosesanAkhirTahun)} t{' '}
                <span className="font-normal text-amber-800">
                  ({formatPercent(kpis.proporsiPemrosesanAkhirPersen)})
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                Belum Terkelola
              </div>
              <p className="mt-1 tabular-nums text-sm font-bold text-slate-900">
                {formatNumber(kpis.belumTerkelolaTahun)} t{' '}
                <span className="font-normal text-slate-500">
                  ({formatPercent(kpis.belumTerkelolaPersen)})
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Data Availability & Governance Card */}
        <div className="rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Status Ketersediaan Data &amp; Kesenjangan
              </h3>
              <p className="text-xs text-slate-500">
                Audit {kpis.variableCounts.total} variabel data sekunder tata kelola persampahan
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('kualitas')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Audit Data &rarr;
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 text-center">
              <span className="block text-xl font-extrabold text-emerald-700 tabular-nums">
                {kpis.variableCounts.tersedia}
              </span>
              <span className="text-xs font-semibold text-emerald-900">Tersedia (A)</span>
            </div>
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-center">
              <span className="block text-xl font-extrabold text-amber-700 tabular-nums">
                {kpis.variableCounts.parsial}
              </span>
              <span className="text-xs font-semibold text-amber-900">Parsial (P)</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-3 text-center">
              <span className="block text-xl font-extrabold text-slate-700 tabular-nums">
                {kpis.variableCounts.na}
              </span>
              <span className="text-xs font-semibold text-slate-700">Status NA</span>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <Database className="h-3.5 w-3.5 text-slate-500" />
                Sampah masuk TPA per asal kecamatan (WIS)
              </span>
              <StatusBadge status="NA" compact />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                Perilaku pemilahan rumah tangga per kecamatan
              </span>
              <StatusBadge status="NA" compact />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Aturan sistem: indikator yang belum tersedia di sumber publik wajib ditandai <strong>NA</strong> dan tidak dikonversi menjadi nilai nol (0).
          </p>
        </div>
      </div>

      {/* Compact System Workflow */}
      <WorkflowStepper
        metadata={dataset.metadata}
        validation={validation}
        compact
        onOpenPipeline={() => setActiveTab('kualitas')}
      />
    </div>
  );
};
