import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BASELINE_DATASET_2024 } from '../data/baseline2024';
import { computeKpis } from '../engine/kpi';
import {
  DEFAULT_GOOGLE_SHEET_CSV_URL,
  downloadCsvFile,
  downloadWorkbookXlsx,
  fetchGoogleSheetCsvWithSummary,
  importWorkbookFileWithSummary,
} from '../engine/spreadsheet';
import { validateDataset } from '../engine/validator';
import type {
  ComputedKpis,
  SipasDataset,
  SyncSummary,
  ValidationReport,
} from '../types/sipas';
import { parseNullableNumber } from '../utils/csv';

export type NavTabId =
  | 'dashboard'
  | 'kecamatan'
  | 'neraca'
  | 'tpa'
  | 'kualitas'
  | 'laporan';

const TAB_TO_PATH: Record<NavTabId, string> = {
  dashboard: '/',
  kecamatan: '/kecamatan',
  neraca: '/neraca',
  tpa: '/tpa',
  kualitas: '/kualitas',
  laporan: '/laporan',
};

function pathToTab(pathname: string): NavTabId {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const match = (Object.entries(TAB_TO_PATH) as [NavTabId, string][]).find(
    ([, path]) => path === clean
  );
  return match ? match[0] : 'dashboard';
}

interface ToastState {
  message: string;
  tone: 'success' | 'info' | 'error';
}

interface DataContextValue {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  dataset: SipasDataset;
  kpis: ComputedKpis;
  validation: ValidationReport;
  syncing: boolean;
  syncError: string | null;
  lastSyncSummary: SyncSummary | null;
  defaultSheetUrl: string;
  toast: ToastState | null;
  showToast: (message: string, tone?: ToastState['tone']) => void;
  syncFromGoogleSheet: (url: string, target: 'timbulan' | 'neraca') => Promise<boolean>;
  importFromFile: (file: File) => Promise<boolean>;
  updateDistrictManual: (
    districtId: string,
    patch: { pendudukRaw: string; tonHariRaw: string; tonTahunRaw: string }
  ) => void;
  resetToBaseline: () => void;
  downloadXlsxTemplate: () => Promise<void>;
  downloadTimbulanCsv: () => void;
  downloadNeracaCsv: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<NavTabId>(() =>
    typeof window !== 'undefined' ? pathToTab(window.location.pathname) : 'dashboard'
  );
  const [dataset, setDataset] = useState<SipasDataset>(BASELINE_DATASET_2024);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncSummary, setLastSyncSummary] = useState<SyncSummary | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const setActiveTab = useCallback((tab: NavTabId) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const targetPath = TAB_TO_PATH[tab];
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(pathToTab(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = useCallback((message: string, tone: ToastState['tone'] = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3600);
  }, []);

  const kpis = useMemo(() => computeKpis(dataset), [dataset]);
  const validation = useMemo(() => validateDataset(dataset), [dataset]);

  const syncFromGoogleSheet = useCallback(
    async (url: string, target: 'timbulan' | 'neraca') => {
      setSyncing(true);
      setSyncError(null);
      try {
        const { dataset: next, summary } = await fetchGoogleSheetCsvWithSummary(
          url,
          target,
          dataset
        );
        setDataset(next);
        setLastSyncSummary(summary);
        if (summary.changedSourceFields === 0 && summary.derivedColumnNotices.length > 0) {
          showToast(
            'Sinkronisasi berhasil, namun hanya kolom rumus yang berubah (lihat catatan di bawah).',
            'info'
          );
        } else {
          showToast('Data Google Sheets berhasil ditarik dan divalidasi.', 'success');
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal sinkronisasi Google Sheets.';
        setSyncError(msg);
        showToast(msg, 'error');
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [dataset, showToast]
  );

  const importFromFile = useCallback(
    async (file: File) => {
      setSyncing(true);
      setSyncError(null);
      try {
        const { dataset: next, summary } = await importWorkbookFileWithSummary(file, dataset);
        setDataset(next);
        setLastSyncSummary(summary);
        showToast(`File "${file.name}" berhasil dimuat dan divalidasi.`, 'success');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal membaca file spreadsheet.';
        setSyncError(msg);
        showToast(msg, 'error');
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [dataset, showToast]
  );

  const updateDistrictManual = useCallback(
    (
      districtId: string,
      patch: { pendudukRaw: string; tonHariRaw: string; tonTahunRaw: string }
    ) => {
      setDataset((prev) => {
        const penduduk = parseNullableNumber(patch.pendudukRaw);
        const tonHari = parseNullableNumber(patch.tonHariRaw);
        const tonTahun = parseNullableNumber(patch.tonTahunRaw);

        const nextDistricts = prev.districts.map((d) => {
          if (d.id !== districtId) return d;
          const hasNA = penduduk === null || tonHari === null || tonTahun === null;
          return {
            ...d,
            penduduk,
            tonHari,
            tonTahun,
            statusData: (hasNA ? 'P' : 'A') as 'A' | 'P',
          };
        });

        const totalPenduduk = nextDistricts.every((d) => d.penduduk !== null)
          ? nextDistricts.reduce((s, d) => s + (d.penduduk ?? 0), 0)
          : null;
        const totalTonHari = nextDistricts.every((d) => d.tonHari !== null)
          ? Number(nextDistricts.reduce((s, d) => s + (d.tonHari ?? 0), 0).toFixed(2))
          : null;
        const totalTonTahun = nextDistricts.every((d) => d.tonTahun !== null)
          ? Number(nextDistricts.reduce((s, d) => s + (d.tonTahun ?? 0), 0).toFixed(2))
          : null;

        return {
          ...prev,
          metadata: {
            ...prev.metadata,
            sourceType: 'manual_edit',
            sourceLabel: 'Dataset Simulasi Penyuntingan Manual (Non-Baseline)',
            isOfficialBaseline: false,
            lastUpdated: new Date().toISOString().slice(0, 10),
            officialCityTotals: {
              penduduk: totalPenduduk,
              tonHari: totalTonHari,
              tonTahun: totalTonTahun,
            },
          },
          districts: nextDistricts,
        };
      });
      setSyncError(null);
      setLastSyncSummary(null);
      showToast('Perubahan tersimpan dan divalidasi ulang (nilai kosong otomatis menjadi NA).', 'info');
    },
    [showToast]
  );

  const resetToBaseline = useCallback(() => {
    setDataset(BASELINE_DATASET_2024);
    setSyncError(null);
    setLastSyncSummary(null);
    showToast('Dataset dikembalikan ke Data Resmi DLH Kota Malang 2024.', 'info');
  }, [showToast]);

  const downloadXlsxTemplate = useCallback(async () => {
    try {
      await downloadWorkbookXlsx(dataset, kpis, validation);
      showToast('Workbook .xlsx siap unggah ke Google Sheets berhasil diunduh.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat file .xlsx.';
      showToast(msg, 'error');
    }
  }, [dataset, kpis, validation, showToast]);

  const downloadTimbulanCsv = useCallback(() => {
    downloadCsvFile(
      `timbulan_kecamatan_${dataset.metadata.tahunDasar}.csv`,
      [
        'tahun',
        'kecamatan',
        'penduduk_jiwa',
        'timbulan_ton_hari',
        'timbulan_ton_tahun',
        'cakupan',
        'sumber',
        'status_data',
      ],
      dataset.districts.map((d) => [
        d.tahun,
        d.nama,
        d.penduduk,
        d.tonHari,
        d.tonTahun,
        d.cakupan,
        d.sumber,
        d.statusData,
      ])
    );
    showToast('CSV timbulan kecamatan berhasil diunduh.', 'success');
  }, [dataset, showToast]);

  const downloadNeracaCsv = useCallback(() => {
    const b = dataset.balance;
    downloadCsvFile(
      `neraca_sampah_${b.tahun}.csv`,
      ['tahun', 'komponen', 'volume_ton_tahun', 'cakupan', 'sumber'],
      [
        [b.tahun, 'Timbulan sampah', b.timbulanTahun, b.cakupan, b.sumber],
        [b.tahun, 'Pengurangan sampah', b.penguranganTahun, b.cakupan, b.sumber],
        [b.tahun, 'Penanganan sampah', b.penangananTahun, b.cakupan, b.sumber],
        [
          b.tahun,
          'Pengolahan menjadi bahan baku',
          b.pengolahanBahanBakuTahun,
          b.cakupan,
          b.sumber,
        ],
        [b.tahun, 'Pemrosesan akhir', b.pemrosesanAkhirTahun, b.cakupan, b.sumber],
        [b.tahun, 'Total sampah dikelola', b.totalDikelolaTahun, b.cakupan, b.sumber],
      ]
    );
    showToast('CSV neraca sampah berhasil diunduh.', 'success');
  }, [dataset, showToast]);

  const value = useMemo<DataContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      dataset,
      kpis,
      validation,
      syncing,
      syncError,
      lastSyncSummary,
      defaultSheetUrl: DEFAULT_GOOGLE_SHEET_CSV_URL,
      toast,
      showToast,
      syncFromGoogleSheet,
      importFromFile,
      updateDistrictManual,
      resetToBaseline,
      downloadXlsxTemplate,
      downloadTimbulanCsv,
      downloadNeracaCsv,
    }),
    [
      activeTab,
      setActiveTab,
      dataset,
      kpis,
      validation,
      syncing,
      syncError,
      lastSyncSummary,
      toast,
      showToast,
      syncFromGoogleSheet,
      importFromFile,
      updateDistrictManual,
      resetToBaseline,
      downloadXlsxTemplate,
      downloadTimbulanCsv,
      downloadNeracaCsv,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useSipasData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useSipasData must be used within DataProvider');
  }
  return ctx;
}
