import { describe, expect, it } from 'vitest';
import { BASELINE_DATASET_2024 } from '../../data/baseline2024';
import { parseCsv } from '../../utils/csv';
import {
  appendCacheBuster,
  applyTimbulanRows,
  DEFAULT_GOOGLE_SHEET_CSV_URL,
  inspectTimbulanSync,
  normalizeGoogleSheetCsvUrl,
} from '../spreadsheet';

describe('Google Sheets URL normalization & cache-busting', () => {
  it('provides the configured default public Google Sheets CSV URL', () => {
    expect(DEFAULT_GOOGLE_SHEET_CSV_URL).toContain('docs.google.com/spreadsheets/d/e/');
    expect(DEFAULT_GOOGLE_SHEET_CSV_URL).toContain('output=csv');
  });

  it('keeps /pub?output=csv URLs intact and converts /edit#gid= links', () => {
    const pubUrl =
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vS9z1lY8vzHXbKd1x3fKozYEr2BXFiE6Yo_o4RBM_bCW5NUvPKUnE8HMvFccJz8Ow/pub?output=csv';
    expect(normalizeGoogleSheetCsvUrl(pubUrl)).toBe(pubUrl);

    const editUrl =
      'https://docs.google.com/spreadsheets/d/abc123XYZ/edit#gid=456789';
    expect(normalizeGoogleSheetCsvUrl(editUrl)).toBe(
      'https://docs.google.com/spreadsheets/d/abc123XYZ/export?format=csv&gid=456789'
    );

    expect(() => normalizeGoogleSheetCsvUrl('')).toThrow();
    expect(() => normalizeGoogleSheetCsvUrl('not-a-url')).toThrow();
  });

  it('appends _ts cache-buster cleanly alongside existing query params', () => {
    const base =
      'https://docs.google.com/spreadsheets/d/e/test/pub?output=csv';
    const busted = appendCacheBuster(base, 1795355880000);
    expect(busted).toBe(
      'https://docs.google.com/spreadsheets/d/e/test/pub?output=csv&_ts=1795355880000'
    );
  });
});

describe('inspectTimbulanSync & derived column notices', () => {
  it('detects when only derived kontribusi_persen changed without raw tonnage change', () => {
    const csv = [
      'tahun,kecamatan,penduduk_jiwa,timbulan_ton_hari,timbulan_ton_tahun,kontribusi_persen,per_kapita_kg_hari,sumber',
      '2024,Blimbing,182851,153.04,55859.17,20.99,0.84,DLH 2024',
      '2024,Kedungkandang,209375,164.01,59862.31,22.43,0.78,DLH 2024',
      '2024,Klojen,93990,116.39,42481.05,15.92,1.24,DLH 2024',
      '2024,Lowokwaru,164106,144.15,52614.75,19.71,0.88,DLH 2024',
      '2024,Sukun,196860,153.71,56102.57,21.02,0.78,DLH 2024',
    ].join('\n');

    const rows = parseCsv(csv);
    const nextDataset = applyTimbulanRows(rows, BASELINE_DATASET_2024, {
      sourceType: 'google_sheets',
      sourceLabel: 'Test Sheet',
    });

    const summary = inspectTimbulanSync(
      rows,
      BASELINE_DATASET_2024.districts,
      nextDataset
    );

    expect(summary.rowsRead).toBe(5);
    expect(summary.changedSourceFields).toBe(0);
    expect(summary.derivedColumnNotices).toHaveLength(1);
    expect(summary.derivedColumnNotices[0]).toContain('Blimbing');
    expect(summary.derivedColumnNotices[0]).toContain('kontribusi_persen');
  });

  it('counts raw field updates when timbulan_ton_hari or timbulan_ton_tahun changes', () => {
    const csv = [
      'tahun,kecamatan,penduduk_jiwa,timbulan_ton_hari,timbulan_ton_tahun,sumber',
      '2024,Blimbing,182851,200.00,73000.00,DLH 2024',
      '2024,Kedungkandang,209375,164.01,59862.31,DLH 2024',
      '2024,Klojen,93990,116.39,42481.05,DLH 2024',
      '2024,Lowokwaru,164106,144.15,52614.75,DLH 2024',
      '2024,Sukun,196860,153.71,56102.57,DLH 2024',
    ].join('\n');

    const rows = parseCsv(csv);
    const nextDataset = applyTimbulanRows(rows, BASELINE_DATASET_2024, {
      sourceType: 'google_sheets',
      sourceLabel: 'Test Sheet',
    });

    const summary = inspectTimbulanSync(
      rows,
      BASELINE_DATASET_2024.districts,
      nextDataset
    );

    expect(summary.changedSourceFields).toBe(2);
    expect(summary.derivedColumnNotices).toHaveLength(0);
  });
});
