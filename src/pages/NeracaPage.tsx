import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, CheckCircle2, Factory, Recycle, Scale } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { KpiCard } from '../components/KpiCard';
import { useSipasData } from '../context/DataContext';
import { OFFICIAL_KPIS_SPEC } from '../data/baseline2024';
import { formatInt, formatNumber, formatPercent } from '../utils/format';

export const NeracaPage: React.FC = () => {
  const { dataset, kpis } = useSipasData();
  const b = dataset.balance;

  const pieData = [
    {
      name: 'Pengurangan sampah',
      value: b.penguranganTahun ?? 0,
      isNA: b.penguranganTahun === null,
      color: '#15803D',
    },
    {
      name: 'Pengolahan bahan baku',
      value: b.pengolahanBahanBakuTahun ?? 0,
      isNA: b.pengolahanBahanBakuTahun === null,
      color: '#2563EB',
    },
    {
      name: 'Pemrosesan akhir (TPA)',
      value: b.pemrosesanAkhirTahun ?? 0,
      isNA: b.pemrosesanAkhirTahun === null,
      color: '#D97706',
    },
    {
      name: 'Belum terkelola',
      value: kpis.belumTerkelolaTahun ?? 0,
      isNA: kpis.belumTerkelolaTahun === null,
      color: '#94A3B8',
    },
  ];

  const barData = [
    { name: 'Total Timbulan', value: b.timbulanTahun, color: '#0F172A' },
    { name: 'Total Dikelola', value: b.totalDikelolaTahun, color: '#0EA5E9' },
    { name: 'Penanganan', value: b.penangananTahun, color: '#3B82F6' },
    { name: 'Pemrosesan Akhir', value: b.pemrosesanAkhirTahun, color: '#D97706' },
    { name: 'Pengurangan', value: b.penguranganTahun, color: '#15803D' },
    { name: 'Olah Bahan Baku', value: b.pengolahanBahanBakuTahun, color: '#6366F1' },
  ];

  const computedKpiValues: Record<number, string> = {
    1: `${formatNumber(kpis.totalTimbulanHari)} ton/hari`,
    2: `${formatNumber(kpis.totalTimbulanTahun)} ton/tahun`,
    3: kpis.tertinggiTimbulan
      ? `Maks ${kpis.tertinggiTimbulan.nama}: ${formatPercent(kpis.tertinggiTimbulan.kontribusiPersen)}`
      : 'NA',
    4: formatPercent(kpis.tingkatPenguranganPersen),
    5: formatPercent(kpis.tingkatPenangananPersen),
    6: formatPercent(kpis.tingkatTerkelolaPersen),
    7: kpis.totalFasilitas !== null ? `${formatInt(kpis.totalFasilitas)} unit` : 'NA',
  };

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Timbulan Kota / Tahun"
          value={formatNumber(b.timbulanTahun)}
          unit="ton/thn"
          subtitle={`Cakupan: ${b.cakupan}`}
          icon={Scale}
          tone="blue"
        />
        <KpiCard
          label="Tingkat Pengurangan"
          value={formatPercent(kpis.tingkatPenguranganPersen)}
          subtitle={`${formatNumber(b.penguranganTahun)} ton/tahun`}
          icon={Recycle}
          tone="emerald"
        />
        <KpiCard
          label="Tingkat Penanganan"
          value={formatPercent(kpis.tingkatPenangananPersen)}
          subtitle={`${formatNumber(b.penangananTahun)} ton/tahun`}
          icon={Factory}
          tone="amber"
        />
        <KpiCard
          label="Sampah Terkelola"
          value={formatPercent(kpis.tingkatTerkelolaPersen)}
          subtitle={`${formatNumber(b.totalDikelolaTahun)} ton/tahun`}
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>

      {/* Warning Highlight: High Final Disposal Dependency */}
      <DisclaimerBanner
        title="Ketergantungan Pemrosesan Akhir Masih Tinggi"
        variant="warning"
      >
        Meskipun <strong>{formatPercent(kpis.tingkatTerkelolaPersen)}</strong> timbulan tercatat dikelola, komponen <strong>pemrosesan akhir di TPA mencapai {formatNumber(b.pemrosesanAkhirTahun)} ton/tahun</strong> ({formatPercent(kpis.proporsiPemrosesanAkhirPersen)} dari total timbulan atau {formatPercent(kpis.proporsiPemrosesanAkhirDariPenangananPersen)} dari total penanganan). Pengurangan dan pemilahan sampah dari sumber harus terus diperkuat.
      </DisclaimerBanner>

      {/* Visual Breakdown: Donut + Horizontal Bar */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5 print-card rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h3 className="text-base font-bold text-slate-900">
            Aliran Akhir Timbulan Sampah ({b.tahun})
          </h3>
          <p className="text-xs text-slate-500">
            Proporsi dari total {formatNumber(b.timbulanTahun)} ton/tahun
          </p>

          <div className="mt-2 h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.filter((p) => !p.isNA)}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {pieData
                    .filter((p) => !p.isNA)
                    .map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    typeof value === 'number'
                      ? `${formatNumber(value)} ton/tahun`
                      : 'NA'
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {pieData.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.name}
                </span>
                <span className="tabular-nums font-bold text-slate-900">
                  {p.isNA ? 'NA' : `${formatNumber(p.value)} t`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 print-card rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h3 className="text-base font-bold text-slate-900">
            Volume Komponen Neraca (ton/tahun)
          </h3>
          <p className="text-xs text-slate-500">
            Perbandingan volume absolut berdasarkan {b.sumber}
          </p>

          <div className="mt-4 h-[330px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 6, right: 24, left: 16, bottom: 6 }}
              >
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={126}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(value) =>
                    typeof value === 'number'
                      ? `${formatNumber(value)} ton/tahun`
                      : 'NA'
                  }
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={26}>
                  {barData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.value === null ? '#CBD5E1' : entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Official Neraca Table */}
      <div className="print-card overflow-hidden rounded-2xl border border-[#E5EAE7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            Tabel Resmi Neraca Pengelolaan Sampah Kota Malang ({b.tahun})
          </h3>
          <p className="text-xs text-slate-500">{b.sumber}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAF9] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Komponen Neraca</th>
                <th className="px-4 py-3 text-right">Volume (ton/tahun)</th>
                <th className="px-4 py-3 text-right">Persentase Terhadap Timbulan</th>
                <th className="px-4 py-3">Keterangan Struktur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-5 py-3.5 font-semibold text-slate-900">
                  Timbulan sampah
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums font-bold">
                  {formatNumber(b.timbulanTahun)}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums">100,00%</td>
                <td className="px-4 py-3.5 text-xs text-slate-500">Basis total kota</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-semibold text-emerald-800">
                  Pengurangan sampah
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums font-semibold">
                  {formatNumber(b.penguranganTahun)}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-emerald-700">
                  {formatPercent(kpis.tingkatPenguranganPersen)}
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-500">
                  Pembatasan, guna ulang &amp; daur ulang sumber
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3.5 font-semibold text-slate-900">
                  Penanganan sampah
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums font-semibold">
                  {formatNumber(b.penangananTahun)}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-blue-700">
                  {formatPercent(kpis.tingkatPenangananPersen)}
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-500">
                  Gabungan pengolahan bahan baku + pemrosesan akhir
                </td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="px-5 py-3 pl-9 text-slate-700">
                  &crarr; Pengolahan menjadi bahan baku
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {formatNumber(b.pengolahanBahanBakuTahun)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                  {formatPercent(kpis.proporsiPengolahanBahanBakuPersen)}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  Bagian dari penanganan
                </td>
              </tr>
              <tr className="bg-amber-50/40">
                <td className="px-5 py-3 pl-9 font-medium text-amber-950">
                  &crarr; Pemrosesan akhir (TPA Supit Urang)
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-amber-950">
                  {formatNumber(b.pemrosesanAkhirTahun)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-amber-800">
                  {formatPercent(kpis.proporsiPemrosesanAkhirPersen)}
                </td>
                <td className="px-4 py-3 text-xs text-amber-800">
                  Bagian dari penanganan ({formatPercent(kpis.proporsiPemrosesanAkhirDariPenangananPersen)} porsi penanganan)
                </td>
              </tr>
              <tr className="bg-emerald-50/70 font-bold text-slate-900">
                <td className="px-5 py-3.5">Total sampah dikelola</td>
                <td className="px-4 py-3.5 text-right tabular-nums">
                  {formatNumber(b.totalDikelolaTahun)}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums text-emerald-800">
                  {formatPercent(kpis.tingkatTerkelolaPersen)}
                </td>
                <td className="px-4 py-3.5 text-xs font-normal text-slate-600">
                  Pengurangan + Penanganan
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-slate-600">
                  Sisa belum tercatat terkelola (selisih)
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {formatNumber(kpis.belumTerkelolaTahun)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                  {formatPercent(kpis.belumTerkelolaPersen)}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  Timbulan &minus; Total dikelola
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 7 Official KPI Reference Table */}
      <div className="print-card overflow-hidden rounded-2xl border border-[#E5EAE7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <AlertCircle className="h-4 w-4 text-emerald-700" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              7 Indikator Kinerja Utama (KPI) &amp; Rumus Perhitungan
            </h3>
            <p className="text-xs text-slate-500">
              Dihitung otomatis dari dataset tervalidasi sesuai spesifikasi kajian Smart Environment
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAF9] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">No.</th>
                <th className="px-4 py-3">Indikator (KPI)</th>
                <th className="px-4 py-3">Rumus / Dasar Perhitungan</th>
                <th className="px-4 py-3">Cakupan</th>
                <th className="px-5 py-3 text-right">Hasil Aktif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {OFFICIAL_KPIS_SPEC.map((spec) => (
                <tr key={spec.no} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 text-slate-500 tabular-nums">{spec.no}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{spec.kpi}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{spec.rumus}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{spec.cakupan}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-bold text-emerald-800">
                    {computedKpiValues[spec.no]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
