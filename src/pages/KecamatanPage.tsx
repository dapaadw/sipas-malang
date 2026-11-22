import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpDown, MapPin, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { KpiCard } from '../components/KpiCard';
import { StatusBadge } from '../components/StatusBadge';
import { useSipasData } from '../context/DataContext';
import { formatInt, formatNumber, formatPercent } from '../utils/format';

type ChartMetric = 'tonHari' | 'tonTahun' | 'kontribusiPersen' | 'perKapitaKgHari';
type SortKey = 'tonHari' | 'penduduk' | 'perKapitaKgHari' | 'nama';

const METRIC_META: Record<
  ChartMetric,
  { label: string; unit: string; decimals: number }
> = {
  tonHari: { label: 'Estimasi Timbulan Harian', unit: 'ton/hari', decimals: 2 },
  tonTahun: { label: 'Estimasi Timbulan Tahunan', unit: 'ton/tahun', decimals: 2 },
  kontribusiPersen: { label: 'Kontribusi Terhadap Total Kota', unit: '%', decimals: 2 },
  perKapitaKgHari: { label: 'Estimasi Per Kapita', unit: 'kg/jiwa/hari', decimals: 2 },
};

export const KecamatanPage: React.FC = () => {
  const { dataset, kpis } = useSipasData();
  const [metric, setMetric] = useState<ChartMetric>('tonHari');
  const [sortBy, setSortBy] = useState<SortKey>('tonHari');

  const chartData = useMemo(() => {
    return dataset.districts.map((d) => {
      const dk = kpis.districtKpis.find((item) => item.id === d.id);
      const rawVal =
        metric === 'tonHari'
          ? d.tonHari
          : metric === 'tonTahun'
            ? d.tonTahun
            : metric === 'kontribusiPersen'
              ? dk?.kontribusiPersen ?? null
              : dk?.perKapitaKgHari ?? null;

      return {
        id: d.id,
        nama: d.nama,
        value: rawVal,
        isNA: rawVal === null,
      };
    });
  }, [dataset.districts, kpis.districtKpis, metric]);

  const sortedRows = useMemo(() => {
    const merged = dataset.districts.map((d) => {
      const dk = kpis.districtKpis.find((item) => item.id === d.id);
      return {
        ...d,
        kontribusiPersen: dk?.kontribusiPersen ?? null,
        perKapitaKgHari: dk?.perKapitaKgHari ?? null,
      };
    });

    return merged.sort((a, b) => {
      if (sortBy === 'nama') return a.nama.localeCompare(b.nama);
      const va = a[sortBy] ?? -Infinity;
      const vb = b[sortBy] ?? -Infinity;
      return vb - va;
    });
  }, [dataset.districts, kpis.districtKpis, sortBy]);

  const meta = METRIC_META[metric];
  const sukunRow = kpis.districtKpis.find((d) => d.id === 'sukun');

  return (
    <div className="space-y-6">
      <DisclaimerBanner
        title="Bukan Tonase Aktual yang Masuk TPA"
        variant="info"
      >
        Angka di bawah adalah <strong>estimasi timbulan sampah tahun {dataset.metadata.tahunDasar}</strong> per kecamatan berdasarkan data resmi DLH Kota Malang, bukan hasil penimbangan harian kendaraan yang masuk ke TPA Supit Urang.
      </DisclaimerBanner>

      {/* 4 Insight Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Timbulan Tertinggi"
          value={kpis.tertinggiTimbulan ? formatNumber(kpis.tertinggiTimbulan.tonHari) : 'NA'}
          unit="ton/hari"
          subtitle={
            kpis.tertinggiTimbulan
              ? `Kec. ${kpis.tertinggiTimbulan.nama} (${formatPercent(kpis.tertinggiTimbulan.kontribusiPersen)})`
              : 'Data tidak tersedia'
          }
          icon={TrendingUp}
          tone="blue"
        />
        <KpiCard
          label="Timbulan Terendah"
          value={kpis.terendahTimbulan ? formatNumber(kpis.terendahTimbulan.tonHari) : 'NA'}
          unit="ton/hari"
          subtitle={
            kpis.terendahTimbulan
              ? `Kec. ${kpis.terendahTimbulan.nama} (${formatPercent(kpis.terendahTimbulan.kontribusiPersen)})`
              : 'Data tidak tersedia'
          }
          icon={TrendingDown}
          tone="emerald"
        />
        <KpiCard
          label="Per Kapita Tertinggi"
          value={
            kpis.tertinggiPerKapita
              ? formatNumber(kpis.tertinggiPerKapita.perKapitaKgHari)
              : 'NA'
          }
          unit="kg/jiwa/hr"
          subtitle={
            kpis.tertinggiPerKapita
              ? `Kec. ${kpis.tertinggiPerKapita.nama} (aktivitas pusat kota)`
              : 'Data tidak tersedia'
          }
          icon={Users}
          tone="blue"
        />
        <KpiCard
          label="Lokasi TPA Supit Urang"
          value={sukunRow ? formatNumber(sukunRow.tonHari) : 'NA'}
          unit="ton/hari"
          subtitle="Timbulan Kec. Sukun (TPA melayani seluruh kota)"
          icon={MapPin}
          tone="amber"
        />
      </div>

      {/* Interactive Vertical Bar Chart (matching BACA INI Menu 2 visual) */}
      <div className="print-card rounded-2xl border border-[#E5EAE7] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {meta.label} per Kecamatan
            </h2>
            <p className="text-xs text-slate-500">
              Arahkan kursor pada batang grafik untuk melihat detail nilai per kecamatan ({meta.unit})
            </p>
          </div>
          <div className="no-print flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1">
            {(Object.keys(METRIC_META) as ChartMetric[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMetric(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  metric === key
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {key === 'tonHari'
                  ? 'Ton/hari'
                  : key === 'tonTahun'
                    ? 'Ton/tahun'
                    : key === 'kontribusiPersen'
                      ? 'Kontribusi %'
                      : 'Per Kapita'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 16, left: 4, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="nama"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(v: number) =>
                  metric === 'tonTahun'
                    ? `${Math.round(v / 1000)}k`
                    : `${v} ${metric === 'kontribusiPersen' ? '%' : ''}`
                }
              />
              <Tooltip
                cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload as {
                    nama: string;
                    value: number | null;
                    isNA: boolean;
                  };
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg">
                      <p className="text-xs font-bold text-slate-900">{item.nama}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <span className="text-slate-600">Timbulan:</span>
                        <strong className="tabular-nums text-slate-900">
                          {item.isNA
                            ? 'NA'
                            : `${formatNumber(item.value, meta.decimals)} ${meta.unit}`}
                        </strong>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={76}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={
                      entry.isNA
                        ? '#CBD5E1'
                        : entry.nama === kpis.tertinggiTimbulan?.nama && metric !== 'perKapitaKgHari'
                          ? '#2563EB'
                          : '#60A5FA'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sortable District Table */}
      <div className="print-card overflow-hidden rounded-2xl border border-[#E5EAE7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tabel Komparatif Lima Kecamatan
            </h3>
            <p className="text-xs text-slate-500">
              Sumber: DLH Kota Malang ({dataset.metadata.tahunDasar}) &amp; BPS Kota Malang
            </p>
          </div>
          <div className="no-print flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <select
              aria-label="Urutkan kecamatan"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-600"
            >
              <option value="tonHari">Urutkan: Timbulan Tertinggi</option>
              <option value="penduduk">Urutkan: Penduduk Terbanyak</option>
              <option value="perKapitaKgHari">Urutkan: Per Kapita Tertinggi</option>
              <option value="nama">Urutkan: Nama Kecamatan (A–Z)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAF9] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Kecamatan</th>
                <th className="px-4 py-3 text-right">Penduduk (jiwa)</th>
                <th className="px-4 py-3 text-right">Timbulan (ton/hari)</th>
                <th className="px-4 py-3 text-right">Timbulan (ton/tahun)</th>
                <th className="px-4 py-3 text-right">Kontribusi</th>
                <th className="px-4 py-3 text-right">Est. Per Kapita</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    <div>{row.nama}</div>
                    <div className="text-[11px] font-normal text-slate-500">
                      {row.fokusKajian}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-slate-700">
                    {formatInt(row.penduduk)}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-slate-900">
                    {formatNumber(row.tonHari)}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-slate-700">
                    {formatNumber(row.tonTahun)}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-blue-700">
                    {formatPercent(row.kontribusiPersen)}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-slate-700">
                    {row.perKapitaKgHari !== null
                      ? `${formatNumber(row.perKapitaKgHari)} kg/hr`
                      : 'NA'}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.statusData} compact />
                  </td>
                </tr>
              ))}
              <tr className="bg-emerald-50/60 font-bold text-slate-900">
                <td className="px-5 py-3.5">
                  Total Kota Malang (Resmi DLH)
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums">
                  {formatInt(kpis.totalPenduduk)}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums">
                  {formatNumber(kpis.totalTimbulanHari)}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums">
                  {formatNumber(kpis.totalTimbulanTahun)}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums">100,00%</td>
                <td className="px-4 py-3.5 text-right tabular-nums">
                  {kpis.rataPerKapitaKgHari !== null
                    ? `${formatNumber(kpis.rataPerKapitaKgHari)} kg/hr`
                    : 'NA'}
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status="A" compact />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500">
          Catatan pembulatan sumber resmi: Penjumlahan langsung 5 kecamatan menghasilkan{' '}
          <strong className="text-slate-700">{formatNumber(kpis.sumDistrictHari)} ton/hari</strong>{' '}
          (selisih +0,01 terhadap total resmi 731,29) dan{' '}
          <strong className="text-slate-700">{formatNumber(kpis.sumDistrictTahun)} ton/tahun</strong>{' '}
          (selisih -1,00 terhadap total resmi 266.920,85).
        </div>
      </div>

      <DisclaimerBanner title="Catatan Khusus Kecamatan Sukun" variant="warning">
        {dataset.tpaProfile.penegasanSukun} Data sampah masuk TPA Supit Urang per asal kecamatan saat ini masih berstatus <strong>NA</strong> karena rincian data operasional WIS belum terbuka secara publik.
      </DisclaimerBanner>
    </div>
  );
};
