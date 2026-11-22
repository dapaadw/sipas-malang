import { describe, expect, it } from 'vitest';
import { BASELINE_DATASET_2024 } from '../../data/baseline2024';
import type { SipasDataset } from '../../types/sipas';
import { computeKpis } from '../kpi';

describe('computeKpis on Official DLH 2024 Baseline', () => {
  const kpis = computeKpis(BASELINE_DATASET_2024);

  it('matches Tab 1 Tabel 1 official city totals', () => {
    expect(kpis.totalPenduduk).toBe(847182);
    expect(kpis.totalTimbulanHari).toBe(731.29);
    expect(kpis.totalTimbulanTahun).toBe(266920.85);
    expect(kpis.sumDistrictHari).toBeCloseTo(731.3, 2);
    expect(kpis.sumDistrictTahun).toBeCloseTo(266919.85, 2);
  });

  it('matches Tab 1 Tabel 2 Neraca percentages', () => {
    expect(kpis.tingkatPenguranganPersen).toBeCloseTo(28.32, 2);
    expect(kpis.tingkatPenangananPersen).toBeCloseTo(70.7, 2);
    expect(kpis.tingkatTerkelolaPersen).toBeCloseTo(99.02, 2);
    expect(kpis.proporsiPengolahanBahanBakuPersen).toBeCloseTo(3.61, 2);
    expect(kpis.proporsiPemrosesanAkhirPersen).toBeCloseTo(67.09, 2);
    expect(kpis.belumTerkelolaTahun).toBeCloseTo(2606.11, 2);
    expect(kpis.belumTerkelolaPersen).toBeCloseTo(0.98, 2);
  });

  it('matches district contribution percentages & per capita insights', () => {
    const kedungkandang = kpis.districtKpis.find((d) => d.nama === 'Kedungkandang');
    const klojen = kpis.districtKpis.find((d) => d.nama === 'Klojen');
    const blimbing = kpis.districtKpis.find((d) => d.nama === 'Blimbing');
    const lowokwaru = kpis.districtKpis.find((d) => d.nama === 'Lowokwaru');
    const sukun = kpis.districtKpis.find((d) => d.nama === 'Sukun');

    expect(kedungkandang?.kontribusiPersen).toBeCloseTo(22.43, 2);
    expect(klojen?.kontribusiPersen).toBeCloseTo(15.92, 2);
    expect(blimbing?.kontribusiPersen).toBeCloseTo(20.93, 2);
    expect(lowokwaru?.kontribusiPersen).toBeCloseTo(19.71, 2);
    expect(sukun?.kontribusiPersen).toBeCloseTo(21.02, 2);

    expect(kpis.tertinggiTimbulan?.nama).toBe('Kedungkandang');
    expect(kpis.terendahTimbulan?.nama).toBe('Klojen');
    expect(kpis.tertinggiPerKapita?.nama).toBe('Klojen');
    expect(klojen?.perKapitaKgHari).toBeCloseTo(1.24, 2);
  });

  it('counts 148 city facilities and 9 data inventory variables accurately', () => {
    expect(kpis.totalFasilitas).toBe(148);
    expect(kpis.variableCounts).toEqual({
      total: 9,
      tersedia: 5,
      parsial: 2,
      na: 2,
    });
  });

  it('propagates null as null (NA) rather than 0 when metrics are missing', () => {
    const modified: SipasDataset = {
      ...BASELINE_DATASET_2024,
      metadata: {
        ...BASELINE_DATASET_2024.metadata,
        isOfficialBaseline: false,
      },
      districts: BASELINE_DATASET_2024.districts.map((d) =>
        d.nama === 'Klojen' ? { ...d, tonHari: null, tonTahun: null } : d
      ),
      balance: {
        ...BASELINE_DATASET_2024.balance,
        penguranganTahun: null,
      },
    };

    const customKpis = computeKpis(modified);
    const klojen = customKpis.districtKpis.find((d) => d.nama === 'Klojen');
    expect(klojen?.kontribusiPersen).toBeNull();
    expect(klojen?.perKapitaKgHari).toBeNull();
    expect(customKpis.tingkatPenguranganPersen).toBeNull();
  });
});
