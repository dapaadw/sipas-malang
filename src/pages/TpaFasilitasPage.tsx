import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Cable,
  CheckCircle2,
  Factory,
  MapPin,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { MalangMap } from '../components/MalangMap';
import { StatusBadge } from '../components/StatusBadge';
import { useSipasData } from '../context/DataContext';
import { formatInt, formatNumber } from '../utils/format';

export const TpaFasilitasPage: React.FC = () => {
  const { dataset, kpis } = useSipasData();
  const tpa = dataset.tpaProfile;

  const facilityChartData = dataset.facilities.map((f) => ({
    name: f.jenisFasilitas,
    unit: f.jumlahUnit ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* TPA Hero Profile Card */}
      <div className="print-card rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-900">
              <MapPin className="h-3.5 w-3.5" />
              Objek Studi Kasus Fasilitas Pemrosesan Akhir
            </div>
            <h2 className="mt-3 text-xl font-extrabold text-slate-900 sm:text-2xl">
              {tpa.nama}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{tpa.alamat}</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-right">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Beban Pemrosesan Akhir Kota ({dataset.balance.tahun})
            </span>
            <span className="mt-0.5 block tabular-nums text-xl font-extrabold text-amber-800">
              {formatNumber(dataset.balance.pemrosesanAkhirTahun)} ton/thn
            </span>
            <span className="block text-[11px] text-slate-500">
              Melayani 5 kecamatan Kota Malang
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 text-xs">
            <span className="font-semibold text-slate-500">Cakupan Layanan</span>
            <p className="mt-1 font-bold text-slate-900">{tpa.cakupanLayanan}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 text-xs">
            <span className="font-semibold text-slate-500">Sistem Pencatatan Eksisting</span>
            <p className="mt-1 font-bold text-slate-900">{tpa.sistemPencatatan}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 text-xs">
            <span className="font-semibold text-slate-500">Data Masuk per Kecamatan (WIS)</span>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={tpa.statusIntegrasiWis} showCode />
              <span className="text-slate-600">Belum terbuka publik</span>
            </div>
          </div>
        </div>
      </div>

      <DisclaimerBanner title="Pemisahan Wilayah: Kec. Sukun vs TPA Supit Urang" variant="warning">
        {tpa.penegasanSukun}
      </DisclaimerBanner>

      {/* Map + WIS vs SIPAS-Malang Comparison */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-6 space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            Lokasi Geografis TPA Supit Urang
          </h3>
          <p className="text-xs text-slate-500">
            Koordinat: {tpa.lat}, {tpa.lng} (Kel. {tpa.kelurahan}, Kec. {tpa.kecamatan})
          </p>
          <MalangMap
            districts={dataset.districts}
            districtKpis={kpis.districtKpis}
            tpaProfile={tpa}
            focusMode="tpa"
            heightClass="h-[340px]"
          />
        </div>

        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* WIS vs SIPAS Comparison Card */}
          <div className="print-card rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                Posisi Sistem: WIS vs SIPAS-Malang
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              SIPAS-Malang <strong>tidak menggantikan</strong> Waste Information System (WIS) di TPA Supit Urang.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4">
                <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                  WIS (Operasional TPA)
                </span>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {tpa.peranWis}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4">
                <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  SIPAS-Malang (Dashboard Analitik)
                </span>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {tpa.peranSipas}
                </p>
              </div>
            </div>
          </div>

          {/* WIS Integration Roadmap */}
          <div className="print-card rounded-2xl border border-dashed border-slate-300 bg-[#F8FAF9] p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cable className="h-4 w-4 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Kebutuhan Integrasi Lanjutan Jembatan Timbang (WIS)
                </h4>
              </div>
              <StatusBadge status={tpa.statusIntegrasiWis} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {tpa.syaratIntegrasiWis}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
              <span className="rounded-lg bg-white px-2.5 py-1 ring-1 ring-slate-200">
                1. Izin Akses Data DLH
              </span>
              <span className="rounded-lg bg-white px-2.5 py-1 ring-1 ring-slate-200">
                2. Atribut Asal Kecamatan per Ritase
              </span>
              <span className="rounded-lg bg-white px-2.5 py-1 ring-1 ring-slate-200">
                3. Ekspor Terjadwal ke Google Sheets / API
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 148 City Facilities Inventory */}
      <div className="print-card rounded-2xl border border-[#E5EAE7] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                Inventaris Fasilitas Pengolahan Sampah Tingkat Kota ({formatInt(kpis.totalFasilitas)} Unit)
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Sumber: Neraca Pengelolaan Sampah DLH Kota Malang {dataset.balance.tahun} · Data merupakan inventaris total kota, belum dibagi per kecamatan.
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
            Cakupan: Tingkat Kota Malang (Bukan Per Kecamatan)
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={facilityChartData}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={185}
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(v) => (typeof v === 'number' ? `${v} unit` : 'NA')}
                />
                <Bar dataKey="unit" fill="#15803D" radius={[0, 8, 8, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-6 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAF9] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">No.</th>
                  <th className="px-4 py-2.5">Jenis Fasilitas</th>
                  <th className="px-4 py-2.5 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataset.facilities.map((f, idx) => (
                  <tr key={f.id}>
                    <td className="px-4 py-2.5 text-slate-500 tabular-nums">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{f.jenisFasilitas}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold text-slate-900">
                      {f.jumlahUnit !== null ? `${formatInt(f.jumlahUnit)} unit` : 'NA'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-emerald-50/70 font-bold text-slate-900">
                  <td className="px-4 py-2.5" colSpan={2}>
                    Total Inventaris Fasilitas Tingkat Kota
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-emerald-800">
                    {kpis.totalFasilitas !== null ? `${formatInt(kpis.totalFasilitas)} unit` : 'NA'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RPJMD Challenges & Environmental Risks */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="print-card rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Tantangan Pengelolaan Sampah (RPJMD 2025–2029)
            </h3>
          </div>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-700">
            {tpa.tantanganRpjmd.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="print-card rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h3 className="text-base font-bold text-slate-900">
              Risiko Lingkungan &amp; Kebutuhan Monitoring TPA
            </h3>
          </div>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-700">
            {tpa.risikoLingkungan.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
            Sesuai kajian, variabel kualitas lingkungan (air, udara, tanah) masih berstatus <strong>Parsial (P)</strong> dan menjadi sasaran Program Prioritas 4: Monitoring Lingkungan.
          </p>
        </div>
      </div>
    </div>
  );
};
