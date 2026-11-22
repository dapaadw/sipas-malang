import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface DisclaimerBannerProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'warning';
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  title,
  children,
  variant = 'info',
}) => {
  const isWarning = variant === 'warning';

  return (
    <div
      className={`print-card flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm leading-relaxed ${
        isWarning
          ? 'border-amber-200 bg-amber-50/80 text-amber-950'
          : 'border-emerald-200/80 bg-emerald-50/60 text-emerald-950'
      }`}
    >
      {isWarning ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      ) : (
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
      )}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-[13px] opacity-90">{children}</div>
      </div>
    </div>
  );
};
