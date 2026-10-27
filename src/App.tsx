import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Building2,
  Database,
  Factory,
  Globe,
  HardHat,
  LayoutDashboard,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { TRANSLATIONS } from './i18n/translations';
import { WorkerPortal } from './components/worker/WorkerPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';

const AppShell: React.FC = () => {
  const {
    persistenceMode,
    industry,
    setIndustry,
    language,
    setLanguage,
    setActiveRole,
    resetDemoData,
  } = useApp();

  const t = TRANSLATIONS[language];
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleGoWorker = () => {
    setActiveRole('worker');
    navigate('/worker');
  };

  const handleGoAdmin = () => {
    setActiveRole('admin');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Explicit Demo / Cloud Persistence Mode Banner */}
      <div
        role="region"
        aria-label="Persistence Mode Status"
        className="bg-navy-950 text-slate-200 text-xs px-4 py-2 border-b border-navy-800"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
            <span className="font-medium">
              {persistenceMode === 'LOCAL_DEMO'
                ? t.demoModeBanner
                : t.firebaseConnectedBanner}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 font-semibold">
              {t.sdgBadge}
            </span>
            <button
              type="button"
              onClick={resetDemoData}
              className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold underline focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Seed Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Global Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-navy-900 text-amber-400 flex items-center justify-center font-bold shadow-sm">
              <Shield className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-navy-950 block leading-none">
                {t.appName}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Decent Work & Safety Platform
              </span>
            </div>
          </div>

          {/* Industry Sector Switcher (Construction vs Manufacturing) */}
          <div
            role="group"
            aria-label={t.switchIndustryLabel}
            className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200"
          >
            <button
              type="button"
              onClick={() => setIndustry('construction')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                industry === 'construction'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              Construction
            </button>
            <button
              type="button"
              onClick={() => setIndustry('manufacturing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                industry === 'manufacturing'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Factory className="w-3.5 h-3.5" aria-hidden="true" />
              Manufacturing
            </button>
          </div>

          {/* Dual Interface Switcher (Worker Portal vs Employer Command Center) + Language Toggle */}
          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label="Interface Mode"
              className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200"
            >
              <button
                type="button"
                onClick={handleGoWorker}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  !isAdminRoute
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" aria-hidden="true" />
                {t.workerPortal}
              </button>
              <button
                type="button"
                onClick={handleGoAdmin}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  isAdminRoute
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
                {t.adminCommandCenter}
              </button>
            </div>

            <button
              type="button"
              aria-label="Switch Language Tamil or English"
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
            >
              <Globe className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/worker" replace />} />
          <Route path="/worker" element={<WorkerPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/worker" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-xs text-slate-500 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>FairShift Sentinel</strong> • UN SDG 8: Decent Work and Economic Growth
          </span>
          <span>
            Dual-Interface Workforce Safety & Pay Transparency • Construction & Manufacturing
          </span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
