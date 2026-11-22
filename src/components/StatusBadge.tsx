import React from 'react';
import type { DataStatus } from '../types/sipas';

interface StatusBadgeProps {
  status: DataStatus;
  compact?: boolean;
  showCode?: boolean;
}

const CONFIG: Record<
  DataStatus,
  { label: string; classes: string; tooltip: string }
> = {
  A: {
    label: 'Tersedia',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tooltip: 'Tersedia (A): Informasi tersedia lengkap dan dapat ditelusuri melalui dokumen publik.',
  },
  P: {
    label: 'Parsial',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    tooltip: 'Parsial (P): Informasi tersedia sebagian atau baru di tingkat kota, belum merata per kecamatan.',
  },
  NA: {
    label: 'NA',
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
    tooltip: 'Tidak Tersedia (NA): Belum ada di sumber publik. Ditampilkan sebagai NA, bukan nilai nol (0).',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  compact = false,
  showCode = false,
}) => {
  const cfg = CONFIG[status];
  const text = compact
    ? status
    : showCode && status !== 'NA'
      ? `${cfg.label} (${status})`
      : cfg.label;

  return (
    <span
      title={cfg.tooltip}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight ${cfg.classes}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'A'
            ? 'bg-emerald-600'
            : status === 'P'
              ? 'bg-amber-500'
              : 'bg-slate-400'
        }`}
      />
      {text}
    </span>
  );
};
