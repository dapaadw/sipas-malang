import { describe, expect, it } from 'vitest';
import { BASELINE_DATASET_2024 } from '../../data/baseline2024';
import type { SipasDataset } from '../../types/sipas';
import { validateDataset } from '../validator';

describe('validateDataset', () => {
  it('validates official 2024 baseline cleanly with documented rounding & 2 NA variables', () => {
    const report = validateDataset(BASELINE_DATASET_2024);

    expect(report.overallStatus).toBe('valid');
    expect(report.errorCount).toBe(0);
    expect(report.warningCount).toBe(0);
    expect(report.passCount).toBe(6);
    expect(report.naCount).toBe(2);

    const recon = report.checks.find((c) => c.id === 'reconciliation');
    expect(recon?.status).toBe('pass');
    expect(recon?.details.join(' ')).toContain('+0,01');
    expect(recon?.details.join(' ')).toContain('-1,00');

    const naGuard = report.checks.find((c) => c.id === 'na_guard');
    expect(naGuard?.status).toBe('pass');
    expect(naGuard?.summary).toContain('NA');
  });

  it('flags unit mismatch when ton/hari x 365 diverges strongly from ton/tahun', () => {
    const badUnits: SipasDataset = {
      ...BASELINE_DATASET_2024,
      districts: BASELINE_DATASET_2024.districts.map((d) =>
        d.nama === 'Blimbing' ? { ...d, tonHari: 900 } : d
      ),
    };

    const report = validateDataset(badUnits);
    const unitsCheck = report.checks.find((c) => c.id === 'units');
    expect(unitsCheck?.status).toBe('error');
    expect(report.overallStatus).toBe('error');
  });

  it('flags missing district in scope check', () => {
    const missingDistrict: SipasDataset = {
      ...BASELINE_DATASET_2024,
      districts: BASELINE_DATASET_2024.districts.filter((d) => d.nama !== 'Klojen'),
    };

    const report = validateDataset(missingDistrict);
    const scopeCheck = report.checks.find((c) => c.id === 'scope');
    expect(scopeCheck?.status).toBe('error');
    expect(scopeCheck?.details.join(' ')).toContain('Klojen');
  });

  it('flags year mismatch as error', () => {
    const wrongYear: SipasDataset = {
      ...BASELINE_DATASET_2024,
      balance: { ...BASELINE_DATASET_2024.balance, tahun: 2023 },
    };

    const report = validateDataset(wrongYear);
    const yearCheck = report.checks.find((c) => c.id === 'year');
    expect(yearCheck?.status).toBe('error');
  });

  it('reports warning while preserving null numeric cells in NA guard', () => {
    const withNullCell: SipasDataset = {
      ...BASELINE_DATASET_2024,
      districts: BASELINE_DATASET_2024.districts.map((d) =>
        d.nama === 'Sukun' ? { ...d, tonHari: null } : d
      ),
    };

    const report = validateDataset(withNullCell);
    const naGuard = report.checks.find((c) => c.id === 'na_guard');
    expect(naGuard?.status).toBe('warning');
    expect(naGuard?.details.join(' ')).toContain('Sukun: Timbulan ton/hari = NA');
    expect(report.naCount).toBe(3);
  });
});
