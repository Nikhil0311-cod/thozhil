import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Filter,
  GitCompare,
  History,
  Lock,
  ShieldCheck,
  Sliders,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getIndustryConfig } from '../../config/industries';
import { TRANSLATIONS } from '../../i18n/translations';
import { SEED_WHAT_IF_PLANS } from '../../data/seedData';
import { compareWhatIfSchedules } from '../../services/riskEngineService';
import { roundToTwo } from '../../services/attendanceService';
import { formatInr } from '../../services/wageService';
import { IncidentStatus } from '../../types/domain';

type AdminSubTab = 'overview' | 'incidents' | 'fatigue' | 'risk_engine' | 'what_if';

export const AdminDashboard: React.FC = () => {
  const {
    industry,
    language,
    activeRole,
    setActiveRole,
    workers,
    attendance,
    incidents,
    payrollDiscrepancies,
    fatiguePolicy,
    fatigueAlerts,
    riskQueue,
    updateIncidentStatus,
    acknowledgeFatigue,
    updateFatiguePolicy,
    resolvePayrollDiscrepancy,
  } = useApp();

  const t = TRANSLATIONS[language];
  const industryConfig = getIndustryConfig(industry);

  const [subTab, setSubTab] = useState<AdminSubTab>('overview');

  // Operational Filters (Section 9)
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'LAST_3_DAYS' | 'TODAY'>('ALL');

  // Incident Action Form state
  const [actorName, setActorName] = useState<string>(
    industryConfig.safetyOfficers[0]?.name || 'Er. Karthikeyan Subramanian'
  );
  const [selectedOfficerByIncident, setSelectedOfficerByIncident] = useState<Record<string, string>>({});
  const [correctiveByIncident, setCorrectiveByIncident] = useState<Record<string, string>>({});
  const [resolutionByIncident, setResolutionByIncident] = useState<Record<string, string>>({});
  const [adminActionFeedback, setAdminActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fatigue Acknowledgement & Policy Config state
  const [ackNotesByAlert, setAckNotesByAlert] = useState<Record<string, string>>({});
  const [policyMaxShift, setPolicyMaxShift] = useState<number>(fatiguePolicy.maxShiftHours);
  const [policyMinRest, setPolicyMinRest] = useState<number>(
    fatiguePolicy.minRestHoursBetweenShifts
  );
  const [policyMaxConsecutive, setPolicyMaxConsecutive] = useState<number>(
    fatiguePolicy.maxConsecutiveShifts
  );
  const [policyRepeatedOt, setPolicyRepeatedOt] = useState<number>(
    fatiguePolicy.repeatedOvertimeCountThreshold
  );

  // Payroll reconciliation note state
  const [reconcileNotes, setReconcileNotes] = useState<Record<string, string>>({});

  // What-If Simulator customization state
  const [planAExtraHours, setPlanAExtraHours] = useState<number>(0);
  const [planBExtraHours, setPlanBExtraHours] = useState<number>(0);

  // Filtered records derived from stored/seeded state
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      if (w.industry !== industry) return false;
      if (siteFilter !== 'ALL' && w.siteId !== siteFilter) return false;
      if (deptFilter !== 'ALL' && w.departmentId !== deptFilter) return false;
      if (shiftFilter !== 'ALL' && w.shiftId !== shiftFilter) return false;
      return true;
    });
  }, [workers, industry, siteFilter, deptFilter, shiftFilter]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((r) => {
      if (r.industry !== industry) return false;
      if (siteFilter !== 'ALL' && r.siteId !== siteFilter) return false;
      if (deptFilter !== 'ALL' && r.departmentId !== deptFilter) return false;
      if (shiftFilter !== 'ALL' && r.shiftId !== shiftFilter) return false;
      if (dateRangeFilter === 'TODAY' && r.date < '2026-10-26') return false;
      if (dateRangeFilter === 'LAST_3_DAYS' && r.date < '2026-10-24') return false;
      return true;
    });
  }, [attendance, industry, siteFilter, deptFilter, shiftFilter, dateRangeFilter]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (inc.industry !== industry) return false;
      if (siteFilter !== 'ALL' && inc.siteId !== siteFilter) return false;
      if (deptFilter !== 'ALL' && inc.departmentId !== deptFilter) return false;
      return true;
    });
  }, [incidents, industry, siteFilter, deptFilter]);

  const filteredFatigueAlerts = useMemo(() => {
    return fatigueAlerts.filter((a) => {
      if (a.industry !== industry) return false;
      if (siteFilter !== 'ALL' && a.siteId !== siteFilter) return false;
      if (deptFilter !== 'ALL' && a.departmentId !== deptFilter) return false;
      return true;
    });
  }, [fatigueAlerts, industry, siteFilter, deptFilter]);

  const filteredRiskQueue = useMemo(() => {
    return riskQueue.filter((item) => {
      if (item.industry !== industry) return false;
      if (siteFilter !== 'ALL' && item.siteId !== siteFilter) return false;
      if (deptFilter !== 'ALL' && item.departmentId !== deptFilter) return false;
      return true;
    });
  }, [riskQueue, industry, siteFilter, deptFilter]);

  const filteredDiscrepancies = useMemo(() => {
    return payrollDiscrepancies.filter((d) => {
      if (d.industry !== industry) return false;
      if (siteFilter !== 'ALL' && d.siteId !== siteFilter) return false;
      if (deptFilter !== 'ALL' && d.departmentId !== deptFilter) return false;
      return true;
    });
  }, [payrollDiscrepancies, industry, siteFilter, deptFilter]);

  // Derived Dashboard Summary Metrics (Never hardcoded!)
  const metrics = useMemo(() => {
    const activeWorkersCount = filteredWorkers.length;
    const totalRegularHours = roundToTwo(
      filteredAttendance.reduce((sum, r) => sum + r.regularHours, 0)
    );
    const totalOvertimeHours = roundToTwo(
      filteredAttendance.reduce((sum, r) => sum + r.overtimeHours, 0)
    );
    const openIncidentsList = filteredIncidents.filter((i) => i.status !== 'RESOLVED');
    const highPriorityOpenCount = openIncidentsList.filter(
      (i) => i.severity === 'CRITICAL' || i.severity === 'HIGH'
    ).length;
    const unacknowledgedFatigueCount = filteredFatigueAlerts.filter(
      (a) => !a.acknowledged
    ).length;

    const resolvedIncidents = filteredIncidents.filter(
      (i) => i.status === 'RESOLVED' && i.resolvedAt
    );
    let avgResolutionHours = 0;
    if (resolvedIncidents.length > 0) {
      const totalResHours = resolvedIncidents.reduce((sum, inc) => {
        const hrs =
          (Date.parse(inc.resolvedAt!) - Date.parse(inc.createdAt)) / 3600000;
        return sum + Math.max(0, hrs);
      }, 0);
      avgResolutionHours = roundToTwo(totalResHours / resolvedIncidents.length);
    }

    return {
      activeWorkersCount,
      totalRegularHours,
      totalOvertimeHours,
      openIncidentsCount: openIncidentsList.length,
      highPriorityOpenCount,
      unacknowledgedFatigueCount,
      avgResolutionHours,
    };
  }, [filteredWorkers, filteredAttendance, filteredIncidents, filteredFatigueAlerts]);

  const handleIncidentTransition = (incidentId: string, toStatus: IncidentStatus) => {
    setAdminActionFeedback(null);
    const defaultOfficer =
      industryConfig.safetyOfficers[0]?.name || 'Er. Karthikeyan Subramanian';
    const assignedTo =
      selectedOfficerByIncident[incidentId] || defaultOfficer;
    const correctiveAction = correctiveByIncident[incidentId];
    const resolutionNotes = resolutionByIncident[incidentId];

    const res = updateIncidentStatus({
      incidentId,
      toStatus,
      actorName,
      assignedTo: toStatus === 'ASSIGNED' ? assignedTo : undefined,
      correctiveAction,
      resolutionNotes,
    });

    if (!res.ok) {
      setAdminActionFeedback({
        type: 'error',
        message: res.error || 'Could not update incident status.',
      });
    } else {
      setAdminActionFeedback({
        type: 'success',
        message: `Incident ${incidentId} transitioned to ${toStatus} by ${actorName}.`,
      });
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAdminActionFeedback(null);
    const notes =
      ackNotesByAlert[alertId] ||
      'Verified worker rest schedule and assigned relief operator for next shift.';
    const res = acknowledgeFatigue({
      alertId,
      actorName,
      followUpNotes: notes,
    });
    if (!res.ok) {
      setAdminActionFeedback({
        type: 'error',
        message: res.error || 'Could not acknowledge fatigue flag.',
      });
    } else {
      setAdminActionFeedback({
        type: 'success',
        message: `Fatigue alert ${alertId} acknowledged and logged.`,
      });
    }
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminActionFeedback(null);
    const res = updateFatiguePolicy({
      maxShiftHours: policyMaxShift,
      minRestHoursBetweenShifts: policyMinRest,
      maxConsecutiveShifts: policyMaxConsecutive,
      repeatedOvertimeCountThreshold: policyRepeatedOt,
    });
    if (!res.ok) {
      setAdminActionFeedback({
        type: 'error',
        message: res.error || 'Policy update failed.',
      });
    } else {
      setAdminActionFeedback({
        type: 'success',
        message:
          'Fatigue monitoring policy thresholds updated. All worker attendance logs re-evaluated.',
      });
    }
  };

  const whatIfComparison = useMemo(() => {
    const [baseA, baseB] = SEED_WHAT_IF_PLANS[industry];
    const customA = {
      ...baseA,
      shifts: baseA.shifts.map((s) => ({
        ...s,
        shiftHours: Math.max(4, s.shiftHours + planAExtraHours),
      })),
    };
    const customB = {
      ...baseB,
      shifts: baseB.shifts.map((s) => ({
        ...s,
        shiftHours: Math.max(4, s.shiftHours + planBExtraHours),
      })),
    };
    return compareWhatIfSchedules(customA, customB, fatiguePolicy);
  }, [industry, fatiguePolicy, planAExtraHours, planBExtraHours]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Command Center Top Header & Role Authorization Bar */}
      <header className="bg-navy-900 text-white rounded-2xl p-5 shadow-md border border-navy-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500 text-slate-950">
                {industryConfig.name[language]}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Seeded & Live Operational Records
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-1">{t.admin.title}</h1>
            <p className="text-sm text-slate-300">{t.admin.subtitle}</p>
          </div>

          {/* Role Simulation & Officer Identity Controls for RBAC Verification */}
          <div className="flex flex-wrap items-center gap-3 bg-navy-800/90 p-3.5 rounded-xl border border-navy-700">
            <div>
              <label
                htmlFor="rbac-role-select"
                className="block text-[11px] font-bold uppercase text-amber-300 mb-1"
              >
                Active Session Role (RBAC Test)
              </label>
              <select
                id="rbac-role-select"
                value={activeRole}
                onChange={(e) =>
                  setActiveRole(e.target.value as 'worker' | 'admin' | 'safety_officer')
                }
                className="rounded-lg bg-navy-950 border border-navy-600 text-white px-3 py-1.5 text-xs font-bold"
              >
                <option value="admin">Administrator (Full Command Access)</option>
                <option value="safety_officer">Authorized Safety Officer (HSE Access)</option>
                <option value="worker">Worker Role (Read-Only in Admin — Blocks Mutations)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="officer-actor-input"
                className="block text-[11px] font-bold uppercase text-slate-300 mb-1"
              >
                Acting Officer / Manager Name
              </label>
              <input
                id="officer-actor-input"
                type="text"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                className="rounded-lg bg-navy-950 border border-navy-600 text-white px-3 py-1.5 text-xs font-medium w-52"
              />
            </div>
          </div>
        </div>

        {activeRole === 'worker' && (
          <div
            role="alert"
            className="bg-amber-500/20 border border-amber-400 text-amber-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              RBAC Enforcement Preview: Current role is &apos;worker&apos;. Attempting to assign incidents, resolve hazards, or edit fatigue policies will be rejected by authorization rules. Switch role above to &apos;Administrator&apos; or &apos;Authorized Safety Officer&apos; to execute management actions.
            </span>
          </div>
        )}
      </header>

      {/* Operational Filters Bar (Section 9) */}
      <section
        aria-label="Operational Filters"
        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Filter className="w-4 h-4 text-navy-700" />
            <span>{t.admin.filtersTitle}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full lg:w-auto flex-1 max-w-4xl">
            <div>
              <label
                htmlFor="filter-site"
                className="block text-[11px] font-bold uppercase text-slate-500 mb-1"
              >
                Worksite / Plant
              </label>
              <select
                id="filter-site"
                value={siteFilter}
                onChange={(e) => {
                  setSiteFilter(e.target.value);
                  setDeptFilter('ALL');
                }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="ALL">{t.admin.allSites}</option>
                {industryConfig.sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name[language]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-dept"
                className="block text-[11px] font-bold uppercase text-slate-500 mb-1"
              >
                Department
              </label>
              <select
                id="filter-dept"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="ALL">{t.admin.allDepartments}</option>
                {industryConfig.departments
                  .filter((d) => siteFilter === 'ALL' || d.siteId === siteFilter)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name[language]}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-shift"
                className="block text-[11px] font-bold uppercase text-slate-500 mb-1"
              >
                Shift Schedule
              </label>
              <select
                id="filter-shift"
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="ALL">{t.admin.allShifts}</option>
                {industryConfig.shifts.map((sh) => (
                  <option key={sh.id} value={sh.id}>
                    {sh.name[language]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-date-range"
                className="block text-[11px] font-bold uppercase text-slate-500 mb-1"
              >
                Date Window
              </label>
              <select
                id="filter-date-range"
                value={dateRangeFilter}
                onChange={(e) =>
                  setDateRangeFilter(e.target.value as 'ALL' | 'LAST_3_DAYS' | 'TODAY')
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="ALL">All Recorded Dates</option>
                <option value="LAST_3_DAYS">Last 3 Days (Oct 24–27)</option>
                <option value="TODAY">Recent 24h Window</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Derived KPI Summary Cards */}
      <section
        aria-label="Key Operational Metrics"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5"
      >
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">{t.admin.activeWorkersCard}</span>
            <Users className="w-4 h-4 text-navy-700" />
          </div>
          <div data-testid="kpi-active-workers" className="text-2xl font-extrabold text-navy-900">
            {metrics.activeWorkersCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {metrics.totalRegularHours}h regular logged
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">{t.admin.overtimeHoursCard}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div data-testid="kpi-overtime-hours" className="text-2xl font-extrabold text-amber-700">
            {metrics.totalOvertimeHours}h
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Across {filteredAttendance.length} shift records
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">{t.admin.fatigueFlagsCard}</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div data-testid="kpi-fatigue-flags" className="text-2xl font-extrabold text-amber-700">
            {metrics.unacknowledgedFatigueCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {filteredFatigueAlerts.length} total rule flags
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">{t.admin.openIncidentsCard}</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div data-testid="kpi-open-incidents" className="text-2xl font-extrabold text-red-700">
            {metrics.openIncidentsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Of {filteredIncidents.length} total reports
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">{t.admin.highPriorityHazardsCard}</span>
            <AlertOctagon className="w-4 h-4 text-red-700" />
          </div>
          <div data-testid="kpi-high-priority" className="text-2xl font-extrabold text-red-700">
            {metrics.highPriorityOpenCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Critical / High unresolved
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">{t.admin.avgResolutionHoursCard}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-800">
            {metrics.avgResolutionHours}h
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Verified closed reports
          </p>
        </div>
      </section>

      {adminActionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between ${
            adminActionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}
        >
          <span>{adminActionFeedback.message}</span>
          <button
            type="button"
            onClick={() => setAdminActionFeedback(null)}
            className="text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Sub-Navigation */}
      <nav
        aria-label="Admin Command Sections"
        className="flex flex-wrap gap-2 border-b border-slate-200 pb-3"
      >
        <button
          type="button"
          onClick={() => setSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
            subTab === 'overview'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          {t.nav.commandCenter}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('incidents')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
            subTab === 'incidents'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-500" />
          {t.nav.incidentQueue} ({metrics.openIncidentsCount} Open)
        </button>

        <button
          type="button"
          onClick={() => setSubTab('fatigue')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
            subTab === 'fatigue'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-500" />
          {t.nav.fatigueAlerts} ({metrics.unacknowledgedFatigueCount})
        </button>

        <button
          type="button"
          onClick={() => setSubTab('risk_engine')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
            subTab === 'risk_engine'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-500" />
          {t.nav.riskEngine} ({filteredRiskQueue.length})
        </button>

        <button
          type="button"
          onClick={() => setSubTab('what_if')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
            subTab === 'what_if'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <GitCompare className="w-4 h-4 text-blue-500" />
          {t.nav.whatIfSimulator}
        </button>
      </nav>

      {/* SUBTAB 1: COMMAND OVERVIEW (Action Queue + Trend Visualizations + Attendance Exceptions) */}
      {subTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Prioritized Action Queue */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {t.admin.priorityActionQueue}
                </h2>
                <p className="text-xs text-slate-500">
                  Generated deterministically by the FairShift Risk-to-Resolution Engine
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-navy-100 text-navy-900">
                {filteredRiskQueue.length} Action Items
              </span>
            </div>

            {filteredRiskQueue.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-sm text-slate-600">
                No pending action items match the selected filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRiskQueue.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border-l-4 border bg-slate-50/70 space-y-1.5 ${
                      item.urgency === 'IMMEDIATE'
                        ? 'border-l-red-600 border-red-200'
                        : item.urgency === 'HIGH'
                        ? 'border-l-amber-500 border-amber-200'
                        : 'border-l-navy-600 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            item.urgency === 'IMMEDIATE'
                              ? 'bg-red-700 text-white'
                              : item.urgency === 'HIGH'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {item.urgency} • Score {item.priorityScore}/100
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        Refs: {item.sourceRecordIds.join(', ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-700">
                      <strong>Why Triggered:</strong> {item.whyGenerated}
                    </p>
                    <p className="text-xs text-navy-900 bg-navy-50 px-3 py-1.5 rounded-lg border border-navy-200">
                      <strong>Recommended Next Action:</strong> {item.suggestedAction}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right 5 Cols: Visual Trend Charts & Attendance Exceptions */}
          <div className="lg:col-span-5 space-y-6">
            {/* SVG Bar Visualization: Regular vs Overtime Hours by Shift Record */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Attendance & Overtime Hours Distribution
                </h2>
                <p className="text-xs text-slate-500">
                  Visualizing recorded shift durations vs {fatiguePolicy.maxShiftHours}h fatigue ceiling
                </p>
              </div>

              {filteredAttendance.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No attendance records match current filters.
                </p>
              ) : (
                <div className="space-y-3" role="img" aria-label="Attendance and overtime bar chart">
                  {filteredAttendance.map((rec) => {
                    const totalH = roundToTwo(rec.regularHours + rec.overtimeHours);
                    const regPct = Math.min(100, Math.round((rec.regularHours / 12) * 100));
                    const otPct = Math.min(100 - regPct, Math.round((rec.overtimeHours / 12) * 100));
                    return (
                      <div key={rec.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-800">
                            {rec.workerName} ({rec.date})
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {rec.status === 'FLAGGED_MISSING_CHECKOUT'
                              ? 'MISSING CHECK-OUT'
                              : `${rec.regularHours}h Reg + ${rec.overtimeHours}h OT = ${totalH}h`}
                          </span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                          <div
                            style={{ width: `${regPct}%` }}
                            className="bg-navy-800 h-full"
                            title={`Regular: ${rec.regularHours}h`}
                          />
                          <div
                            style={{ width: `${otPct}%` }}
                            className="bg-amber-500 h-full"
                            title={`Overtime: ${rec.overtimeHours}h`}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-4 pt-2 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-navy-800 inline-block" /> Regular Hours
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Overtime Hours
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Incident Status Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-slate-900">
                Hazard Lifecycle Pipeline ({filteredIncidents.length} Total)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                {(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as IncidentStatus[]).map(
                  (st) => {
                    const count = filteredIncidents.filter((i) => i.status === st).length;
                    return (
                      <div
                        key={st}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <span className="text-[11px] font-bold text-slate-500 block">
                          {st.replace('_', ' ')}
                        </span>
                        <span className="text-xl font-extrabold text-slate-900">
                          {count}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: INCIDENT RESOLUTION QUEUE & WORKFLOW (Section 6) */}
      {subTab === 'incidents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              SafeVoice Hazard Resolution Queue ({filteredIncidents.length})
            </h2>
            <p className="text-xs text-slate-600">
              Permitted lifecycle: <strong>OPEN → ASSIGNED → IN_PROGRESS → RESOLVED</strong>. High-severity reports are sorted to the top. Anonymous reports redact worker identity.
            </p>
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
              No safety incidents match the current filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIncidents.map((inc) => {
                const defaultOfficer =
                  industryConfig.safetyOfficers[0]?.name || 'Er. Karthikeyan Subramanian';
                const currentOfficer =
                  selectedOfficerByIncident[inc.id] ?? inc.assignedTo ?? defaultOfficer;
                const currentCorrective =
                  correctiveByIncident[inc.id] ?? inc.correctiveAction ?? '';
                const currentResolution =
                  resolutionByIncident[inc.id] ?? inc.resolutionNotes ?? '';

                return (
                  <div
                    key={inc.id}
                    className={`bg-white rounded-2xl border-2 p-5 shadow-sm space-y-4 ${
                      inc.severity === 'CRITICAL' && inc.status !== 'RESOLVED'
                        ? 'border-red-500'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold bg-navy-900 text-white px-2.5 py-1 rounded">
                            {inc.id}
                          </span>
                          <span className="font-mono text-xs bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-700">
                            Tracking: {inc.trackingCode}
                          </span>
                          <span
                            className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                              inc.severity === 'CRITICAL'
                                ? 'bg-red-700 text-white'
                                : inc.severity === 'HIGH'
                                ? 'bg-red-100 text-red-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {inc.severity}
                          </span>
                          <span className="text-xs text-slate-500">
                            Reported via {inc.reportedVia} •{' '}
                            {inc.isAnonymous
                              ? 'Anonymous Reporter (Identity Redacted)'
                              : `Worker: ${inc.workerName} (${inc.workerId})`}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{inc.title}</h3>
                        <p className="text-sm text-slate-700">{inc.description}</p>
                      </div>

                      <span
                        data-testid={`incident-status-${inc.id}`}
                        className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase ${
                          inc.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : inc.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : inc.status === 'ASSIGNED'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-red-100 text-red-900 border border-red-300'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>

                    {/* Workflow Action Controls based on current status */}
                    {inc.status !== 'RESOLVED' && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        {inc.status === 'OPEN' && (
                          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                            <div className="flex-1">
                              <label
                                htmlFor={`assign-select-${inc.id}`}
                                className="block text-xs font-bold uppercase text-slate-700 mb-1"
                              >
                                Step 1: Assign Authorized Safety Officer
                              </label>
                              <select
                                id={`assign-select-${inc.id}`}
                                value={currentOfficer}
                                onChange={(e) =>
                                  setSelectedOfficerByIncident((prev) => ({
                                    ...prev,
                                    [inc.id]: e.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                              >
                                {industryConfig.safetyOfficers.map((so) => (
                                  <option key={so.id} value={so.name}>
                                    {so.name} — {so.roleTitle}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              type="button"
                              data-testid={`assign-btn-${inc.id}`}
                              onClick={() => handleIncidentTransition(inc.id, 'ASSIGNED')}
                              className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wide shrink-0"
                            >
                              {t.admin.assignOfficerBtn} (OPEN → ASSIGNED)
                            </button>
                          </div>
                        )}

                        {inc.status === 'ASSIGNED' && (
                          <div className="space-y-3">
                            <div>
                              <label
                                htmlFor={`corrective-input-${inc.id}`}
                                className="block text-xs font-bold uppercase text-slate-700 mb-1"
                              >
                                Step 2: Record Physical Corrective Action (Assigned to {inc.assignedTo})
                              </label>
                              <input
                                id={`corrective-input-${inc.id}`}
                                type="text"
                                value={currentCorrective}
                                onChange={(e) =>
                                  setCorrectiveByIncident((prev) => ({
                                    ...prev,
                                    [inc.id]: e.target.value,
                                  }))
                                }
                                placeholder="e.g., Barricaded bay, replaced ledger clamps and installed outer guardrail..."
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                              />
                            </div>
                            <button
                              type="button"
                              data-testid={`progress-btn-${inc.id}`}
                              onClick={() => handleIncidentTransition(inc.id, 'IN_PROGRESS')}
                              className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wide"
                            >
                              Log Corrective Action (ASSIGNED → IN_PROGRESS)
                            </button>
                          </div>
                        )}

                        {inc.status === 'IN_PROGRESS' && (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-700">
                              <strong>Active Corrective Action:</strong> {inc.correctiveAction}
                            </p>
                            <div>
                              <label
                                htmlFor={`resolution-input-${inc.id}`}
                                className="block text-xs font-bold uppercase text-slate-700 mb-1"
                              >
                                Step 3: Record Final Inspection & Resolution Verification Notes
                              </label>
                              <input
                                id={`resolution-input-${inc.id}`}
                                type="text"
                                value={currentResolution}
                                onChange={(e) =>
                                  setResolutionByIncident((prev) => ({
                                    ...prev,
                                    [inc.id]: e.target.value,
                                  }))
                                }
                                placeholder="e.g., Load-tested scaffold bay and signed off safe for shift operations..."
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                              />
                            </div>
                            <button
                              type="button"
                              data-testid={`resolve-btn-${inc.id}`}
                              onClick={() => handleIncidentTransition(inc.id, 'RESOLVED')}
                              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wide"
                            >
                              {t.admin.recordResolutionBtn} (IN_PROGRESS → RESOLVED)
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audit Trail History */}
                    <div className="border-t border-slate-100 pt-3 space-y-1.5">
                      <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                        <History className="w-3.5 h-3.5" /> Resolution Audit History ({inc.history.length})
                      </span>
                      <div className="space-y-1">
                        {inc.history.map((h, i) => (
                          <div
                            key={i}
                            className="text-xs text-slate-600 font-mono bg-slate-50 px-3 py-1.5 rounded border border-slate-200/80"
                          >
                            [{h.timestamp.slice(0, 16).replace('T', ' ')}] <strong>{h.actorName}</strong> ({h.actorRole}): {h.note}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: EXPLAINABLE FATIGUE ALERTS & CONFIGURABLE THRESHOLDS (Section 8) */}
      {subTab === 'fatigue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configurable Policy Rules Form */}
          <form
            onSubmit={handleSavePolicy}
            className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configurable Fatigue Rule Thresholds
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Adjust deterministic thresholds below. Advisory only — flags trigger supervisor welfare review, never automated worker penalties or medical claims.
              </p>
            </div>

            <div>
              <label
                htmlFor="policy-max-shift"
                className="block text-xs font-bold uppercase text-slate-700 mb-1"
              >
                Max Single-Shift Hours Limit
              </label>
              <input
                id="policy-max-shift"
                type="number"
                min={8}
                max={16}
                step={0.5}
                value={policyMaxShift}
                onChange={(e) => setPolicyMaxShift(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
              />
            </div>

            <div>
              <label
                htmlFor="policy-min-rest"
                className="block text-xs font-bold uppercase text-slate-700 mb-1"
              >
                Min Inter-Shift Rest Hours
              </label>
              <input
                id="policy-min-rest"
                type="number"
                min={6}
                max={24}
                step={0.5}
                value={policyMinRest}
                onChange={(e) => setPolicyMinRest(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
              />
            </div>

            <div>
              <label
                htmlFor="policy-repeated-ot"
                className="block text-xs font-bold uppercase text-slate-700 mb-1"
              >
                Repeated Overtime Shifts Threshold
              </label>
              <input
                id="policy-repeated-ot"
                type="number"
                min={1}
                max={10}
                step={1}
                value={policyRepeatedOt}
                onChange={(e) => setPolicyRepeatedOt(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
              />
            </div>

            <div>
              <label
                htmlFor="policy-max-consecutive"
                className="block text-xs font-bold uppercase text-slate-700 mb-1"
              >
                Max Consecutive Shifts Without Rest Day
              </label>
              <input
                id="policy-max-consecutive"
                type="number"
                min={3}
                max={14}
                step={1}
                value={policyMaxConsecutive}
                onChange={(e) => setPolicyMaxConsecutive(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider"
            >
              Apply Threshold Policy & Re-Evaluate
            </button>
          </form>

          {/* Explainable Fatigue Alerts List */}
          <div className="lg:col-span-8 space-y-4">
            {filteredFatigueAlerts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                No fatigue alerts triggered under the current threshold configuration.
              </div>
            ) : (
              filteredFatigueAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`bg-white rounded-2xl border-2 p-5 shadow-sm space-y-3 ${
                    alert.acknowledged ? 'border-slate-200 opacity-85' : 'border-amber-400'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          alert.severity === 'HIGH'
                            ? 'bg-red-100 text-red-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {alert.severity} FATIGUE FLAG
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        Rule: {alert.ruleCode}
                      </span>
                    </div>
                    <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-800">
                      Observed: <strong>{alert.triggeredValue}</strong> vs Limit:{' '}
                      <strong>{alert.thresholdValue}</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {alert.workerName} — {alert.title}
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{alert.explanation}</p>
                  <p className="text-xs font-mono text-slate-500">
                    Relevant Attendance Record IDs: {alert.relevantRecordIds.join(', ')}
                  </p>

                  {alert.acknowledged ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-950">
                      <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-emerald-700" />
                      <strong>Acknowledged by {alert.acknowledgedBy}:</strong>{' '}
                      {alert.followUpNotes}
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        aria-label={`Follow-up note for ${alert.id}`}
                        value={ackNotesByAlert[alert.id] || ''}
                        onChange={(e) =>
                          setAckNotesByAlert((prev) => ({
                            ...prev,
                            [alert.id]: e.target.value,
                          }))
                        }
                        placeholder="Document supervisor follow-up (e.g., Mandatory 14h rest scheduled before next shift)..."
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0"
                      >
                        {t.admin.acknowledgeAlertBtn}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: FAIRSHIFT RISK-TO-RESOLUTION ENGINE & PAYROLL RECONCILIATION (Section 10) */}
      {subTab === 'risk_engine' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                FairShift Risk-to-Resolution Engine (Deterministic Rule Correlation)
              </h2>
              <p className="text-xs text-slate-600">
                Connects unresolved safety hazards, recurring department clusters, fatigue violations, missing check-outs, and wage/hours discrepancies using transparent scoring formulas.
              </p>
            </div>

            <div className="space-y-3">
              {filteredRiskQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-sm text-navy-900">{item.title}</span>
                    <span className="font-mono text-xs bg-white border border-slate-300 px-2.5 py-0.5 rounded font-semibold text-slate-800">
                      Formula: {item.scoreBreakdown}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    <strong>Deterministic Explanation:</strong> {item.whyGenerated}
                  </p>
                  <p className="text-xs text-emerald-950 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                    <strong>Actionable Resolution Step:</strong> {item.suggestedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payroll vs Recorded Attendance Reconciliation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              SmartShift Recorded Hours vs. Payroll Register Audit ({filteredDiscrepancies.length})
            </h3>
            <div className="space-y-3">
              {filteredDiscrepancies.map((disc) => (
                <div
                  key={disc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {disc.workerName} — {disc.periodLabel}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        disc.status === 'DISCREPANCY_FLAGGED'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {disc.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{disc.explanation}</p>
                  <div className="text-xs font-mono text-slate-600">
                    Recorded Gross: {formatInr(disc.recordedGrossInr)} ({disc.recordedRegularHours}h Reg + {disc.recordedOvertimeHours}h OT) • Payroll Entry: {formatInr(disc.payrollGrossInr)} ({disc.payrollRegularHours}h Reg + {disc.payrollOvertimeHours}h OT) • Variance: {formatInr(disc.differenceInr)}
                  </div>

                  {disc.status === 'DISCREPANCY_FLAGGED' && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <input
                        type="text"
                        value={reconcileNotes[disc.id] || ''}
                        onChange={(e) =>
                          setReconcileNotes((prev) => ({
                            ...prev,
                            [disc.id]: e.target.value,
                          }))
                        }
                        placeholder="Enter payroll correction reference (e.g., Added missing OT hours to supplementary payout)..."
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const res = resolvePayrollDiscrepancy(
                            disc.id,
                            reconcileNotes[disc.id] ||
                              'Approved supplementary overtime adjustment matching SmartShift log.'
                          );
                          if (!res.ok) {
                            setAdminActionFeedback({
                              type: 'error',
                              message: res.error || 'Failed to reconcile.',
                            });
                          } else {
                            setAdminActionFeedback({
                              type: 'success',
                              message: `Payroll discrepancy ${disc.id} marked reconciled.`,
                            });
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-navy-900 text-white text-xs font-bold"
                      >
                        Approve Overtime Reconciliation
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: OPTIONAL DIFFERENTIATOR — FAIRSHIFT WHAT-IF SIMULATOR (Section 11) */}
      {subTab === 'what_if' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  FairShift What-If Shift Schedule Simulator (Advisory Comparison)
                </h2>
                <p className="text-xs text-slate-600">
                  Compare two proposed weekly shift plans before publishing. Evaluates projected overtime, inter-shift rest violations, consecutive-shift flags, and daily staffing coverage. (Does not automatically overwrite live schedules.)
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900">
                Recommended: {whatIfComparison.recommendedPlanId === whatIfComparison.planA.planId ? whatIfComparison.planA.planName : whatIfComparison.planB.planName}
              </span>
            </div>

            {/* Interactive What-If Shift Length Adjusters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label
                  htmlFor="sim-plan-a-delta"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Adjust {whatIfComparison.planA.planName} Daily Shift Hours ({planAExtraHours >= 0 ? `+${planAExtraHours}h` : `${planAExtraHours}h`})
                </label>
                <input
                  id="sim-plan-a-delta"
                  type="range"
                  min={-2}
                  max={2}
                  step={1}
                  value={planAExtraHours}
                  onChange={(e) => setPlanAExtraHours(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="sim-plan-b-delta"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Adjust {whatIfComparison.planB.planName} Daily Shift Hours ({planBExtraHours >= 0 ? `+${planBExtraHours}h` : `${planBExtraHours}h`})
                </label>
                <input
                  id="sim-plan-b-delta"
                  type="range"
                  min={-2}
                  max={2}
                  step={1}
                  value={planBExtraHours}
                  onChange={(e) => setPlanBExtraHours(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Side-by-Side Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[whatIfComparison.planA, whatIfComparison.planB].map((plan) => {
                const isRec = plan.planId === whatIfComparison.recommendedPlanId;
                return (
                  <div
                    key={plan.planId}
                    className={`rounded-2xl border-2 p-5 space-y-3 ${
                      isRec
                        ? 'border-emerald-600 bg-emerald-50/30'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-900">{plan.planName}</h3>
                      {isRec && (
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white">
                          RECOMMENDED PLAN
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 block">Total Rule Violations</span>
                        <span className="text-lg font-extrabold text-slate-900">
                          {plan.totalRuleViolations}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 block">Projected Overtime</span>
                        <span className="text-lg font-extrabold text-amber-700">
                          {plan.projectedOvertimeHours} hrs
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 block">Rest Violations (&lt;{fatiguePolicy.minRestHoursBetweenShifts}h)</span>
                        <span className="text-base font-bold text-slate-900">
                          {plan.restViolationCount}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 block">Consecutive-Shift Flags</span>
                        <span className="text-base font-bold text-slate-900">
                          {plan.consecutiveShiftFlags}
                        </span>
                      </div>
                    </div>

                    {plan.violationDetails.length === 0 ? (
                      <p className="text-xs text-emerald-800 font-semibold bg-emerald-100/70 p-2.5 rounded-lg">
                        Zero fatigue, rest-period, or staffing coverage violations detected!
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-40 overflow-y-auto text-xs text-red-900 bg-red-50 p-3 rounded-lg border border-red-200">
                        {plan.violationDetails.map((v, i) => (
                          <p key={i}>• {v}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-navy-900 text-white p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Deterministic Recommendation Explanation
              </h4>
              <p className="text-sm font-semibold">{whatIfComparison.comparisonSummary}</p>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {whatIfComparison.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
