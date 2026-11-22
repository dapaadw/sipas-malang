import React, { Suspense, lazy } from 'react';
import { Layout } from './components/Layout';
import { DataProvider, useSipasData } from './context/DataContext';
import { DashboardPage } from './pages/DashboardPage';

const KecamatanPage = lazy(() =>
  import('./pages/KecamatanPage').then((m) => ({ default: m.KecamatanPage }))
);
const NeracaPage = lazy(() =>
  import('./pages/NeracaPage').then((m) => ({ default: m.NeracaPage }))
);
const TpaFasilitasPage = lazy(() =>
  import('./pages/TpaFasilitasPage').then((m) => ({ default: m.TpaFasilitasPage }))
);
const KualitasDataPage = lazy(() =>
  import('./pages/KualitasDataPage').then((m) => ({ default: m.KualitasDataPage }))
);
const LaporanPage = lazy(() =>
  import('./pages/LaporanPage').then((m) => ({ default: m.LaporanPage }))
);

const PageLoader: React.FC = () => (
  <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-[#E5EAE7] bg-white p-8 text-sm font-medium text-slate-500">
    Memuat modul SIPAS-Malang...
  </div>
);

const ActiveView: React.FC = () => {
  const { activeTab } = useSipasData();

  switch (activeTab) {
    case 'dashboard':
      return <DashboardPage />;
    case 'kecamatan':
      return (
        <Suspense fallback={<PageLoader />}>
          <KecamatanPage />
        </Suspense>
      );
    case 'neraca':
      return (
        <Suspense fallback={<PageLoader />}>
          <NeracaPage />
        </Suspense>
      );
    case 'tpa':
      return (
        <Suspense fallback={<PageLoader />}>
          <TpaFasilitasPage />
        </Suspense>
      );
    case 'kualitas':
      return (
        <Suspense fallback={<PageLoader />}>
          <KualitasDataPage />
        </Suspense>
      );
    case 'laporan':
      return (
        <Suspense fallback={<PageLoader />}>
          <LaporanPage />
        </Suspense>
      );
    default:
      return <DashboardPage />;
  }
};

export function App() {
  return (
    <DataProvider>
      <Layout>
        <ActiveView />
      </Layout>
    </DataProvider>
  );
}

export default App;
