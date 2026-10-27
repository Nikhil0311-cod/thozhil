export type IndustryId = 'construction' | 'manufacturing';

export type UserRole = 'worker' | 'admin' | 'safety_officer';

export type Language = 'en' | 'ta' | 'hi';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';

export type AttendanceStatus =
  | 'ACTIVE'
  | 'COMPLETED'
  | 'FLAGGED_MISSING_CHECKOUT'
  | 'FLAGGED_ZERO_DURATION'
  | 'FLAGGED_OVERTIME_REVIEW';

export interface LocalizedText {
  en: string;
  ta: string;
  hi: string;
}

export type BilingualText = LocalizedText;

export interface SiteConfig {
  id: string;
  name: BilingualText;
  location: BilingualText;
}

export interface DepartmentConfig {
  id: string;
  name: BilingualText;
  siteId: string;
}

export interface ShiftScheduleConfig {
  id: string;
  name: BilingualText;
  startTime: string; // e.g., "07:00"
  endTime: string;   // e.g., "15:30"
  standardHours: number;
  defaultBreakMinutes: number;
}

export interface HazardCategoryConfig {
  id: string;
  name: BilingualText;
  description: BilingualText;
  defaultSeverity: IncidentSeverity;
  iconName: string;
}

export interface SafetyOfficerConfig {
  id: string;
  name: string;
  roleTitle: string;
  siteId: string;
}

export interface IndustryConfig {
  id: IndustryId;
  name: BilingualText;
  tagline: BilingualText;
  badgeColor: string;
  sites: SiteConfig[];
  departments: DepartmentConfig[];
  shifts: ShiftScheduleConfig[];
  hazardCategories: HazardCategoryConfig[];
  safetyOfficers: SafetyOfficerConfig[];
  defaultHourlyWageInr: number;
  defaultOvertimeMultiplier: number;
  defaultPfEsiDeductionPercent: number;
}

export interface SkillCertification {
  id: string;
  title: BilingualText;
  issuedDate: string;
  verifiedBy: string;
}

export interface WorkerProfile {
  id: string;
  employeeCode: string;
  name: string;
  nameTa: string;
  nameHi: string;
  roleTitle: LocalizedText;
  industry: IndustryId;
  siteId: string;
  departmentId: string;
  shiftId: string;
  hourlyWageInr: number;
  overtimeMultiplier: number;
  standardDeductionInr: number;
  joinedDate: string;
  completedShiftsCount: number;
  skills: SkillCertification[];
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  industry: IndustryId;
  siteId: string;
  departmentId: string;
  shiftId: string;
  date: string; // YYYY-MM-DD
  checkInAt: string; // ISO timestamp
  checkOutAt: string | null; // ISO timestamp or null if active/missing
  breakMinutes: number;
  grossDurationMinutes: number;
  netDurationMinutes: number;
  regularHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
  flags: string[];
  reviewNote?: string;
  reviewedBy?: string;
}

export interface IncidentAuditEntry {
  timestamp: string;
  actorRole: UserRole;
  actorName: string;
  fromStatus: IncidentStatus | null;
  toStatus: IncidentStatus;
  note: string;
}

export interface SafetyIncident {
  id: string;
  trackingCode: string;
  industry: IndustryId;
  siteId: string;
  departmentId: string;
  categoryId: string;
  categoryName: string;
  severity: IncidentSeverity;
  title: string;
  description: string;
  isAnonymous: boolean;
  workerId: string | null;
  workerName: string | null;
  reportedVia: 'TEXT' | 'VOICE';
  status: IncidentStatus;
  assignedTo: string | null;
  correctiveAction: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  history: IncidentAuditEntry[];
}

export interface WageCalculationInput {
  regularHours: number;
  hourlyWageInr: number;
  overtimeHours: number;
  overtimeMultiplier: number;
  deductionsInr: number;
}

export interface WageCalculationResult {
  isValid: boolean;
  errors: string[];
  regularHours: number;
  hourlyWageInr: number;
  overtimeHours: number;
  overtimeMultiplier: number;
  overtimeHourlyRateInr: number;
  regularEarningsInr: number;
  overtimeEarningsInr: number;
  grossPayInr: number;
  deductionsInr: number;
  netPayInr: number;
  formulaSteps: {
    regularStep: string;
    overtimeStep: string;
    grossStep: string;
    netStep: string;
  };
}

export interface PayrollDiscrepancyRecord {
  id: string;
  workerId: string;
  workerName: string;
  industry: IndustryId;
  siteId: string;
  departmentId: string;
  periodLabel: string;
  recordedRegularHours: number;
  payrollRegularHours: number;
  recordedOvertimeHours: number;
  payrollOvertimeHours: number;
  hourlyWageInr: number;
  overtimeMultiplier: number;
  recordedGrossInr: number;
  payrollGrossInr: number;
  differenceInr: number;
  status: 'MATCHED' | 'DISCREPANCY_FLAGGED' | 'RESOLVED_AFTER_REVIEW';
  explanation: string;
}

export interface FatiguePolicyConfig {
  standardShiftHours: number;
  maxShiftHours: number;
  maxWeeklyHours: number;
  minRestHoursBetweenShifts: number;
  maxConsecutiveShifts: number;
  repeatedOvertimeCountThreshold: number;
  defaultBreakMinutes: number;
  defaultOvertimeMultiplier: number;
}

export type FatigueRuleCode =
  | 'EXCESSIVE_SHIFT_HOURS'
  | 'INSUFFICIENT_REST'
  | 'REPEATED_OVERTIME'
  | 'CONSECUTIVE_SHIFTS_LIMIT';

export interface FatigueAlert {
  id: string;
  workerId: string;
  workerName: string;
  industry: IndustryId;
  siteId: string;
  departmentId: string;
  ruleCode: FatigueRuleCode;
  severity: 'MODERATE' | 'HIGH';
  title: string;
  explanation: string;
  relevantRecordIds: string[];
  triggeredValue: string;
  thresholdValue: string;
  acknowledged: boolean;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  followUpNotes: string | null;
}

export interface RiskResolutionItem {
  id: string;
  category:
    | 'SAFETY_HAZARD'
    | 'FATIGUE_VIOLATION'
    | 'PAYROLL_DISCREPANCY'
    | 'ATTENDANCE_ANOMALY'
    | 'RECURRING_HOTSPOT';
  priorityScore: number;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM';
  industry: IndustryId;
  siteId: string;
  departmentId: string;
  title: string;
  whyGenerated: string;
  suggestedAction: string;
  sourceRecordIds: string[];
  scoreBreakdown: string;
}

export interface ProposedWorkerShift {
  workerId: string;
  workerName: string;
  dayIndex: number; // 1 to 7
  shiftHours: number;
  restHoursBefore: number;
}

export interface WhatIfSchedulePlan {
  id: string;
  name: string;
  description: string;
  industry: IndustryId;
  requiredDailyStaff: number;
  shifts: ProposedWorkerShift[];
}

export interface WhatIfPlanEvaluation {
  planId: string;
  planName: string;
  totalProjectedHours: number;
  projectedOvertimeHours: number;
  restViolationCount: number;
  excessiveShiftCount: number;
  consecutiveShiftFlags: number;
  understaffedDaysCount: number;
  totalRuleViolations: number;
  violationDetails: string[];
}

export interface WhatIfComparisonResult {
  planA: WhatIfPlanEvaluation;
  planB: WhatIfPlanEvaluation;
  recommendedPlanId: string;
  comparisonSummary: string;
  reasons: string[];
}
