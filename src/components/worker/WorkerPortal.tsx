import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Calculator,
  CheckCircle2,
  Clock,
  EyeOff,
  FileCheck2,
  HardHat,
  Mic,
  MicOff,
  Play,
  Search,
  ShieldAlert,
  Square,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getIndustryConfig } from '../../config/industries';
import { TRANSLATIONS } from '../../i18n/translations';
import { calculateWageEstimate, formatInr } from '../../services/wageService';
import { IncidentSeverity } from '../../types/domain';
import { roundToTwo } from '../../services/attendanceService';

type WorkerTab = 'attendance' | 'safevoice' | 'wagelens' | 'passport';

const QUICK_HAZARD_PHRASES: Record<'construction' | 'manufacturing', { en: string; ta: string }[]> = {
  construction: [
    {
      en: 'East wing level-3 scaffold ledger clamp is loose and missing outer guardrail above 8m drop.',
      ta: 'கிழக்குப் பிரிவு 3-வது தளத்தில் சாரம் (Scaffold) கம்பி தளர்வாக உள்ளது மற்றும் தடுப்புக் கம்பி இல்லை.',
    },
    {
      en: 'Exposed 415V temporary power cable lying near wet concrete curing bay without ELCB tag.',
      ta: 'ஈரமான கான்கிரீட் பகுதி அருகே 415V மின்கம்பி பாதுகாப்பு இன்றி திறந்த நிலையில் உள்ளது.',
    },
    {
      en: 'Safety harness shock-absorber lanyard webbing is frayed at Pier P-12 rigging station.',
      ta: 'பில்லர் P-12 பகுதியில் பாதுகாப்பு பெல்ட் (Harness) கயிறு சேதமடைந்துள்ளது.',
    },
  ],
  manufacturing: [
    {
      en: 'Side protective interlock guard and light curtain bypassed on 250T Hydraulic Press Line 3.',
      ta: '250T ஹைட்ராலிக் பிரஸ் இயந்திரத்தில் பக்கவாட்டு பாதுகாப்பு கவசம் (Machine Guard) அகற்றப்பட்டுள்ளது.',
    },
    {
      en: 'Alkaline degreaser chemical leak on walkway grating beside Surface Treatment Tank B.',
      ta: 'ரசாயன டேங்க் B அருகே நடைபாதையில் ரசாயன திரவம் கசிந்து வழுக்கும் நிலையில் உள்ளது.',
    },
    {
      en: 'Lockout/Tagout (LOTO) multi-lock hasp missing on scrap conveyor maintenance hatch.',
      ta: 'கன்வேயர் பராமரிப்புப் பகுதியில் LOTO பாதுகாப்பு பூட்டு வசதி இல்லை.',
    },
  ],
};

export const WorkerPortal: React.FC = () => {
  const {
    industry,
    language,
    selectedWorker,
    setSelectedWorkerId,
    industryWorkers,
    attendance,
    incidents,
    payrollDiscrepancies,
    fatiguePolicy,
    checkInWorker,
    checkOutWorker,
    submitIncident,
  } = useApp();

  const t = TRANSLATIONS[language];
  const industryConfig = getIndustryConfig(industry);

  const [activeTab, setActiveTab] = useState<WorkerTab>('attendance');

  // SmartShift Attendance state
  const [selectedSiteId, setSelectedSiteId] = useState<string>(selectedWorker.siteId);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(selectedWorker.departmentId);
  const [selectedShiftId, setSelectedShiftId] = useState<string>(selectedWorker.shiftId);
  const [breakMins, setBreakMins] = useState<number>(fatiguePolicy.defaultBreakMinutes);
  const [simulatedShiftHours, setSimulatedShiftHours] = useState<number>(10.5);
  const [attendanceFeedback, setAttendanceFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Sync site/dept/shift when worker changes
  useEffect(() => {
    setSelectedSiteId(selectedWorker.siteId);
    setSelectedDeptId(selectedWorker.departmentId);
    setSelectedShiftId(selectedWorker.shiftId);
  }, [selectedWorker]);

  // SafeVoice Hazard Reporting state
  const [hazardCategoryId, setHazardCategoryId] = useState<string>(
    industryConfig.hazardCategories[0]?.id || ''
  );
  const [hazardSeverity, setHazardSeverity] = useState<IncidentSeverity>('CRITICAL');
  const [hazardSiteId, setHazardSiteId] = useState<string>(selectedWorker.siteId);
  const [hazardDeptId, setHazardDeptId] = useState<string>(selectedWorker.departmentId);
  const [hazardDescription, setHazardDescription] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [reportedVia, setReportedVia] = useState<'TEXT' | 'VOICE'>('TEXT');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [submittedIncidentBanner, setSubmittedIncidentBanner] = useState<{
    id: string;
    trackingCode: string;
    isAnonymous: boolean;
  } | null>(null);
  const [incidentError, setIncidentError] = useState<string | null>(null);
  const [lookupQuery, setLookupQuery] = useState<string>('');

  useEffect(() => {
    const firstCat = industryConfig.hazardCategories[0];
    if (firstCat) {
      setHazardCategoryId(firstCat.id);
      setHazardSeverity(firstCat.defaultSeverity);
    }
    setHazardSiteId(selectedWorker.siteId);
    setHazardDeptId(selectedWorker.departmentId);
  }, [industry, industryConfig, selectedWorker]);

  // WageLens state
  const workerAttendance = useMemo(
    () => attendance.filter((r) => r.workerId === selectedWorker.id),
    [attendance, selectedWorker.id]
  );

  const completedWorkerHours = useMemo(() => {
    return workerAttendance.reduce(
      (acc, r) => {
        if (r.checkOutAt !== null) {
          acc.regular = roundToTwo(acc.regular + r.regularHours);
          acc.overtime = roundToTwo(acc.overtime + r.overtimeHours);
        }
        return acc;
      },
      { regular: 0, overtime: 0 }
    );
  }, [workerAttendance]);

  const [wageRegularHours, setWageRegularHours] = useState<string>(
    String(completedWorkerHours.regular || 24)
  );
  const [wageHourlyRate, setWageHourlyRate] = useState<string>(
    String(selectedWorker.hourlyWageInr)
  );
  const [wageOvertimeHours, setWageOvertimeHours] = useState<string>(
    String(completedWorkerHours.overtime || 6.5)
  );
  const [wageMultiplier, setWageMultiplier] = useState<string>(
    String(selectedWorker.overtimeMultiplier)
  );
  const [wageDeductions, setWageDeductions] = useState<string>(
    String(selectedWorker.standardDeductionInr)
  );

  useEffect(() => {
    setWageRegularHours(String(completedWorkerHours.regular || 8));
    setWageHourlyRate(String(selectedWorker.hourlyWageInr));
    setWageOvertimeHours(String(completedWorkerHours.overtime || 2));
    setWageMultiplier(String(selectedWorker.overtimeMultiplier));
    setWageDeductions(String(selectedWorker.standardDeductionInr));
  }, [selectedWorker, completedWorkerHours.regular, completedWorkerHours.overtime]);

  const wageResult = useMemo(() => {
    return calculateWageEstimate({
      regularHours: Number(wageRegularHours),
      hourlyWageInr: Number(wageHourlyRate),
      overtimeHours: Number(wageOvertimeHours),
      overtimeMultiplier: Number(wageMultiplier),
      deductionsInr: Number(wageDeductions),
    });
  }, [wageRegularHours, wageHourlyRate, wageOvertimeHours, wageMultiplier, wageDeductions]);

  const activeShiftRecord = useMemo(
    () =>
      workerAttendance.find((r) => r.status === 'ACTIVE' && r.checkOutAt === null),
    [workerAttendance]
  );

  const handleCheckIn = () => {
    setAttendanceFeedback(null);
    const res = checkInWorker({
      workerId: selectedWorker.id,
      siteId: selectedSiteId,
      departmentId: selectedDeptId,
      shiftId: selectedShiftId,
      breakMinutes: breakMins,
    });
    if (!res.ok) {
      setAttendanceFeedback({ type: 'error', message: res.error || 'Check-in failed.' });
    } else {
      setAttendanceFeedback({
        type: 'success',
        message: `Checked in successfully! Active Shift ID: ${res.record?.id} at ${res.record?.checkInAt.slice(11, 19)} UTC.`,
      });
    }
  };

  const handleCheckOut = () => {
    setAttendanceFeedback(null);
    if (!activeShiftRecord) {
      setAttendanceFeedback({
        type: 'error',
        message: 'No active shift found to check out.',
      });
      return;
    }
    const inMs = Date.parse(activeShiftRecord.checkInAt);
    // Calculate check-out timestamp from the selected simulated/elapsed duration
    const grossMinutesToAdd = Math.round(simulatedShiftHours * 60) + breakMins;
    const checkOutIso = new Date(
      inMs + Math.max(0, grossMinutesToAdd) * 60000
    ).toISOString();

    const res = checkOutWorker({
      recordId: activeShiftRecord.id,
      checkOutIso,
      breakMinutes: breakMins,
    });
    if (!res.ok) {
      setAttendanceFeedback({ type: 'error', message: res.error || 'Check-out failed.' });
    } else {
      setAttendanceFeedback({
        type: 'success',
        message: `Shift ${res.record?.id} completed! Regular: ${res.record?.regularHours}h | Overtime: ${res.record?.overtimeHours}h (Break deducted: ${res.record?.breakMinutes}m).`,
      });
    }
  };

  const handleVoiceToggle = () => {
    setVoiceNote(null);
    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (e: { results: { transcript: string }[][] }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (e: { results: { transcript: string }[][] }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
    };

    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsListening(false);
      setVoiceNote(t.worker.voiceFallbackNotice);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setHazardDescription((prev) =>
            prev ? `${prev} ${transcript}` : transcript
          );
          setReportedVia('VOICE');
        }
        setIsListening(false);
      };
      recognition.onerror = () => {
        setIsListening(false);
        setVoiceNote(t.worker.voiceFallbackNotice);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceNote(t.worker.voiceFallbackNotice);
    }
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentError(null);
    setSubmittedIncidentBanner(null);

    const catObj = industryConfig.hazardCategories.find((c) => c.id === hazardCategoryId);
    const categoryName = catObj ? catObj.name.en : 'Workplace Hazard';

    const res = submitIncident({
      siteId: hazardSiteId,
      departmentId: hazardDeptId,
      categoryId: hazardCategoryId,
      categoryName,
      severity: hazardSeverity,
      description: hazardDescription,
      isAnonymous,
      reportedVia,
    });

    if (!res.ok || !res.incident) {
      setIncidentError(res.error || 'Could not submit safety report.');
      return;
    }

    setSubmittedIncidentBanner({
      id: res.incident.id,
      trackingCode: res.incident.trackingCode,
      isAnonymous: res.incident.isAnonymous,
    });
    setHazardDescription('');
    setReportedVia('TEXT');
  };

  const filteredIncidentsForLookup = useMemo(() => {
    const q = lookupQuery.trim().toLowerCase();
    const industryList = incidents.filter((inc) => inc.industry === industry);
    if (!q) return industryList;
    return industryList.filter(
      (inc) =>
        inc.id.toLowerCase().includes(q) ||
        inc.trackingCode.toLowerCase().includes(q) ||
        inc.categoryName.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q)
    );
  }, [incidents, industry, lookupQuery]);

  const workerDiscrepancies = useMemo(
    () => payrollDiscrepancies.filter((d) => d.workerId === selectedWorker.id),
    [payrollDiscrepancies, selectedWorker.id]
  );

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 space-y-6">
      {/* Worker Identity & Profile Selector Card */}
      <section
        aria-label="Worker Profile Selector"
        className="bg-navy-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-navy-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
              <HardHat className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-amber-300">
                {t.worker.greeting} • {industryConfig.name[language]}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold mt-0.5">
                {language === 'ta' ? selectedWorker.nameTa : selectedWorker.name}{' '}
                <span className="text-sm font-mono text-slate-300">
                  ({selectedWorker.employeeCode})
                </span>
              </h1>
              <p className="text-sm text-slate-300">
                {selectedWorker.roleTitle[language]} • Base: {formatInr(selectedWorker.hourlyWageInr)}/hr
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <label
              htmlFor="worker-profile-select"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Switch Active Worker Profile (Demo)
            </label>
            <select
              id="worker-profile-select"
              value={selectedWorker.id}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full sm:w-64 rounded-xl bg-navy-800 border border-navy-600 text-white px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {industryWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.employeeCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Large Touch-Friendly Feature Navigation Tabs */}
      <nav
        aria-label="Worker Portal Features"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
      >
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center font-semibold transition min-h-[68px] focus:outline-none focus:ring-2 focus:ring-navy-700 ${
            activeTab === 'attendance'
              ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Clock className="w-5 h-5 mb-1 text-amber-500" aria-hidden="true" />
          <span className="text-xs sm:text-sm leading-tight">{t.nav.attendance}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('safevoice')}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center font-semibold transition min-h-[68px] focus:outline-none focus:ring-2 focus:ring-navy-700 ${
            activeTab === 'safevoice'
              ? 'bg-red-700 text-white border-red-700 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-red-300'
          }`}
        >
          <ShieldAlert className="w-5 h-5 mb-1 text-red-500" aria-hidden="true" />
          <span className="text-xs sm:text-sm leading-tight">{t.nav.safeVoice}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wagelens')}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center font-semibold transition min-h-[68px] focus:outline-none focus:ring-2 focus:ring-navy-700 ${
            activeTab === 'wagelens'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <Calculator className="w-5 h-5 mb-1 text-emerald-500" aria-hidden="true" />
          <span className="text-xs sm:text-sm leading-tight">{t.nav.wageLens}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('passport')}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center font-semibold transition min-h-[68px] focus:outline-none focus:ring-2 focus:ring-navy-700 ${
            activeTab === 'passport'
              ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Award className="w-5 h-5 mb-1 text-amber-500" aria-hidden="true" />
          <span className="text-xs sm:text-sm leading-tight">{t.nav.workHistory}</span>
        </button>
      </nav>

      {/* TAB 1: SMARTSHIFT ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t.nav.attendance}
                </h2>
                <p className="text-sm text-slate-600">
                  Standard Shift: {fatiguePolicy.standardShiftHours}h • Overtime Rate:{' '}
                  {selectedWorker.overtimeMultiplier}x ({formatInr(selectedWorker.hourlyWageInr * selectedWorker.overtimeMultiplier)}/hr)
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                  activeShiftRecord
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-100 text-slate-800 border border-slate-300'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    activeShiftRecord ? 'bg-emerald-600 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                {activeShiftRecord ? t.worker.activeShift : t.worker.noActiveShift}
              </span>
            </div>

            {/* Site, Department & Shift Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label
                  htmlFor="att-site-select"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  Worksite / Plant
                </label>
                <select
                  id="att-site-select"
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-700"
                >
                  {industryConfig.sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name[language]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="att-dept-select"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  Department / Crew
                </label>
                <select
                  id="att-dept-select"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-700"
                >
                  {industryConfig.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name[language]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="att-shift-select"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  Shift Schedule
                </label>
                <select
                  id="att-shift-select"
                  value={selectedShiftId}
                  onChange={(e) => setSelectedShiftId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-700"
                >
                  {industryConfig.shifts.map((sh) => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name[language]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Configurable Break & Demo Shift Duration Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label
                  htmlFor="break-deduction-input"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  {t.worker.breakDeductionLabel}
                </label>
                <input
                  id="break-deduction-input"
                  type="number"
                  min={0}
                  max={120}
                  step={5}
                  value={breakMins}
                  onChange={(e) => setBreakMins(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-700"
                />
              </div>

              <div>
                <label
                  htmlFor="sim-shift-duration-select"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  {t.worker.customSimDurationLabel}
                </label>
                <select
                  id="sim-shift-duration-select"
                  value={String(simulatedShiftHours)}
                  onChange={(e) => setSimulatedShiftHours(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-700"
                >
                  <option value="8">8.0 Net Hours (Standard 8h Shift, 0h OT)</option>
                  <option value="10.5">10.5 Net Hours (8h Regular + 2.5h Overtime)</option>
                  <option value="11.5">11.5 Net Hours (8h Regular + 3.5h OT — Triggers Fatigue Review)</option>
                  <option value="0">0.0 Net Hours (Edge Case: Zero-Duration Shift Flag)</option>
                </select>
              </div>
            </div>

            {/* Large Touch-Friendly Check-In and Check-Out Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={handleCheckIn}
                className="flex items-center justify-center gap-2.5 w-full min-h-[56px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700"
              >
                <Play className="w-5 h-5 fill-current" aria-hidden="true" />
                {t.worker.checkInBtn}
              </button>

              <button
                type="button"
                onClick={handleCheckOut}
                className="flex items-center justify-center gap-2.5 w-full min-h-[56px] rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-900"
              >
                <Square className="w-5 h-5 fill-current" aria-hidden="true" />
                {t.worker.checkOutBtn}
              </button>
            </div>

            {attendanceFeedback && (
              <div
                role="status"
                aria-live="polite"
                className={`p-3.5 rounded-xl border text-sm font-medium flex items-start gap-2.5 ${
                  attendanceFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}
              >
                {attendanceFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                )}
                <span>{attendanceFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Worker Attendance History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {t.worker.shiftHistoryTitle} ({workerAttendance.length})
              </h3>
              <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                Total Logged: {completedWorkerHours.regular}h Reg + {completedWorkerHours.overtime}h OT
              </div>
            </div>

            <div className="space-y-3">
              {workerAttendance.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-navy-900 bg-navy-100 px-2 py-0.5 rounded">
                        {rec.id}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{rec.date}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          rec.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-900'
                            : rec.status === 'ACTIVE'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono">
                      In: {rec.checkInAt.slice(11, 16)} UTC • Out:{' '}
                      {rec.checkOutAt ? `${rec.checkOutAt.slice(11, 16)} UTC` : 'MISSING / ACTIVE'} • Break:{' '}
                      {rec.breakMinutes}m
                    </p>
                    {rec.flags.length > 0 && (
                      <p className="text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                        {rec.flags.join(' ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right bg-white px-3 py-2 rounded-lg border border-slate-200">
                      <span className="block text-[11px] uppercase text-slate-500 font-semibold">
                        {t.worker.recordedRegularHours}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {rec.regularHours} hrs
                      </span>
                    </div>
                    <div className="text-right bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                      <span className="block text-[11px] uppercase text-amber-900 font-semibold">
                        {t.worker.recordedOvertimeHours}
                      </span>
                      <span className="text-sm font-bold text-amber-950">
                        +{rec.overtimeHours} hrs
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAFEVOICE INCIDENT MANAGEMENT */}
      {activeTab === 'safevoice' && (
        <div className="space-y-6">
          {/* Mandatory Non-Guarantee / Emergency Procedure Banner */}
          <div
            role="note"
            className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-xl text-xs sm:text-sm text-amber-950 font-medium flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t.emergencyDisclaimer}</span>
          </div>

          <form
            onSubmit={handleIncidentSubmit}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t.worker.reportHazardTitle}
              </h2>
              <p className="text-sm text-slate-600">{t.worker.reportHazardSubtitle}</p>
            </div>

            {/* 1. Hazard Category Cards */}
            <div>
              <span className="block text-xs font-bold uppercase text-slate-700 mb-2">
                {t.worker.selectHazardCategory}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {industryConfig.hazardCategories.map((cat) => {
                  const selected = hazardCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setHazardCategoryId(cat.id);
                        setHazardSeverity(cat.defaultSeverity);
                      }}
                      className={`text-left p-3.5 rounded-xl border-2 transition focus:outline-none focus:ring-2 focus:ring-red-600 ${
                        selected
                          ? 'border-red-700 bg-red-50/70'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {cat.name[language]}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {cat.defaultSeverity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{cat.description[language]}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Severity Selection */}
            <div>
              <label
                htmlFor="hazard-severity-select"
                className="block text-xs font-bold uppercase text-slate-700 mb-1.5"
              >
                {t.worker.selectSeverity}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as IncidentSeverity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setHazardSeverity(sev)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs uppercase border-2 transition min-h-[44px] ${
                      hazardSeverity === sev
                        ? sev === 'CRITICAL' || sev === 'HIGH'
                          ? 'bg-red-700 text-white border-red-700'
                          : 'bg-navy-900 text-white border-navy-900'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 & 4. Site and Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="hazard-site-select"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  {t.worker.selectSite}
                </label>
                <select
                  id="hazard-site-select"
                  value={hazardSiteId}
                  onChange={(e) => setHazardSiteId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900"
                >
                  {industryConfig.sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name[language]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="hazard-dept-select"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  {t.worker.selectDepartment}
                </label>
                <select
                  id="hazard-dept-select"
                  value={hazardDeptId}
                  onChange={(e) => setHazardDeptId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900"
                >
                  {industryConfig.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name[language]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Description + Voice Input + One-Tap Quick Phrases */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="hazard-description-textarea"
                  className="text-xs font-bold uppercase text-slate-700"
                >
                  {t.worker.describeIssueLabel}
                </label>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                    isListening
                      ? 'bg-red-600 text-white border-red-600 animate-pulse'
                      : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      {t.worker.voiceInputStop}
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-red-600" />
                      {t.worker.voiceInputStart}
                    </>
                  )}
                </button>
              </div>

              {voiceNote && (
                <p
                  role="status"
                  className="text-xs bg-amber-50 border border-amber-200 text-amber-950 p-2.5 rounded-lg"
                >
                  {voiceNote}
                </p>
              )}

              {/* Low-literacy / Minimal-typing Quick Phrase Chips */}
              <div className="space-y-1">
                <span className="block text-[11px] font-semibold text-slate-500">
                  Quick One-Tap Templates (Minimal Typing):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_HAZARD_PHRASES[industry].map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setHazardDescription(phrase[language])}
                      className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
                    >
                      + {phrase[language].slice(0, 62)}…
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                id="hazard-description-textarea"
                rows={3}
                value={hazardDescription}
                onChange={(e) => setHazardDescription(e.target.value)}
                placeholder={t.worker.describeIssuePlaceholder}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
              />
            </div>

            {/* Anonymous Reporting Toggle & Honest Privacy Explanation */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label
                htmlFor="anonymous-report-checkbox"
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  id="anonymous-report-checkbox"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-400 text-navy-900 focus:ring-navy-700"
                />
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4 text-slate-700" />
                  {t.worker.anonymousToggleLabel}
                </span>
              </label>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.worker.anonymousHonestExplanation}
              </p>
            </div>

            {incidentError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-950 text-sm font-medium"
              >
                {incidentError}
              </div>
            )}

            {submittedIncidentBanner && (
              <div
                role="status"
                aria-live="polite"
                className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-1.5"
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>
                    Safety Report Submitted! Unique ID:{' '}
                    <span className="font-mono underline">{submittedIncidentBanner.id}</span>
                  </span>
                </div>
                <p className="text-xs">
                  Status Tracking Code:{' '}
                  <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {submittedIncidentBanner.trackingCode}
                  </strong>{' '}
                  • Identity Mode:{' '}
                  {submittedIncidentBanner.isAnonymous
                    ? 'Anonymous (Worker ID & Name Omitted)'
                    : `Named (${selectedWorker.name})`}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[54px] rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700"
            >
              {t.worker.submitReportBtn}
            </button>
          </form>

          {/* Status Tracking & Resolution Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900">
                {t.worker.lookupReportTitle}
              </h3>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  aria-label={t.worker.lookupReportTitle}
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder={t.worker.lookupPlaceholder}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredIncidentsForLookup.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold bg-navy-900 text-white px-2.5 py-0.5 rounded">
                        {inc.id}
                      </span>
                      <span className="font-mono text-xs font-semibold bg-white border border-slate-300 text-slate-700 px-2 py-0.5 rounded">
                        Code: {inc.trackingCode}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          inc.severity === 'CRITICAL' || inc.severity === 'HIGH'
                            ? 'bg-red-100 text-red-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        inc.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : inc.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-900'
                          : inc.status === 'ASSIGNED'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-red-100 text-red-900'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900">{inc.categoryName}</p>
                  <p className="text-xs text-slate-700">{inc.description}</p>

                  <div className="text-xs text-slate-600 pt-1 border-t border-slate-200 flex flex-wrap justify-between gap-2">
                    <span>
                      Reporter:{' '}
                      <strong>
                        {inc.isAnonymous
                          ? 'Anonymous (Identity Redacted)'
                          : inc.workerName}
                      </strong>
                    </span>
                    <span>
                      Assigned Officer:{' '}
                      <strong>{inc.assignedTo || 'Pending Assignment'}</strong>
                    </span>
                  </div>

                  {inc.correctiveAction && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-950">
                      <strong>Corrective Action:</strong> {inc.correctiveAction}
                    </div>
                  )}
                  {inc.resolutionNotes && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-950">
                      <strong>Resolution Verified:</strong> {inc.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WAGELENS PAY TRANSPARENCY */}
      {activeTab === 'wagelens' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.worker.wageLensTitle}</h2>
              <p className="text-sm text-slate-600">{t.worker.wageLensSubtitle}</p>
            </div>

            <div
              role="note"
              className="bg-slate-100 border-l-4 border-navy-800 p-3.5 rounded-r-xl text-xs text-slate-800 font-medium"
            >
              {t.worker.wageDisclaimer}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="wage-regular-hours"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  {t.worker.regularHoursInput}
                </label>
                <input
                  id="wage-regular-hours"
                  type="number"
                  step="0.5"
                  value={wageRegularHours}
                  onChange={(e) => setWageRegularHours(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="wage-hourly-rate"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  {t.worker.hourlyWageInput}
                </label>
                <input
                  id="wage-hourly-rate"
                  type="number"
                  step="1"
                  value={wageHourlyRate}
                  onChange={(e) => setWageHourlyRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="wage-overtime-hours"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  {t.worker.overtimeHoursInput}
                </label>
                <input
                  id="wage-overtime-hours"
                  type="number"
                  step="0.5"
                  value={wageOvertimeHours}
                  onChange={(e) => setWageOvertimeHours(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="wage-overtime-multiplier"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  {t.worker.overtimeMultiplierInput}
                </label>
                <input
                  id="wage-overtime-multiplier"
                  type="number"
                  step="0.25"
                  value={wageMultiplier}
                  onChange={(e) => setWageMultiplier(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="wage-deductions"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  {t.worker.deductionsInput}
                </label>
                <input
                  id="wage-deductions"
                  type="number"
                  step="10"
                  value={wageDeductions}
                  onChange={(e) => setWageDeductions(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            {!wageResult.isValid ? (
              <div
                role="alert"
                className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-950 text-sm font-semibold space-y-1"
              >
                {wageResult.errors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-950 text-white rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                      {t.worker.estimatedNetPay} (Illustrative Estimate)
                    </span>
                    <div
                      data-testid="net-pay-display"
                      className="text-3xl font-extrabold text-amber-300 mt-0.5"
                    >
                      {formatInr(wageResult.netPayInr)}
                    </div>
                  </div>
                  <div className="text-xs text-emerald-200 space-y-0.5 sm:text-right font-mono">
                    <div>Regular: {formatInr(wageResult.regularEarningsInr)}</div>
                    <div>Overtime: {formatInr(wageResult.overtimeEarningsInr)}</div>
                    <div>Gross: {formatInr(wageResult.grossPayInr)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    {t.worker.arithmeticBreakdown}
                  </h3>
                  <div className="bg-emerald-900/70 rounded-xl p-3.5 font-mono text-xs space-y-1.5 text-emerald-100">
                    <p>1. Regular Pay: {wageResult.formulaSteps.regularStep}</p>
                    <p>2. Overtime Pay: {wageResult.formulaSteps.overtimeStep}</p>
                    <p>3. Gross Pay: {wageResult.formulaSteps.grossStep}</p>
                    <p className="font-bold text-amber-300">
                      4. Net Pay: {wageResult.formulaSteps.netStep}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payroll Discrepancy Detector */}
          {workerDiscrepancies.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Attendance vs. Payroll Register Verification
              </h3>
              {workerDiscrepancies.map((disc) => (
                <div
                  key={disc.id}
                  className={`p-4 rounded-xl border ${
                    disc.status === 'DISCREPANCY_FLAGGED'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  } space-y-1.5`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm">{disc.periodLabel}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border">
                      {disc.status}
                    </span>
                  </div>
                  <p className="text-xs">{disc.explanation}</p>
                  <p className="text-xs font-mono">
                    SmartShift Recorded Gross: {formatInr(disc.recordedGrossInr)} ({disc.recordedRegularHours}h Reg + {disc.recordedOvertimeHours}h OT) | Payroll Sheet: {formatInr(disc.payrollGrossInr)} ({disc.payrollRegularHours}h Reg + {disc.payrollOvertimeHours}h OT)
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PORTABLE SKILL PASSPORT & WORK HISTORY */}
      {activeTab === 'passport' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t.worker.skillPassportTitle}
              </h2>
              <p className="text-sm text-slate-600">{t.worker.skillPassportSubtitle}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              <UserCheck className="w-4 h-4" />
              Verified Record
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">
                Verified Shifts Completed
              </span>
              <span className="text-2xl font-extrabold text-navy-900">
                {selectedWorker.completedShiftsCount}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">
                Joined Sector Date
              </span>
              <span className="text-lg font-bold text-slate-900">
                {selectedWorker.joinedDate}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500 font-semibold block">
                Primary Trade Classification
              </span>
              <span className="text-sm font-bold text-slate-900">
                {selectedWorker.roleTitle[language]}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Verified Safety & Trade Certifications ({selectedWorker.skills.length})
            </h3>
            {selectedWorker.skills.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3"
              >
                <FileCheck2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-slate-900">
                    {cert.title[language]}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Issued: {cert.issuedDate} • Verified by: <strong>{cert.verifiedBy}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
