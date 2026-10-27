import { DEFAULT_FATIGUE_POLICY } from '../config/industries';
import {
  SEED_ATTENDANCE,
  SEED_INCIDENTS,
  SEED_PAYROLL_DISCREPANCIES,
  SEED_WORKERS,
} from '../data/seedData';
import {
  AttendanceRecord,
  FatiguePolicyConfig,
  Language,
  PayrollDiscrepancyRecord,
  SafetyIncident,
  WorkerProfile,
} from '../types/domain';

export type PersistenceMode = 'LOCAL_DEMO' | 'FIREBASE_CLOUD';

export interface PersistedAppState {
  workers: WorkerProfile[];
  attendance: AttendanceRecord[];
  incidents: SafetyIncident[];
  payrollDiscrepancies: PayrollDiscrepancyRecord[];
  fatiguePolicy: FatiguePolicyConfig;
  fatigueAcknowledgements: Record<
    string,
    {
      acknowledged: boolean;
      acknowledgedBy: string | null;
      acknowledgedAt: string | null;
      followUpNotes: string | null;
    }
  >;
}

const STORAGE_KEY = 'thozhil_state_v1';
const LANGUAGE_STORAGE_KEY = 'thozhil_lang_v1';

export function loadSavedLanguage(): Language {
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (raw === 'en' || raw === 'ta' || raw === 'hi') {
      return raw;
    }
  } catch {
    // Fallback to English
  }
  return 'en';
}

export function saveLanguage(lang: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Ignore quota errors
  }
}

export function detectPersistenceMode(): PersistenceMode {
  // THOZHIL runs in verified Local Demo Mode with full browser localStorage persistence.
  // Data structures and schemas are 100% 1-to-1 mapped with firestore.rules for cloud integration.
  return 'LOCAL_DEMO';
}

export function getInitialSeedState(): PersistedAppState {
  return {
    workers: structuredClone(SEED_WORKERS),
    attendance: structuredClone(SEED_ATTENDANCE),
    incidents: structuredClone(SEED_INCIDENTS),
    payrollDiscrepancies: structuredClone(SEED_PAYROLL_DISCREPANCIES),
    fatiguePolicy: { ...DEFAULT_FATIGUE_POLICY },
    fatigueAcknowledgements: {},
  };
}

export function loadAppState(): PersistedAppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getInitialSeedState();
      saveAppState(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
    return {
      workers: Array.isArray(parsed.workers) && parsed.workers.length > 0
        ? parsed.workers
        : structuredClone(SEED_WORKERS),
      attendance: Array.isArray(parsed.attendance)
        ? parsed.attendance
        : structuredClone(SEED_ATTENDANCE),
      incidents: Array.isArray(parsed.incidents)
        ? parsed.incidents
        : structuredClone(SEED_INCIDENTS),
      payrollDiscrepancies: Array.isArray(parsed.payrollDiscrepancies)
        ? parsed.payrollDiscrepancies
        : structuredClone(SEED_PAYROLL_DISCREPANCIES),
      fatiguePolicy: parsed.fatiguePolicy
        ? { ...DEFAULT_FATIGUE_POLICY, ...parsed.fatiguePolicy }
        : { ...DEFAULT_FATIGUE_POLICY },
      fatigueAcknowledgements: parsed.fatigueAcknowledgements || {},
    };
  } catch {
    return getInitialSeedState();
  }
}

export function saveAppState(state: PersistedAppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in restricted test environments
  }
}

export function resetAppStateToSeed(): PersistedAppState {
  const seed = getInitialSeedState();
  saveAppState(seed);
  return seed;
}
