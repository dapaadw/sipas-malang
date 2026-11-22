import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Download,
  Factory,
  FileText,
  LayoutDashboard,
  Menu,
  Recycle,
  Scale,
  ShieldCheck,
  AlertTriangle,
  X,
  XCircle,
} from 'lucide-react';
import { useSipasData, type NavTabId } from '../context/DataContext';

const NAV_ITEMS: {
  id: NavTabId;
  label: string;
  shortDesc: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Utama',
    shortDesc: 'Ringkasan & peta kota',
    icon: LayoutDashboard,
  },
  {
    id: 'kecamatan',
    label: 'Perbandingan Kecamatan',
    shortDesc: 'Komparasi 5 kecamatan',
    icon: BarChart3,
  },
  {
    id: 'neraca',
    label: 'Neraca Sampah',
    shortDesc: 'Pengurangan & TPA',
    icon: Scale,
  },
  {
    id: 'tpa',
    label: 'TPA Supit Urang & Fasilitas',
    shortDesc: 'Profil WIS & 148 unit',
    icon: Factory,
  },
  {
    id: 'kualitas',
    label: 'Ketersediaan & Validasi Data',
    shortDesc: 'Alur kerja, NA & 5 pilar',
    icon: ShieldCheck,
  },
  {
    id: 'laporan',
    label: 'Laporan & Strategi',
    shortDesc: 'SWOT-TOWS & cetak PDF',
    icon: FileText,
  },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    dataset,
    validation,
    toast,
    downloadXlsxTemplate,
  } = useSipasData();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentNav = NAV_ITEMS.find((n) => n.id === activeTab) ?? NAV_ITEMS[0];

  const handleSelectTab = (id: NavTabId) => {
    setActiveTab(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ValidationPill = () => {
    if (validation.overallStatus === 'valid') {
      return (
        <button
          type="button"
          onClick={() => handleSelectTab('kualitas')}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Validasi {validation.passCount}/6 Lolos
        </button>
      );
    }
    if (validation.overallStatus === 'warning') {
      return (
        <button
          type="button"
          onClick={() => handleSelectTab('kualitas')}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {validation.warningCount} Peringatan Validasi
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => handleSelectTab('kualitas')}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
      >
        <XCircle className="h-3.5 w-3.5" />
        {validation.errorCount} Galat Validasi
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-[#0F3D2B] px-3.5 py-5 text-white">
      <div>
        <div className="flex items-center justify-between border-b border-white/10 px-2 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-300/30">
              <Recycle className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-white">
                SIPAS-Malang
              </span>
              <span className="block text-[11px] font-medium text-emerald-200/80">
                Smart Environment · Kota Malang
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-emerald-100 hover:bg-white/10 lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-5 space-y-1.5" aria-label="Navigasi SIPAS-Malang">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  active
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-emerald-100/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${
                    active ? 'text-emerald-700' : 'text-emerald-300/80'
                  }`}
                />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold">
                    {item.label}
                  </div>
                  <div
                    className={`truncate text-[11px] ${
                      active ? 'text-emerald-700/80' : 'text-emerald-200/60'
                    }`}
                  >
                    {item.shortDesc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
        <div className="rounded-xl bg-white/8 p-3 text-xs">
          <div className="flex items-center justify-between text-emerald-200/80">
            <span>Status Sumber</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-300">
              {dataset.metadata.tahunDasar}
            </span>
          </div>
          <p className="mt-1 font-semibold text-white leading-snug">
            {dataset.metadata.isOfficialBaseline
              ? 'Baseline Resmi DLH 2024'
              : 'Dataset Kustom Aktif'}
          </p>
          <p className="mt-1 text-[11px] text-emerald-100/70">
            Bukan pengganti WIS TPA Supit Urang
          </p>
        </div>
        <p className="px-1 text-[11px] leading-relaxed text-emerald-200/60">
          Project Akhir MK Teknologi Smart City · FILKOM Universitas Brawijaya
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-[264px] lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-[272px] max-w-[85vw]">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="print-full lg:pl-[264px]">
        <header className="no-print sticky top-0 z-20 border-b border-[#E5EAE7] bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
                aria-label="Buka navigasi"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                  {currentNav.label}
                </h1>
                <p className="text-xs text-slate-500">
                  {dataset.metadata.sourceLabel}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ValidationPill />
              <button
                type="button"
                onClick={downloadXlsxTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Template</span> .xlsx
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Toast Feedback */}
      {toast && (
        <div
          role="status"
          className={`no-print fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-900'
              : toast.tone === 'info'
                ? 'border-blue-200 bg-blue-50 text-blue-900'
                : 'border-emerald-200 bg-emerald-900 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};
