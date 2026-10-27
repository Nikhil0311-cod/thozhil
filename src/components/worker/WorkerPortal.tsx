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
import {
  getWorkerDisplayName,
  TRANSLATIONS,
} from '../../i18n/translations';
import { calculateWageEstimate, formatInr } from '../../services/wageService';
import { IncidentSeverity } from '../../types/domain';
import { roundToTwo } from '../../services/attendanceService';

type WorkerTab = 'attendance' | 'safety' | 'wages' | 'passport';

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
    fatigueAlerts,
    checkInWorker,
    checkOutWorker,
    submitIncident,
  } = useApp();

  const t = TRANSLATIONS[language];
  const industryConfig = getIndustryConfig(industry);

  const [activeTab, setActiveTab] = useState<WorkerTab>('attendance');

  // Attendance state
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

  // Safety Reporting state
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

  // Wage Insights state
  const workerAttendance = useMemo(
    () => attendance.filter((r) => r.workerId === selectedWorker.id),
    [attendance, selectedWorker.id]
  );

  const workerFatigueAlerts = useMemo(
    () => fatigueAlerts.filter((a) => a.workerId === selectedWorker.id),
    [fatigueAlerts, selectedWorker.id]
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
        message: `${t.worker.checkInBtn}: ${res.record?.id} (${res.record?.checkInAt.slice(11, 19)} UTC).`,
      });
    }
  };

  const handleCheckOut = () => {
    setAttendanceFeedback(null);
    if (!activeShiftRecord) {
      setAttendanceFeedback({
        type: 'error',
        message: t.worker.noActiveShift,
      });
      return;
    }
    const inMs = Date.parse(activeShiftRecord.checkInAt);
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
        message: `${res.record?.id}: ${t.worker.recordedRegularHours} ${res.record?.regularHours}h | ${t.worker.recordedOvertimeHours} ${res.record?.overtimeHours}h (${t.worker.breakShortLabel}: ${res.record?.breakMinutes}m).`,
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
      recognition.lang =
        language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
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

  const getLocalizedCategoryName = (categoryId: string, fallback: string) => {
    const found = industryConfig.hazardCategories.find((c) => c.id === categoryId);
    return found ? found.name[language] : fallback;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 space-y-5">
      {/* Worker Identity & Profile Bar */}
      <section
        aria-label="Worker Profile Selector"
        className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-md bg-slate-900 text-amber-400 shrink-0 mt-0.5">
              <HardHat className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.worker.greeting} • {industryConfig.name[language]}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {getWorkerDisplayName(selectedWorker, language)}{' '}
                <span className="text-xs font-mono text-slate-500 font-normal">
                  ({selectedWorker.employeeCode})
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {selectedWorker.roleTitle[language]} • {t.worker.baseRateLabel}:{' '}
                <strong className="text-slate-900">{formatInr(selectedWorker.hourlyWageInr)}/hr</strong>
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <label
              htmlFor="worker-profile-select"
              className="block text-xs font-semibold text-slate-600 mb-1"
            >
              {t.worker.switchProfileLabel}
            </label>
            <select
              id="worker-profile-select"
              value={selectedWorker.id}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full sm:w-64 rounded-md bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {industryWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {getWorkerDisplayName(w, language)} ({w.employeeCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Primary Feature Navigation Tabs */}
      <nav
        aria-label="Worker Portal Features"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-md border text-xs sm:text-sm font-semibold transition min-h-[48px] focus:outline-none focus:ring-2 focus:ring-slate-900 ${
            activeTab === 'attendance'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0 text-amber-500" aria-hidden="true" />
          <span>{t.nav.attendance}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('safety')}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-md border text-xs sm:text-sm font-semibold transition min-h-[48px] focus:outline-none focus:ring-2 focus:ring-slate-900 ${
            activeTab === 'safety'
              ? 'bg-red-700 text-white border-red-700'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" aria-hidden="true" />
          <span>{t.nav.safeVoice}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wages')}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-md border text-xs sm:text-sm font-semibold transition min-h-[48px] focus:outline-none focus:ring-2 focus:ring-slate-900 ${
            activeTab === 'wages'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calculator className="w-4 h-4 shrink-0 text-emerald-500" aria-hidden="true" />
          <span>{t.nav.wageLens}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('passport')}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-md border text-xs sm:text-sm font-semibold transition min-h-[48px] focus:outline-none focus:ring-2 focus:ring-slate-900 ${
            activeTab === 'passport'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4 shrink-0 text-amber-500" aria-hidden="true" />
          <span>{t.nav.workHistory}</span>
        </button>
      </nav>

      {/* TAB 1: ATTENDANCE, OVERTIME & PERSONAL FATIGUE ALERTS */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3.5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {t.nav.attendance}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  {t.worker.standardShiftInfo}: {fatiguePolicy.standardShiftHours}h •{' '}
                  {t.worker.overtimeRateInfo}: {selectedWorker.overtimeMultiplier}x (
                  {formatInr(selectedWorker.hourlyWageInr * selectedWorker.overtimeMultiplier)}/hr)
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
                  activeShiftRecord
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeShiftRecord ? 'bg-emerald-600' : 'bg-slate-400'
                  }`}
                />
                {activeShiftRecord ? t.worker.activeShift : t.worker.noActiveShift}
              </span>
            </div>

            {/* Site, Department & Shift Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="att-site-select"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t.worker.worksiteLabel}
                </label>
                <select
                  id="att-site-select"
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t.worker.departmentLabel}
                </label>
                <select
                  id="att-dept-select"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t.worker.shiftScheduleLabel}
                </label>
                <select
                  id="att-shift-select"
                  value={selectedShiftId}
                  onChange={(e) => setSelectedShiftId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {industryConfig.shifts.map((sh) => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name[language]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Configurable Break & Shift Duration Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-md border border-slate-200">
              <div>
                <label
                  htmlFor="break-deduction-input"
                  className="block text-xs font-semibold text-slate-700 mb-1"
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
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="sim-shift-duration-select"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t.worker.customSimDurationLabel}
                </label>
                <select
                  id="sim-shift-duration-select"
                  value={String(simulatedShiftHours)}
                  onChange={(e) => setSimulatedShiftHours(Number(e.target.value))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="8">{t.worker.simDuration8h}</option>
                  <option value="10.5">{t.worker.simDuration10_5h}</option>
                  <option value="11.5">{t.worker.simDuration11_5h}</option>
                  <option value="0">{t.worker.simDuration0h}</option>
                </select>
              </div>
            </div>

            {/* Check-In and Check-Out Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCheckIn}
                className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm sm:text-base transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-700"
              >
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                {t.worker.checkInBtn}
              </button>

              <button
                type="button"
                onClick={handleCheckOut}
                className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-900"
              >
                <Square className="w-4 h-4 fill-current" aria-hidden="true" />
                {t.worker.checkOutBtn}
              </button>
            </div>

            {attendanceFeedback && (
              <div
                role="status"
                aria-live="polite"
                className={`p-3 rounded-md border text-xs sm:text-sm font-medium flex items-start gap-2 ${
                  attendanceFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}
              >
                {attendanceFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                )}
                <span>{attendanceFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Personal Fatigue & Rest Alerts Panel */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t.worker.personalFatigueTitle} ({workerFatigueAlerts.length})
              </h3>
            </div>
            {workerFatigueAlerts.length === 0 ? (
              <p className="text-xs sm:text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md p-3">
                {t.worker.noPersonalFatigue}
              </p>
            ) : (
              <div className="space-y-2.5">
                {workerFatigueAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-md border border-amber-300 bg-amber-50/70 space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {alert.title}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900">
                        {alert.triggeredValue} / {alert.thresholdValue}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{alert.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Worker Attendance History Table / List */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t.worker.shiftHistoryTitle} ({workerAttendance.length})
              </h3>
              <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                {t.worker.totalLoggedSummary}: {completedWorkerHours.regular}h{' '}
                {t.worker.recordedRegularHours} + {completedWorkerHours.overtime}h{' '}
                {t.worker.recordedOvertimeHours}
              </div>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
              {workerAttendance.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {rec.id}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {rec.date}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                          rec.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : rec.status === 'ACTIVE'
                            ? 'bg-sky-50 text-sky-900 border-sky-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {t.attendanceStatuses[rec.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono">
                      {t.worker.inTimeLabel}: {rec.checkInAt.slice(11, 16)} UTC • {t.worker.outTimeLabel}:{' '}
                      {rec.checkOutAt
                        ? `${rec.checkOutAt.slice(11, 16)} UTC`
                        : t.worker.missingOrActiveLabel}{' '}
                      • {t.worker.breakShortLabel}: {rec.breakMinutes}m
                    </p>
                    {rec.flags.length > 0 && (
                      <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                        {rec.flags.join(' ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                      <span className="block text-[11px] text-slate-500 font-medium">
                        {t.worker.recordedRegularHours}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {rec.regularHours}h
                      </span>
                    </div>
                    <div className="text-right bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200">
                      <span className="block text-[11px] text-amber-900 font-medium">
                        {t.worker.recordedOvertimeHours}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-amber-950">
                        +{rec.overtimeHours}h
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAFETY REPORTS */}
      {activeTab === 'safety' && (
        <div className="space-y-5">
          {/* Emergency Disclaimer */}
          <div
            role="note"
            className="bg-amber-50 border-l-4 border-amber-600 p-3.5 rounded-r-md text-xs sm:text-sm text-amber-950 flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t.emergencyDisclaimer}</span>
          </div>

          <form
            onSubmit={handleIncidentSubmit}
            className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4"
          >
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.worker.reportHazardTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {t.worker.reportHazardSubtitle}
              </p>
            </div>

            {/* 1. Hazard Category Selection */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-2">
                {t.worker.selectHazardCategory}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      className={`text-left p-3 rounded-md border transition focus:outline-none focus:ring-2 focus:ring-red-600 ${
                        selected
                          ? 'border-red-700 bg-red-50/60'
                          : 'border-slate-200 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900">
                          {cat.name[language]}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {t.severities[cat.defaultSeverity]}
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
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.worker.selectSeverity}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as IncidentSeverity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setHazardSeverity(sev)}
                    className={`py-2 px-3 rounded-md font-semibold text-xs border transition min-h-[40px] ${
                      hazardSeverity === sev
                        ? sev === 'CRITICAL' || sev === 'HIGH'
                          ? 'bg-red-700 text-white border-red-700'
                          : 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t.severities[sev]}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 & 4. Site and Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="hazard-site-select"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t.worker.selectSite}
                </label>
                <select
                  id="hazard-site-select"
                  value={hazardSiteId}
                  onChange={(e) => setHazardSiteId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t.worker.selectDepartment}
                </label>
                <select
                  id="hazard-dept-select"
                  value={hazardDeptId}
                  onChange={(e) => setHazardDeptId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {industryConfig.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name[language]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Description + Voice Input + Quick Templates */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="hazard-description-textarea"
                  className="text-xs font-semibold text-slate-700"
                >
                  {t.worker.describeIssueLabel}
                </label>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                    isListening
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      {t.worker.voiceInputStop}
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-red-600" />
                      {t.worker.voiceInputStart}
                    </>
                  )}
                </button>
              </div>

              {voiceNote && (
                <p
                  role="status"
                  className="text-xs bg-amber-50 border border-amber-200 text-amber-950 p-2.5 rounded-md"
                >
                  {voiceNote}
                </p>
              )}

              {/* Quick Templates */}
              <div className="space-y-1">
                <span className="block text-[11px] font-medium text-slate-500">
                  {t.worker.quickTemplatesLabel}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {t.quickPhrases[industry].map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setHazardDescription(phrase)}
                      className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded border border-slate-200 transition"
                    >
                      + {phrase.slice(0, 62)}…
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
                className="w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
              />
            </div>

            {/* Anonymous Reporting Toggle */}
            <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200 space-y-1.5">
              <label
                htmlFor="anonymous-report-checkbox"
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  id="anonymous-report-checkbox"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-400 text-slate-900 focus:ring-slate-900"
                />
                <span className="font-semibold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
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
                className="p-3 rounded-md bg-red-50 border border-red-300 text-red-950 text-xs sm:text-sm font-medium"
              >
                {incidentError}
              </div>
            )}

            {submittedIncidentBanner && (
              <div
                role="status"
                aria-live="polite"
                className="p-3.5 rounded-md bg-emerald-50 border border-emerald-400 text-emerald-950 space-y-1"
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>
                    {t.worker.reportSubmittedTitle}{' '}
                    <span className="font-mono underline">{submittedIncidentBanner.id}</span>
                  </span>
                </div>
                <p className="text-xs">
                  {t.worker.trackingCodeLabel}{' '}
                  <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {submittedIncidentBanner.trackingCode}
                  </strong>{' '}
                  • {t.worker.identityModeLabel}{' '}
                  {submittedIncidentBanner.isAnonymous
                    ? t.worker.anonymousModeValue
                    : `${t.worker.namedModeValue} (${getWorkerDisplayName(selectedWorker, language)})`}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-md bg-red-700 hover:bg-red-800 text-white font-semibold text-sm sm:text-base transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-700"
            >
              {t.worker.submitReportBtn}
            </button>
          </form>

          {/* Status Tracking & Resolution Log */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t.worker.lookupReportTitle}
              </h3>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  aria-label={t.worker.lookupReportTitle}
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder={t.worker.lookupPlaceholder}
                  className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-300 text-xs font-medium"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
              {filteredIncidentsForLookup.map((inc) => (
                <div key={inc.id} className="p-3.5 bg-white space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        {inc.id}
                      </span>
                      <span className="font-mono text-xs font-medium bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded">
                        {inc.trackingCode}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                          inc.severity === 'CRITICAL' || inc.severity === 'HIGH'
                            ? 'bg-red-50 text-red-900 border-red-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {t.severities[inc.severity]}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${
                        inc.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : inc.status === 'IN_PROGRESS'
                          ? 'bg-sky-50 text-sky-900 border-sky-200'
                          : inc.status === 'ASSIGNED'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-red-50 text-red-900 border-red-200'
                      }`}
                    >
                      {t.statuses[inc.status]}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {getLocalizedCategoryName(inc.categoryId, inc.categoryName)}
                  </p>
                  <p className="text-xs text-slate-700">{inc.description}</p>

                  <div className="text-xs text-slate-600 pt-1.5 border-t border-slate-100 flex flex-wrap justify-between gap-2">
                    <span>
                      {t.worker.reporterLabel}:{' '}
                      <strong>
                        {inc.isAnonymous
                          ? t.worker.anonymousReporterValue
                          : inc.workerName}
                      </strong>
                    </span>
                    <span>
                      {t.worker.assignedOfficerLabel}:{' '}
                      <strong>{inc.assignedTo || t.worker.pendingAssignmentValue}</strong>
                    </span>
                  </div>

                  {inc.correctiveAction && (
                    <div className="bg-sky-50 border border-sky-200 rounded p-2 text-xs text-sky-950">
                      <strong>{t.worker.correctiveActionLabel}:</strong> {inc.correctiveAction}
                    </div>
                  )}
                  {inc.resolutionNotes && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-xs text-emerald-950">
                      <strong>{t.worker.resolutionVerifiedLabel}:</strong> {inc.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WAGE INSIGHTS */}
      {activeTab === 'wages' && (
        <div className="space-y-5">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.worker.wageLensTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {t.worker.wageLensSubtitle}
              </p>
            </div>

            <div
              role="note"
              className="bg-slate-50 border-l-4 border-slate-700 p-3 rounded-r-md text-xs text-slate-700"
            >
              {t.worker.wageDisclaimer}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="wage-regular-hours"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t.worker.regularHoursInput}
                </label>
                <input
                  id="wage-regular-hours"
                  type="number"
                  step="0.5"
                  value={wageRegularHours}
                  onChange={(e) => setWageRegularHours(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="wage-hourly-rate"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t.worker.hourlyWageInput}
                </label>
                <input
                  id="wage-hourly-rate"
                  type="number"
                  step="1"
                  value={wageHourlyRate}
                  onChange={(e) => setWageHourlyRate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="wage-overtime-hours"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t.worker.overtimeHoursInput}
                </label>
                <input
                  id="wage-overtime-hours"
                  type="number"
                  step="0.5"
                  value={wageOvertimeHours}
                  onChange={(e) => setWageOvertimeHours(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="wage-overtime-multiplier"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t.worker.overtimeMultiplierInput}
                </label>
                <input
                  id="wage-overtime-multiplier"
                  type="number"
                  step="0.25"
                  value={wageMultiplier}
                  onChange={(e) => setWageMultiplier(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="wage-deductions"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t.worker.deductionsInput}
                </label>
                <input
                  id="wage-deductions"
                  type="number"
                  step="10"
                  value={wageDeductions}
                  onChange={(e) => setWageDeductions(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>

            {!wageResult.isValid ? (
              <div
                role="alert"
                className="p-3.5 rounded-md bg-red-50 border border-red-300 text-red-950 text-xs sm:text-sm font-semibold space-y-1"
              >
                {wageResult.errors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 text-white rounded-lg p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3.5">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                      {t.worker.estimatedNetPay}
                    </span>
                    <div
                      data-testid="net-pay-display"
                      className="text-2xl sm:text-3xl font-bold text-amber-400 mt-0.5"
                    >
                      {formatInr(wageResult.netPayInr)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-0.5 sm:text-right font-mono">
                    <div>
                      {t.worker.regularPayShort}: {formatInr(wageResult.regularEarningsInr)}
                    </div>
                    <div>
                      {t.worker.overtimePayShort}: {formatInr(wageResult.overtimeEarningsInr)}
                    </div>
                    <div>
                      {t.worker.grossPayShort}: {formatInr(wageResult.grossPayInr)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {t.worker.arithmeticBreakdown}
                  </h3>
                  <div className="bg-slate-800 rounded-md p-3 font-mono text-xs space-y-1 text-slate-200 border border-slate-700">
                    <p>
                      1. {t.worker.regularPayShort}: {wageResult.formulaSteps.regularStep}
                    </p>
                    <p>
                      2. {t.worker.overtimePayShort}: {wageResult.formulaSteps.overtimeStep}
                    </p>
                    <p>
                      3. {t.worker.grossPayShort}: {wageResult.formulaSteps.grossStep}
                    </p>
                    <p className="font-bold text-amber-300">
                      4. {t.worker.estimatedNetPay}: {wageResult.formulaSteps.netStep}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payroll Discrepancy Verification */}
          {workerDiscrepancies.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t.worker.payrollVerificationTitle}
              </h3>
              {workerDiscrepancies.map((disc) => (
                <div
                  key={disc.id}
                  className={`p-3.5 rounded-md border ${
                    disc.status === 'DISCREPANCY_FLAGGED'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  } space-y-1.5`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm">{disc.periodLabel}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-300">
                      {disc.status}
                    </span>
                  </div>
                  <p className="text-xs">{disc.explanation}</p>
                  <p className="text-xs font-mono">
                    {t.worker.recordedGrossLabel}: {formatInr(disc.recordedGrossInr)} (
                    {disc.recordedRegularHours}h + {disc.recordedOvertimeHours}h OT) |{' '}
                    {t.worker.payrollSheetLabel}: {formatInr(disc.payrollGrossInr)} (
                    {disc.payrollRegularHours}h + {disc.payrollOvertimeHours}h OT)
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SKILLS PASSPORT & WORK HISTORY */}
      {activeTab === 'passport' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3.5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.worker.skillPassportTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {t.worker.skillPassportSubtitle}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              {t.worker.verifiedBadge}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">
                {t.worker.verifiedShiftsLabel}
              </span>
              <span className="text-xl font-bold text-slate-900">
                {selectedWorker.completedShiftsCount}
              </span>
            </div>
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">
                {t.worker.joinedDateLabel}
              </span>
              <span className="text-base font-bold text-slate-900">
                {selectedWorker.joinedDate}
              </span>
            </div>
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500 font-medium block">
                {t.worker.primaryTradeLabel}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                {selectedWorker.roleTitle[language]}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              {t.worker.certificationsHeading} ({selectedWorker.skills.length})
            </h3>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
              {selectedWorker.skills.map((cert) => (
                <div
                  key={cert.id}
                  className="p-3.5 bg-white flex items-start gap-2.5"
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-slate-900">
                      {cert.title[language]}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {t.worker.issuedLabel}: {cert.issuedDate} • {t.worker.verifiedByLabel}:{' '}
                      <strong>{cert.verifiedBy}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
