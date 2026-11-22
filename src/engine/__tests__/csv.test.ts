import { describe, expect, it } from 'vitest';
import { parseCsv, parseNullableNumber, toCsv } from '../../utils/csv';
import { formatInt, formatNumber, formatPercent } from '../../utils/format';

describe('parseNullableNumber & NA preservation', () => {
  it('never converts NA, N/A, dash, or blank string into 0', () => {
    expect(parseNullableNumber('')).toBeNull();
    expect(parseNullableNumber('   ')).toBeNull();
    expect(parseNullableNumber('NA')).toBeNull();
    expect(parseNullableNumber('na')).toBeNull();
    expect(parseNullableNumber('N/A')).toBeNull();
    expect(parseNullableNumber('-')).toBeNull();
    expect(parseNullableNumber('Tidak tersedia')).toBeNull();
    expect(parseNullableNumber(null)).toBeNull();
    expect(parseNullableNumber(undefined)).toBeNull();
    expect(parseNullableNumber(Number.NaN)).toBeNull();
  });

  it('parses legitimate zero as 0', () => {
    expect(parseNullableNumber(0)).toBe(0);
    expect(parseNullableNumber('0')).toBe(0);
    expect(parseNullableNumber('0,00')).toBe(0);
  });

  it('parses Indonesian and standard decimal formats cleanly', () => {
    expect(parseNullableNumber('55.859,17')).toBeCloseTo(55859.17, 2);
    expect(parseNullableNumber('153,04')).toBeCloseTo(153.04, 2);
    expect(parseNullableNumber('153.04')).toBeCloseTo(153.04, 2);
    expect(parseNullableNumber('55,859.17')).toBeCloseTo(55859.17, 2);
    expect(parseNullableNumber('182851')).toBe(182851);
  });
});

describe('parseCsv & toCsv', () => {
  it('parses RFC-4180 CSV with quoted commas and BOM', () => {
    const csv =
      '\uFEFFtahun,kecamatan,penduduk_jiwa,timbulan_ton_hari,sumber\r\n' +
      '2024,Kedungkandang,209375,"164,01","DLH Kota Malang, Data 2024"\r\n' +
      '2024,Klojen,93990,NA,"DLH Kota Malang, Data 2024"\r\n';

    const rows = parseCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].kecamatan).toBe('Kedungkandang');
    expect(rows[0].sumber).toBe('DLH Kota Malang, Data 2024');
    expect(parseNullableNumber(rows[0].timbulan_ton_hari)).toBeCloseTo(164.01, 2);
    expect(parseNullableNumber(rows[1].timbulan_ton_hari)).toBeNull();
  });

  it('parses semicolon-delimited Indonesian Excel CSV', () => {
    const csv =
      'tahun;kecamatan;penduduk_jiwa;timbulan_ton_hari\n' +
      '2024;Sukun;196860;153,71\n';

    const rows = parseCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].kecamatan).toBe('Sukun');
    expect(parseNullableNumber(rows[0].timbulan_ton_hari)).toBeCloseTo(153.71, 2);
  });

  it('serializes null as NA in toCsv and formatters', () => {
    const output = toCsv(['kecamatan', 'ton_hari'], [['Sukun', null], ['Klojen', 116.39]]);
    expect(output).toContain('Sukun,NA');
    expect(formatNumber(null)).toBe('NA');
    expect(formatInt(null)).toBe('NA');
    expect(formatPercent(null)).toBe('NA');
  });
});
