import React, { useEffect, useMemo, useState } from 'react';
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

  // Operational Filters
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'LAST_3_DAYS' | 'TODAY'>('ALL');

  // Reset operational filters whenever industry toggles between Construction and Manufacturing
  useEffect(() => {
    setSiteFilter('ALL');
    setDeptFilter('ALL');
    setShiftFilter('ALL');
    if (industryConfig.safetyOfficers[0]?.name) {
      setActorName(industryConfig.safetyOfficers[0].name);
    }
  }, [industry]);

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

  // Derived Dashboard Summary Metrics
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
        message: `${incidentId} → ${t.statuses[toStatus]} (${actorName}).`,
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
        message: `${alertId}: ${t.admin.acknowledgeAlertBtn} (${actorName}).`,
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
        message: `${t.admin.fatigueThresholdsTitle} — ${t.admin.applyPolicyBtn}.`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Admin Top Header & RBAC Controls */}
      <header className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-amber-400">
                {industryConfig.name[language]}
              </span>
              <span className="text-xs text-slate-500">
                {t.admin.operationalRecordsBadge}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              {t.admin.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">{t.admin.subtitle}</p>
          </div>

          {/* Role Simulation & Officer Identity Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-md border border-slate-200">
            <div>
              <label
                htmlFor="rbac-role-select"
                className="block text-[11px] font-semibold uppercase text-slate-600 mb-1"
              >
                {t.admin.activeRoleLabel}
              </label>
              <select
                id="rbac-role-select"
                value={activeRole}
                onChange={(e) =>
                  setActiveRole(e.target.value as 'worker' | 'admin' | 'safety_officer')
                }
                className="rounded-md bg-white border border-slate-300 text-slate-900 px-2.5 py-1.5 text-xs font-semibold"
              >
                <option value="admin">{t.admin.roleAdminOption}</option>
                <option value="safety_officer">{t.admin.roleSafetyOfficerOption}</option>
                <option value="worker">{t.admin.roleWorkerOption}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="officer-actor-input"
                className="block text-[11px] font-semibold uppercase text-slate-600 mb-1"
              >
                {t.admin.actingOfficerLabel}
              </label>
              <input
                id="officer-actor-input"
                type="text"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                className="rounded-md bg-white border border-slate-300 text-slate-900 px-2.5 py-1.5 text-xs font-medium w-48"
              />
            </div>
          </div>
        </div>

        {activeRole === 'worker' && (
          <div
            role="alert"
            className="bg-amber-50 border border-amber-300 text-amber-950 px-3.5 py-2.5 rounded-md text-xs font-medium flex items-center gap-2"
          >
            <Lock className="w-4 h-4 shrink-0 text-amber-700" />
            <span>{t.admin.roleRestrictedNotice}</span>
          </div>
        )}
      </header>

      {/* Operational Filters Bar */}
      <section
        aria-label="Operational Filters"
        className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900">
            <Filter className="w-4 h-4 text-slate-700" />
            <span>{t.admin.filtersTitle}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 w-full lg:w-auto flex-1 max-w-4xl">
            <div>
              <label
                htmlFor="filter-site"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                {t.worker.worksiteLabel}
              </label>
              <select
                id="filter-site"
                value={siteFilter}
                onChange={(e) => {
                  setSiteFilter(e.target.value);
                  setDeptFilter('ALL');
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900"
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
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                {t.worker.departmentLabel}
              </label>
              <select
                id="filter-dept"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900"
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
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                {t.worker.shiftScheduleLabel}
              </label>
              <select
                id="filter-shift"
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900"
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
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                {t.admin.dateWindowLabel}
              </label>
              <select
                id="filter-date-range"
                value={dateRangeFilter}
                onChange={(e) =>
                  setDateRangeFilter(e.target.value as 'ALL' | 'LAST_3_DAYS' | 'TODAY')
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900"
              >
                <option value="ALL">{t.admin.dateAll}</option>
                <option value="LAST_3_DAYS">{t.admin.dateLast3Days}</option>
                <option value="TODAY">{t.admin.dateToday}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Derived KPI Summary Strip */}
      <section
        aria-label="Key Operational Metrics"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t.admin.activeWorkersCard}</span>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
          <div data-testid="kpi-active-workers" className="text-2xl font-bold text-slate-900">
            {metrics.activeWorkersCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {metrics.totalRegularHours}h {t.admin.regularLoggedSub}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t.admin.overtimeHoursCard}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div data-testid="kpi-overtime-hours" className="text-2xl font-bold text-amber-700">
            {metrics.totalOvertimeHours}h
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {filteredAttendance.length} {t.admin.shiftRecordsSub}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t.admin.fatigueFlagsCard}</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div data-testid="kpi-fatigue-flags" className="text-2xl font-bold text-amber-700">
            {metrics.unacknowledgedFatigueCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {filteredFatigueAlerts.length} {t.admin.totalRuleFlagsSub}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t.admin.openIncidentsCard}</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div data-testid="kpi-open-incidents" className="text-2xl font-bold text-red-700">
            {metrics.openIncidentsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {filteredIncidents.length} {t.admin.totalReportsSub}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t.admin.highPriorityHazardsCard}</span>
            <AlertOctagon className="w-4 h-4 text-red-700" />
          </div>
          <div data-testid="kpi-high-priority" className="text-2xl font-bold text-red-700">
            {metrics.highPriorityOpenCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {t.admin.criticalHighSub}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t.admin.avgResolutionHoursCard}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-emerald-800">
            {metrics.avgResolutionHours}h
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {t.admin.verifiedClosedSub}
          </p>
        </div>
      </section>

      {adminActionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3.5 rounded-md border text-xs sm:text-sm font-semibold flex items-center justify-between ${
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
            {t.admin.dismissBtn}
          </button>
        </div>
      )}

      {/* Admin Sub-Navigation */}
      <nav
        aria-label="Admin Command Sections"
        className="flex flex-wrap gap-2 border-b border-slate-200 pb-2.5"
      >
        <button
          type="button"
          onClick={() => setSubTab('overview')}
          className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-1.5 border transition ${
            subTab === 'overview'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          {t.nav.commandCenter}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('incidents')}
          className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-1.5 border transition ${
            subTab === 'incidents'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-500" />
          {t.nav.incidentQueue} ({metrics.openIncidentsCount})
        </button>

        <button
          type="button"
          onClick={() => setSubTab('fatigue')}
          className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-1.5 border transition ${
            subTab === 'fatigue'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-500" />
          {t.nav.fatigueAlerts} ({metrics.unacknowledgedFatigueCount})
        </button>

        <button
          type="button"
          onClick={() => setSubTab('risk_engine')}
          className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-1.5 border transition ${
            subTab === 'risk_engine'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-500" />
          {t.nav.riskEngine} ({filteredRiskQueue.length})
        </button>

        <button
          type="button"
          onClick={() => setSubTab('what_if')}
          className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-1.5 border transition ${
            subTab === 'what_if'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <GitCompare className="w-4 h-4 text-sky-500" />
          {t.nav.whatIfSimulator}
        </button>
      </nav>

      {/* SUBTAB 1: OPERATIONS OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 Cols: Prioritized Action Queue */}
            <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {t.admin.priorityActionQueue}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t.admin.priorityActionSubtitle}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  {filteredRiskQueue.length} {t.admin.actionItemsCount}
                </span>
              </div>

              {filteredRiskQueue.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-md border border-dashed border-slate-300 text-xs sm:text-sm text-slate-600">
                  {t.admin.noActionItemsEmpty}
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
                  {filteredRiskQueue.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 bg-white border-l-4 space-y-1.5 ${
                        item.urgency === 'IMMEDIATE'
                          ? 'border-l-red-600'
                          : item.urgency === 'HIGH'
                          ? 'border-l-amber-500'
                          : 'border-l-slate-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                              item.urgency === 'IMMEDIATE'
                                ? 'bg-red-700 text-white'
                                : item.urgency === 'HIGH'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {item.urgency} • {item.priorityScore}/100
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {item.sourceRecordIds.join(', ')}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-700">
                        <strong>{t.admin.whyTriggeredLabel}:</strong> {item.whyGenerated}
                      </p>
                      <p className="text-xs text-slate-900 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                        <strong>{t.admin.recommendedActionLabel}:</strong> {item.suggestedAction}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 5 Cols: Distribution & Hazard Lifecycle */}
            <div className="lg:col-span-5 space-y-5">
              {/* Bar Visualization: Regular vs Overtime Hours */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3.5">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {t.admin.attendanceChartTitle}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t.admin.attendanceChartSubtitle} ({fatiguePolicy.maxShiftHours}h)
                  </p>
                </div>

                {filteredAttendance.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    {t.admin.noAttendanceEmpty}
                  </p>
                ) : (
                  <div
                    className="space-y-2.5"
                    role="img"
                    aria-label={t.admin.attendanceChartTitle}
                  >
                    {filteredAttendance.map((rec) => {
                      const totalH = roundToTwo(rec.regularHours + rec.overtimeHours);
                      const regPct = Math.min(100, Math.round((rec.regularHours / 12) * 100));
                      const otPct = Math.min(
                        100 - regPct,
                        Math.round((rec.overtimeHours / 12) * 100)
                      );
                      return (
                        <div key={rec.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-800">
                              {rec.workerName} ({rec.date})
                            </span>
                            <span className="font-mono font-semibold text-slate-900">
                              {rec.status === 'FLAGGED_MISSING_CHECKOUT'
                                ? t.attendanceStatuses.FLAGGED_MISSING_CHECKOUT
                                : `${rec.regularHours}h + ${rec.overtimeHours}h OT = ${totalH}h`}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-slate-100 rounded overflow-hidden flex border border-slate-200">
                            <div
                              style={{ width: `${regPct}%` }}
                              className="bg-slate-800 h-full"
                              title={`${t.worker.recordedRegularHours}: ${rec.regularHours}h`}
                            />
                            <div
                              style={{ width: `${otPct}%` }}
                              className="bg-amber-500 h-full"
                              title={`${t.worker.recordedOvertimeHours}: ${rec.overtimeHours}h`}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-4 pt-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-slate-800 inline-block" />{' '}
                        {t.worker.recordedRegularHours}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />{' '}
                        {t.worker.recordedOvertimeHours}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Incident Status Breakdown */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {t.admin.lifecyclePipelineTitle} ({filteredIncidents.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  {(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as IncidentStatus[]).map(
                    (st) => {
                      const count = filteredIncidents.filter((i) => i.status === st).length;
                      return (
                        <div
                          key={st}
                          className="p-2.5 rounded-md bg-slate-50 border border-slate-200"
                        >
                          <span className="text-[11px] font-semibold text-slate-600 block">
                            {t.statuses[st]}
                          </span>
                          <span className="text-xl font-bold text-slate-900">{count}</span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Structured Workforce Attendance & Overtime Register Table */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {t.admin.workforceAttendanceTableTitle} ({filteredAttendance.length})
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">{t.admin.activeWorkersCard}</th>
                    <th className="py-2.5 px-3">{t.admin.dateWindowLabel}</th>
                    <th className="py-2.5 px-3">{t.worker.recordedRegularHours}</th>
                    <th className="py-2.5 px-3">{t.worker.recordedOvertimeHours}</th>
                    <th className="py-2.5 px-3">{t.admin.lifecyclePipelineTitle}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAttendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                        {rec.id}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {rec.workerName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{rec.date}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                        {rec.regularHours}h
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-amber-800">
                        +{rec.overtimeHours}h
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            rec.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : rec.status === 'ACTIVE'
                              ? 'bg-sky-50 text-sky-900 border-sky-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {t.attendanceStatuses[rec.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SAFETY INCIDENT RESOLUTION QUEUE */}
      {subTab === 'incidents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t.admin.incidentQueueHeading} ({filteredIncidents.length})
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {t.admin.incidentQueueSubtitle}
            </p>
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-xs sm:text-sm text-slate-500">
              {t.admin.noIncidentsEmpty}
            </div>
          ) : (
            <div className="space-y-3.5">
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
                    className={`bg-white rounded-lg border p-4 sm:p-5 shadow-sm space-y-3.5 ${
                      inc.severity === 'CRITICAL' && inc.status !== 'RESOLVED'
                        ? 'border-red-500 border-l-4'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                            {inc.id}
                          </span>
                          <span className="font-mono text-xs bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-700">
                            {inc.trackingCode}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              inc.severity === 'CRITICAL'
                                ? 'bg-red-700 text-white'
                                : inc.severity === 'HIGH'
                                ? 'bg-red-100 text-red-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {t.severities[inc.severity]}
                          </span>
                          <span className="text-xs text-slate-500">
                            {inc.reportedVia} •{' '}
                            {inc.isAnonymous
                              ? t.worker.anonymousReporterValue
                              : `${inc.workerName} (${inc.workerId})`}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {inc.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-700">{inc.description}</p>
                      </div>

                      <span
                        data-testid={`incident-status-${inc.id}`}
                        className={`text-xs font-bold px-3 py-1 rounded uppercase border ${
                          inc.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : inc.status === 'IN_PROGRESS'
                            ? 'bg-sky-50 text-sky-900 border-sky-300'
                            : inc.status === 'ASSIGNED'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-red-50 text-red-900 border-red-300'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>

                    {/* Workflow Action Controls based on current status */}
                    {inc.status !== 'RESOLVED' && (
                      <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200 space-y-3">
                        {inc.status === 'OPEN' && (
                          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                            <div className="flex-1">
                              <label
                                htmlFor={`assign-select-${inc.id}`}
                                className="block text-xs font-semibold text-slate-700 mb-1"
                              >
                                {t.admin.step1AssignLabel}
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
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900"
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
                              className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0"
                            >
                              {t.admin.assignOfficerBtn} (OPEN → ASSIGNED)
                            </button>
                          </div>
                        )}

                        {inc.status === 'ASSIGNED' && (
                          <div className="space-y-2.5">
                            <div>
                              <label
                                htmlFor={`corrective-input-${inc.id}`}
                                className="block text-xs font-semibold text-slate-700 mb-1"
                              >
                                {t.admin.step2CorrectiveLabel} ({inc.assignedTo})
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
                                placeholder={t.admin.correctivePlaceholder}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900"
                              />
                            </div>
                            <button
                              type="button"
                              data-testid={`progress-btn-${inc.id}`}
                              onClick={() => handleIncidentTransition(inc.id, 'IN_PROGRESS')}
                              className="px-4 py-2 rounded-md bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold"
                            >
                              {t.admin.logCorrectiveBtn} (ASSIGNED → IN_PROGRESS)
                            </button>
                          </div>
                        )}

                        {inc.status === 'IN_PROGRESS' && (
                          <div className="space-y-2.5">
                            <p className="text-xs text-slate-700">
                              <strong>{t.worker.correctiveActionLabel}:</strong>{' '}
                              {inc.correctiveAction}
                            </p>
                            <div>
                              <label
                                htmlFor={`resolution-input-${inc.id}`}
                                className="block text-xs font-semibold text-slate-700 mb-1"
                              >
                                {t.admin.step3ResolutionLabel}
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
                                placeholder={t.admin.resolutionPlaceholder}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900"
                              />
                            </div>
                            <button
                              type="button"
                              data-testid={`resolve-btn-${inc.id}`}
                              onClick={() => handleIncidentTransition(inc.id, 'RESOLVED')}
                              className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                            >
                              {t.admin.recordResolutionBtn} (IN_PROGRESS → RESOLVED)
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audit Trail History */}
                    <div className="border-t border-slate-100 pt-2.5 space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <History className="w-3.5 h-3.5" /> {t.admin.auditHistoryLabel} (
                        {inc.history.length})
                      </span>
                      <div className="space-y-1">
                        {inc.history.map((h, i) => (
                          <div
                            key={i}
                            className="text-xs text-slate-600 font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200"
                          >
                            [{h.timestamp.slice(0, 16).replace('T', ' ')}]{' '}
                            <strong>{h.actorName}</strong> ({h.actorRole}): {h.note}
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

      {/* SUBTAB 3: FATIGUE & HOURS ALERTS */}
      {subTab === 'fatigue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Configurable Policy Rules Form */}
          <form
            onSubmit={handleSavePolicy}
            className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3.5 h-fit"
          >
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {t.admin.fatigueThresholdsTitle}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {t.admin.fatigueThresholdsSubtitle}
              </p>
            </div>

            <div>
              <label
                htmlFor="policy-max-shift"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {t.admin.maxShiftHoursLabel}
              </label>
              <input
                id="policy-max-shift"
                type="number"
                min={8}
                max={16}
                step={0.5}
                value={policyMaxShift}
                onChange={(e) => setPolicyMaxShift(Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label
                htmlFor="policy-min-rest"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {t.admin.minRestHoursLabel}
              </label>
              <input
                id="policy-min-rest"
                type="number"
                min={6}
                max={24}
                step={0.5}
                value={policyMinRest}
                onChange={(e) => setPolicyMinRest(Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label
                htmlFor="policy-repeated-ot"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {t.admin.repeatedOtThresholdLabel}
              </label>
              <input
                id="policy-repeated-ot"
                type="number"
                min={1}
                max={10}
                step={1}
                value={policyRepeatedOt}
                onChange={(e) => setPolicyRepeatedOt(Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label
                htmlFor="policy-max-consecutive"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {t.admin.maxConsecutiveDaysLabel}
              </label>
              <input
                id="policy-max-consecutive"
                type="number"
                min={3}
                max={14}
                step={1}
                value={policyMaxConsecutive}
                onChange={(e) => setPolicyMaxConsecutive(Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              {t.admin.applyPolicyBtn}
            </button>
          </form>

          {/* Explainable Fatigue Alerts List */}
          <div className="lg:col-span-8 space-y-3.5">
            {filteredFatigueAlerts.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-xs sm:text-sm text-slate-500">
                {t.admin.noFatigueAlertsEmpty}
              </div>
            ) : (
              filteredFatigueAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`bg-white rounded-lg border p-4 sm:p-5 shadow-sm space-y-2.5 ${
                    alert.acknowledged
                      ? 'border-slate-200 opacity-85'
                      : 'border-amber-400 border-l-4'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          alert.severity === 'HIGH'
                            ? 'bg-red-100 text-red-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {alert.ruleCode}
                      </span>
                    </div>
                    <span className="text-xs font-mono bg-slate-100 px-2.5 py-0.5 rounded text-slate-800 border border-slate-200">
                      {t.admin.observedLabel}: <strong>{alert.triggeredValue}</strong> /{' '}
                      {t.admin.limitLabel}: <strong>{alert.thresholdValue}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {alert.workerName} — {alert.title}
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{alert.explanation}</p>
                  <p className="text-xs font-mono text-slate-500">
                    IDs: {alert.relevantRecordIds.join(', ')}
                  </p>

                  {alert.acknowledged ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-md text-xs text-emerald-950">
                      <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-emerald-700" />
                      <strong>
                        {t.admin.acknowledgedByLabel} {alert.acknowledgedBy}:
                      </strong>{' '}
                      {alert.followUpNotes}
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex flex-col sm:flex-row gap-2">
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
                        placeholder={t.admin.followUpPlaceholder}
                        className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="px-3.5 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0"
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

      {/* SUBTAB 4: RISK & PAYROLL AUDIT */}
      {subTab === 'risk_engine' && (
        <div className="space-y-5">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3.5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.admin.riskEngineHeading}
              </h2>
              <p className="text-xs text-slate-600">{t.admin.riskEngineSubtitle}</p>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
              {filteredRiskQueue.map((item) => (
                <div key={item.id} className="p-3.5 bg-white space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {item.title}
                    </span>
                    <span className="font-mono text-xs bg-slate-100 border border-slate-300 px-2 py-0.5 rounded font-medium text-slate-800">
                      {t.admin.formulaLabel}: {item.scoreBreakdown}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    <strong>{t.admin.whyTriggeredLabel}:</strong> {item.whyGenerated}
                  </p>
                  <p className="text-xs text-emerald-950 bg-emerald-50 border border-emerald-200 p-2 rounded">
                    <strong>{t.admin.recommendedActionLabel}:</strong> {item.suggestedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payroll vs Recorded Attendance Reconciliation */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {t.admin.payrollAuditHeading} ({filteredDiscrepancies.length})
            </h3>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
              {filteredDiscrepancies.map((disc) => (
                <div key={disc.id} className="p-3.5 bg-white space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {disc.workerName} — {disc.periodLabel}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        disc.status === 'DISCREPANCY_FLAGGED'
                          ? 'bg-red-50 text-red-900 border-red-200'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      {disc.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{disc.explanation}</p>
                  <div className="text-xs font-mono text-slate-600">
                    {t.worker.recordedGrossLabel}: {formatInr(disc.recordedGrossInr)} (
                    {disc.recordedRegularHours}h + {disc.recordedOvertimeHours}h OT) •{' '}
                    {t.worker.payrollSheetLabel}: {formatInr(disc.payrollGrossInr)} (
                    {disc.payrollRegularHours}h + {disc.payrollOvertimeHours}h OT) • Δ:{' '}
                    {formatInr(disc.differenceInr)}
                  </div>

                  {disc.status === 'DISCREPANCY_FLAGGED' && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-1.5">
                      <input
                        type="text"
                        value={reconcileNotes[disc.id] || ''}
                        onChange={(e) =>
                          setReconcileNotes((prev) => ({
                            ...prev,
                            [disc.id]: e.target.value,
                          }))
                        }
                        placeholder={t.admin.reconcilePlaceholder}
                        className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const res = resolvePayrollDiscrepancy(
                            disc.id,
                            reconcileNotes[disc.id] ||
                              'Approved supplementary overtime adjustment matching attendance log.'
                          );
                          if (!res.ok) {
                            setAdminActionFeedback({
                              type: 'error',
                              message: res.error || 'Failed to reconcile.',
                            });
                          } else {
                            setAdminActionFeedback({
                              type: 'success',
                              message: `${disc.id}: ${t.admin.approveReconcileBtn}.`,
                            });
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-semibold"
                      >
                        {t.admin.approveReconcileBtn}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: WHAT-IF SHIFT SCHEDULE SIMULATOR */}
      {subTab === 'what_if' && (
        <div className="space-y-5">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {t.admin.whatIfHeading}
                </h2>
                <p className="text-xs text-slate-600">{t.admin.whatIfSubtitle}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
                {t.admin.recommendedBadge}:{' '}
                {whatIfComparison.recommendedPlanId === whatIfComparison.planA.planId
                  ? whatIfComparison.planA.planName
                  : whatIfComparison.planB.planName}
              </span>
            </div>

            {/* Interactive What-If Shift Length Adjusters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-md border border-slate-200">
              <div>
                <label
                  htmlFor="sim-plan-a-delta"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {whatIfComparison.planA.planName} (
                  {planAExtraHours >= 0 ? `+${planAExtraHours}h` : `${planAExtraHours}h`})
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
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {whatIfComparison.planB.planName} (
                  {planBExtraHours >= 0 ? `+${planBExtraHours}h` : `${planBExtraHours}h`})
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

            {/* Side-by-Side Comparison Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[whatIfComparison.planA, whatIfComparison.planB].map((plan) => {
                const isRec = plan.planId === whatIfComparison.recommendedPlanId;
                return (
                  <div
                    key={plan.planId}
                    className={`rounded-lg border p-4 space-y-3 ${
                      isRec
                        ? 'border-emerald-600 bg-emerald-50/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        {plan.planName}
                      </h3>
                      {isRec && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-700 text-white">
                          {t.admin.recommendedBadge}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded bg-white border border-slate-200">
                        <span className="text-slate-500 block">
                          {t.admin.totalViolationsLabel}
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          {plan.totalRuleViolations}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-white border border-slate-200">
                        <span className="text-slate-500 block">
                          {t.admin.projectedOvertimeLabel}
                        </span>
                        <span className="text-lg font-bold text-amber-700">
                          {plan.projectedOvertimeHours}h
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-white border border-slate-200">
                        <span className="text-slate-500 block">
                          {t.admin.restViolationsLabel} (&lt;
                          {fatiguePolicy.minRestHoursBetweenShifts}h)
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {plan.restViolationCount}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-white border border-slate-200">
                        <span className="text-slate-500 block">
                          {t.admin.consecutiveFlagsLabel}
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {plan.consecutiveShiftFlags}
                        </span>
                      </div>
                    </div>

                    {plan.violationDetails.length === 0 ? (
                      <p className="text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 p-2.5 rounded">
                        {t.admin.zeroViolationsMsg}
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-40 overflow-y-auto text-xs text-red-900 bg-red-50 p-2.5 rounded border border-red-200">
                        {plan.violationDetails.map((v, i) => (
                          <p key={i}>• {v}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-lg space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {t.admin.recommendationHeading}
              </h4>
              <p className="text-xs sm:text-sm font-semibold">
                {whatIfComparison.comparisonSummary}
              </p>
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
