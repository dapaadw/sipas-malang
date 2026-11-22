import React from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Cable,
} from 'lucide-react';
import type { DatasetMetadata, ValidationReport } from '../types/sipas';

interface WorkflowStepperProps {
  metadata: DatasetMetadata;
  validation: ValidationReport;
  compact?: boolean;
  onOpenPipeline?: () => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  metadata,
  validation,
  compact = false,
  onOpenPipeline,
}) => {
  const statusIcon =
    validation.overallStatus === 'valid' ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
    ) : validation.overallStatus === 'warning' ? (
      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
    ) : (
      <XCircle className="h-3.5 w-3.5 text-red-600" />
    );

  const statusText =
    validation.overallStatus === 'valid'
      ? `${validation.passCount}/6 Lolos`
      : validation.overallStatus === 'warning'
        ? `${validation.warningCount} Peringatan`
        : `${validation.errorCount} Galat`;

  const steps = [
    {
      no: '1',
      title: 'Sumber Data',
      desc: metadata.isOfficialBaseline
        ? 'DLH 2024 • BPS 2025 • RPJMD • Perda 7/2021 • TPA'
        : metadata.sourceLabel,
      badge: `Tahun ${metadata.tahunDasar}`,
      icon: Database,
      tone: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      no: '2',
      title: 'Pengumpulan & Validasi',
      desc: 'Cek tahun, satuan, cakupan wilayah, sumber & penjagaan NA ≠ 0',
      badge: statusText,
      badgeIcon: statusIcon,
      icon: ShieldCheck,
      tone:
        validation.overallStatus === 'error'
          ? 'bg-red-50 text-red-700 border-red-200'
          : validation.overallStatus === 'warning'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      no: '3',
      title: 'Database Google Sheets',
      desc: 'Tabel terstandar (9 sheet) siap sinkronisasi & ekspor .xlsx/.csv',
      badge: 'Terstandar',
      icon: FileSpreadsheet,
      tone: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      no: '4',
      title: 'Olah & Visualisasi',
      desc: 'Kalkulasi 7 KPI otomatis & visualisasi Looker Studio / Recharts',
      badge: '7 KPI Aktif',
      icon: BarChart3,
      tone: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      no: '5',
      title: 'Dashboard SIPAS-Malang',
      desc: 'Evaluasi timbulan, neraca, TPA Supit Urang & kualitas data',
      badge: 'Siap Evaluasi',
      icon: LayoutDashboard,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <div className="print-card rounded-2xl border border-[#E5EAE7] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Alur Kerja Sistem SIPAS-Malang
          </h3>
          <p className="text-xs text-slate-500">
            Pipeline tata kelola data terbuka dari sumber resmi hingga dashboard keputusan
          </p>
        </div>
        {onOpenPipeline && (
          <button
            type="button"
            onClick={onOpenPipeline}
            className="no-print inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Kelola Sinkronisasi &amp; Validasi
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className={`grid gap-3 ${compact ? 'grid-cols-1 md:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'}`}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.no} className="relative flex items-stretch">
              <div className="flex w-full flex-col justify-between rounded-xl border border-slate-200/80 bg-[#F8FAF9] p-3.5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold ${step.tone}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                      {step.badgeIcon}
                      {step.badge}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs font-bold text-slate-900">
                    {step.no}. {step.title}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">
                    {step.desc}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center px-0.5 text-slate-300">
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-3.5 py-2.5 text-xs text-slate-600">
          <Cable className="h-4 w-4 shrink-0 text-slate-500" />
          <span>
            <strong className="font-semibold text-slate-800">
              Pengembangan Lanjutan (Belum Aktif):
            </strong>{' '}
            Integrasi data penimbangan aktual per kecamatan dari <em>Waste Information System (WIS)</em> TPA Supit Urang menunggu izin akses resmi dari DLH Kota Malang (saat ini berstatus <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[11px]">NA</code>).
          </span>
        </div>
      )}
    </div>
  );
};
