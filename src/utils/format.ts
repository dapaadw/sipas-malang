export function isNA(val: unknown): val is null | undefined {
  if (val === null || val === undefined) return true;
  if (typeof val === 'number') return !Number.isFinite(val);
  if (typeof val === 'string') {
    const trimmed = val.trim().toLowerCase();
    return (
      trimmed === '' ||
      trimmed === 'na' ||
      trimmed === 'n/a' ||
      trimmed === '-' ||
      trimmed === 'null' ||
      trimmed === 'tidak tersedia'
    );
  }
  return false;
}

export function formatNumber(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return 'NA';
  }
  return val.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatInt(val: number | null | undefined): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return 'NA';
  }
  return Math.round(val).toLocaleString('id-ID');
}

export function formatPercent(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return 'NA';
  }
  return `${formatNumber(val, decimals)}%`;
}
