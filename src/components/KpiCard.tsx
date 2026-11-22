import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  tone?: 'emerald' | 'blue' | 'amber' | 'slate';
  badge?: string;
}

const TONE_MAP = {
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    accent: 'border-t-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  blue: {
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    accent: 'border-t-blue-600',
    badge: 'bg-blue-50 text-blue-700',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    accent: 'border-t-amber-500',
    badge: 'bg-amber-50 text-amber-700',
  },
  slate: {
    iconBg: 'bg-slate-100 text-slate-600 border-slate-200',
    accent: 'border-t-slate-400',
    badge: 'bg-slate-100 text-slate-600',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  icon: Icon,
  tone = 'emerald',
  badge,
}) => {
  const styles = TONE_MAP[tone];
  const isNAValue = value === 'NA';

  return (
    <div
      className={`print-card rounded-2xl border border-[#E5EAE7] border-t-[3px] ${styles.accent} bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            {isNAValue ? (
              <span
                title="Data tidak tersedia (NA ≠ 0)"
                className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-0.5 text-xl font-bold text-slate-600"
              >
                NA
              </span>
            ) : (
              <span className="tabular-nums text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
                {value}
              </span>
            )}
            {unit && !isNAValue && (
              <span className="text-xs font-medium text-slate-500">{unit}</span>
            )}
          </div>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${styles.iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          {subtitle && (
            <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>
          )}
          {badge && (
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${styles.badge}`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
