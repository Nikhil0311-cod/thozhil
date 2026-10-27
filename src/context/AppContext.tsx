import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AttendanceRecord,
  FatigueAlert,
  FatiguePolicyConfig,
  IncidentSeverity,
  IncidentStatus,
  IndustryId,
  Language,
  PayrollDiscrepancyRecord,
  RiskResolutionItem,
  SafetyIncident,
  UserRole,
  WorkerProfile,
} from '../types/domain';
import {
  detectPersistenceMode,
  loadAppState,
  PersistedAppState,
  PersistenceMode,
  resetAppStateToSeed,
  saveAppState,
} from '../services/repository';
import {
  completeCheckOutRecord,
  createCheckInRecord,
  validateCheckIn,
} from '../services/attendanceService';
import {
  createSafetyIncidentRecord,
  transitionIncidentStatus,
} from '../services/incidentService';
import {
  acknowledgeFatigueAlert,
  evaluateFatigueAlerts,
} from '../services/fatigueService';
import { generateRiskResolutionQueue } from '../services/riskEngineService';

interface AppContextValue {
  persistenceMode: PersistenceMode;
  industry: IndustryId;
  setIndustry: (industry: IndustryId) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  selectedWorkerId: string;
  setSelectedWorkerId: (workerId: string) => void;
  selectedWorker: WorkerProfile;
  workers: WorkerProfile[];
  industryWorkers: WorkerProfile[];
  attendance: AttendanceRecord[];
  incidents: SafetyIncident[];
  payrollDiscrepancies: PayrollDiscrepancyRecord[];
  fatiguePolicy: FatiguePolicyConfig;
  fatigueAlerts: FatigueAlert[];
  riskQueue: RiskResolutionItem[];
  checkInWorker: (params: {
    workerId: string;
    siteId: string;
    departmentId: string;
    shiftId: string;
    breakMinutes: number;
    customCheckInIso?: string;
  }) => { ok: boolean; record?: AttendanceRecord; error?: string };
  checkOutWorker: (params: {
    recordId: string;
    checkOutIso: string;
    breakMinutes: number;
  }) => { ok: boolean; record?: AttendanceRecord; error?: string };
  submitIncident: (params: {
    siteId: string;
    departmentId: string;
    categoryId: string;
    categoryName: string;
    severity: IncidentSeverity;
    description: string;
    isAnonymous: boolean;
    reportedVia: 'TEXT' | 'VOICE';
  }) => { ok: boolean; incident?: SafetyIncident; error?: string };
  updateIncidentStatus: (params: {
    incidentId: string;
    toStatus: IncidentStatus;
    actorName: string;
    assignedTo?: string;
    correctiveAction?: string;
    resolutionNotes?: string;
  }) => { ok: boolean; incident?: SafetyIncident; error?: string };
  acknowledgeFatigue: (params: {
    alertId: string;
    actorName: string;
    followUpNotes: string;
  }) => { ok: boolean; error?: string };
  updateFatiguePolicy: (nextPolicy: Partial<FatiguePolicyConfig>) => {
    ok: boolean;
    error?: string;
  };
  resolvePayrollDiscrepancy: (discrepancyId: string, note: string) => {
    ok: boolean;
    error?: string;
  };
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedAppState>(() => loadAppState());
  const [industry, setIndustryState] = useState<IndustryId>('construction');
  const [language, setLanguage] = useState<Language>('en');
  const [activeRole, setActiveRole] = useState<UserRole>('worker');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('worker-con-1');

  const persistenceMode = useMemo(() => detectPersistenceMode(), []);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const setIndustry = (nextIndustry: IndustryId) => {
    setIndustryState(nextIndustry);
    const firstWorker = state.workers.find((w) => w.industry === nextIndustry);
    if (firstWorker) {
      setSelectedWorkerId(firstWorker.id);
    }
  };

  const industryWorkers = useMemo(
    () => state.workers.filter((w) => w.industry === industry),
    [state.workers, industry]
  );

  const selectedWorker = useMemo(() => {
    return (
      state.workers.find((w) => w.id === selectedWorkerId) ||
      industryWorkers[0] ||
      state.workers[0]
    );
  }, [state.workers, selectedWorkerId, industryWorkers]);

  const fatigueAlerts = useMemo(
    () =>
      evaluateFatigueAlerts(
        state.attendance,
        state.fatiguePolicy,
        state.fatigueAcknowledgements
      ),
    [state.attendance, state.fatiguePolicy, state.fatigueAcknowledgements]
  );

  const riskQueue = useMemo(
    () =>
      generateRiskResolutionQueue({
        incidents: state.incidents,
        fatigueAlerts,
        attendanceRecords: state.attendance,
        payrollDiscrepancies: state.payrollDiscrepancies,
      }),
    [state.incidents, fatigueAlerts, state.attendance, state.payrollDiscrepancies]
  );

  const checkInWorker: AppContextValue['checkInWorker'] = (params) => {
    const validation = validateCheckIn(state.attendance, params.workerId);
    if (!validation.allowed) {
      return { ok: false, error: validation.error };
    }
    const worker = state.workers.find((w) => w.id === params.workerId);
    if (!worker) {
      return { ok: false, error: 'Selected worker profile not found.' };
    }

    const prefix = worker.industry === 'construction' ? 'ATT-CON' : 'ATT-MFG';
    const nextNum = 910 + state.attendance.length;
    const checkInIso = params.customCheckInIso || new Date().toISOString();

    const record = createCheckInRecord({
      id: `${prefix}-${nextNum}`,
      workerId: worker.id,
      workerName: worker.name,
      industry: worker.industry,
      siteId: params.siteId,
      departmentId: params.departmentId,
      shiftId: params.shiftId,
      checkInAt: checkInIso,
      breakMinutes: params.breakMinutes,
    });

    setState((prev) => ({
      ...prev,
      attendance: [record, ...prev.attendance],
    }));

    return { ok: true, record };
  };

  const checkOutWorker: AppContextValue['checkOutWorker'] = (params) => {
    const target = state.attendance.find((r) => r.id === params.recordId);
    try {
      if (!target) {
        return { ok: false, error: 'Active attendance record not found.' };
      }
      const updated = completeCheckOutRecord(
        target,
        params.checkOutIso,
        params.breakMinutes,
        state.fatiguePolicy.standardShiftHours,
        state.fatiguePolicy.maxShiftHours
      );
      setState((prev) => ({
        ...prev,
        attendance: prev.attendance.map((r) => (r.id === updated.id ? updated : r)),
        workers: prev.workers.map((w) =>
          w.id === updated.workerId
            ? { ...w, completedShiftsCount: w.completedShiftsCount + 1 }
            : w
        ),
      }));
      return { ok: true, record: updated };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Check-out failed.',
      };
    }
  };

  const submitIncident: AppContextValue['submitIncident'] = (params) => {
    try {
      const prefix = industry === 'construction' ? 'INC-CON' : 'INC-MFG';
      const seq = state.incidents.length + 105;
      const newIncident = createSafetyIncidentRecord(
        {
          id: `${prefix}-${seq}`,
          industry,
          siteId: params.siteId,
          departmentId: params.departmentId,
          categoryId: params.categoryId,
          categoryName: params.categoryName,
          severity: params.severity,
          description: params.description,
          isAnonymous: params.isAnonymous,
          workerId: params.isAnonymous ? null : selectedWorker.id,
          workerName: params.isAnonymous ? null : selectedWorker.name,
          reportedVia: params.reportedVia,
          createdAt: new Date().toISOString(),
        },
        state.incidents.length + 1
      );

      setState((prev) => ({
        ...prev,
        incidents: [newIncident, ...prev.incidents],
      }));
      return { ok: true, incident: newIncident };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to submit safety incident.',
      };
    }
  };

  const updateIncidentStatus: AppContextValue['updateIncidentStatus'] = (params) => {
    const target = state.incidents.find((inc) => inc.id === params.incidentId);
    if (!target) {
      return { ok: false, error: 'Incident record not found.' };
    }
    try {
      const updated = transitionIncidentStatus({
        incident: target,
        toStatus: params.toStatus,
        actorRole: activeRole,
        actorName: params.actorName,
        assignedTo: params.assignedTo,
        correctiveAction: params.correctiveAction,
        resolutionNotes: params.resolutionNotes,
        timestamp: new Date().toISOString(),
      });
      setState((prev) => ({
        ...prev,
        incidents: prev.incidents.map((inc) => (inc.id === updated.id ? updated : inc)),
      }));
      return { ok: true, incident: updated };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Status transition failed.',
      };
    }
  };

  const acknowledgeFatigue: AppContextValue['acknowledgeFatigue'] = (params) => {
    const target = fatigueAlerts.find((a) => a.id === params.alertId);
    if (!target) {
      return { ok: false, error: 'Fatigue alert not found.' };
    }
    try {
      const updated = acknowledgeFatigueAlert({
        alert: target,
        actorRole: activeRole,
        actorName: params.actorName,
        followUpNotes: params.followUpNotes,
        timestamp: new Date().toISOString(),
      });
      setState((prev) => ({
        ...prev,
        fatigueAcknowledgements: {
          ...prev.fatigueAcknowledgements,
          [updated.id]: {
            acknowledged: true,
            acknowledgedBy: updated.acknowledgedBy,
            acknowledgedAt: updated.acknowledgedAt,
            followUpNotes: updated.followUpNotes,
          },
        },
      }));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to acknowledge alert.',
      };
    }
  };

  const updateFatiguePolicy: AppContextValue['updateFatiguePolicy'] = (nextPolicy) => {
    if (activeRole !== 'admin' && activeRole !== 'safety_officer') {
      return {
        ok: false,
        error: `Authorization Denied: Role '${activeRole}' cannot modify fatigue policy thresholds.`,
      };
    }
    setState((prev) => ({
      ...prev,
      fatiguePolicy: {
        ...prev.fatiguePolicy,
        ...nextPolicy,
      },
    }));
    return { ok: true };
  };

  const resolvePayrollDiscrepancy: AppContextValue['resolvePayrollDiscrepancy'] = (
    discrepancyId,
    note
  ) => {
    if (activeRole !== 'admin' && activeRole !== 'safety_officer') {
      return {
        ok: false,
        error: 'Only authorized administrators can reconcile payroll discrepancies.',
      };
    }
    if (!note || note.trim().length < 4) {
      return {
        ok: false,
        error: 'Please enter a reconciliation note (at least 4 characters).',
      };
    }
    setState((prev) => ({
      ...prev,
      payrollDiscrepancies: prev.payrollDiscrepancies.map((p) =>
        p.id === discrepancyId
          ? {
              ...p,
              status: 'RESOLVED_AFTER_REVIEW',
              explanation: `${p.explanation} [Reconciled: ${note.trim()}]`,
            }
          : p
      ),
    }));
    return { ok: true };
  };

  const resetDemoData = () => {
    const fresh = resetAppStateToSeed();
    setState(fresh);
  };

  return (
    <AppContext.Provider
      value={{
        persistenceMode,
        industry,
        setIndustry,
        language,
        setLanguage,
        activeRole,
        setActiveRole,
        selectedWorkerId,
        setSelectedWorkerId,
        selectedWorker,
        workers: state.workers,
        industryWorkers,
        attendance: state.attendance,
        incidents: state.incidents,
        payrollDiscrepancies: state.payrollDiscrepancies,
        fatiguePolicy: state.fatiguePolicy,
        fatigueAlerts,
        riskQueue,
        checkInWorker,
        checkOutWorker,
        submitIncident,
        updateIncidentStatus,
        acknowledgeFatigue,
        updateFatiguePolicy,
        resolvePayrollDiscrepancy,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
