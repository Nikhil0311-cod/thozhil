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
import { LANGUAGE_OPTIONS, TRANSLATIONS } from './i18n/translations';
import { WorkerPortal } from './components/worker/WorkerPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Language } from './types/domain';

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
      {/* Persistence & SDG Status Bar */}
      <div
        role="region"
        aria-label="Persistence Mode Status"
        className="bg-slate-950 text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
            <span>
              {persistenceMode === 'LOCAL_DEMO'
                ? t.demoModeBanner
                : t.firebaseConnectedBanner}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-medium border border-slate-700">
              {t.sdgBadge}
            </span>
            <button
              type="button"
              onClick={resetDemoData}
              className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium underline focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-1"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              {t.resetSeedBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Main Operational Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Identity: THOZHIL — Work with dignity. */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-white block leading-none">
                {t.appName}
              </span>
              <span className="text-xs text-slate-300 block mt-0.5">
                {t.tagline}
              </span>
            </div>
          </div>

          {/* Controls: Industry Switcher, View Switcher, Trilingual Language Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Industry Sector Switcher */}
            <div
              role="group"
              aria-label={t.switchIndustryLabel}
              className="flex items-center bg-slate-800 p-0.5 rounded-md border border-slate-700"
            >
              <button
                type="button"
                onClick={() => setIndustry('construction')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition ${
                  industry === 'construction'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                {t.constructionLabel}
              </button>
              <button
                type="button"
                onClick={() => setIndustry('manufacturing')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition ${
                  industry === 'manufacturing'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Factory className="w-3.5 h-3.5" aria-hidden="true" />
                {t.manufacturingLabel}
              </button>
            </div>

            {/* Interface Switcher (Worker View vs Admin View) */}
            <div
              role="group"
              aria-label="Interface Mode"
              className="flex items-center bg-slate-800 p-0.5 rounded-md border border-slate-700"
            >
              <button
                type="button"
                onClick={handleGoWorker}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition ${
                  !isAdminRoute
                    ? 'bg-white text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" aria-hidden="true" />
                {t.workerPortal}
              </button>
              <button
                type="button"
                onClick={handleGoAdmin}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition ${
                  isAdminRoute
                    ? 'bg-white text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
                {t.adminCommandCenter}
              </button>
            </div>

            {/* Trilingual Selector: English | தமிழ் | हिन्दी */}
            <div
              role="group"
              aria-label={t.languageLabel}
              className="flex items-center bg-slate-800 p-0.5 rounded-md border border-slate-700"
            >
              <span className="px-1.5 text-slate-400 hidden md:inline-flex items-center" title={t.languageLabel}>
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              {LANGUAGE_OPTIONS.map((opt) => {
                const isActive = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setLanguage(opt.code as Language)}
                    aria-pressed={isActive}
                    className={`px-2.5 py-1.5 rounded text-xs font-semibold transition ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {opt.nativeLabel}
                  </button>
                );
              })}
            </div>
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
      <footer className="bg-white border-t border-slate-200 py-3.5 px-4 text-xs text-slate-600 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong className="text-slate-900">{t.appName}</strong> — {t.tagline} • {t.sdgBadge}
          </span>
          <span>{t.footerRight}</span>
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
