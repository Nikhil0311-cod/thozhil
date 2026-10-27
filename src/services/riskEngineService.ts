import {
  AttendanceRecord,
  FatigueAlert,
  FatiguePolicyConfig,
  PayrollDiscrepancyRecord,
  RiskResolutionItem,
  SafetyIncident,
  WhatIfComparisonResult,
  WhatIfPlanEvaluation,
  WhatIfSchedulePlan,
} from '../types/domain';
import { roundToTwo } from './attendanceService';

const SEVERITY_BASE_SCORE: Record<SafetyIncident['severity'], number> = {
  CRITICAL: 85,
  HIGH: 65,
  MEDIUM: 40,
  LOW: 25,
};

/**
 * Deterministic, explainable Risk-to-Resolution Engine (Section 10).
 * Connects safety incidents, fatigue violations, attendance anomalies, and payroll discrepancies
 * using transparent rules without fabricated AI claims.
 */
export function generateRiskResolutionQueue(params: {
  incidents: SafetyIncident[];
  fatigueAlerts: FatigueAlert[];
  attendanceRecords: AttendanceRecord[];
  payrollDiscrepancies: PayrollDiscrepancyRecord[];
  referenceTimeIso?: string;
}): RiskResolutionItem[] {
  const items: RiskResolutionItem[] = [];
  const refMs = params.referenceTimeIso
    ? Date.parse(params.referenceTimeIso)
    : Date.now();

  // 1. Unresolved Safety Incidents prioritized by severity and hours open
  for (const inc of params.incidents) {
    if (inc.status === 'RESOLVED') continue;

    const createdMs = Date.parse(inc.createdAt);
    const hoursOpen = Math.max(0, Math.round((refMs - createdMs) / 3600000));
    const baseScore = SEVERITY_BASE_SCORE[inc.severity];
    const ageBonus = Math.min(20, Math.floor(hoursOpen / 2));
    const unassignedPenalty = inc.status === 'OPEN' ? 5 : 0;
    const priorityScore = Math.min(100, baseScore + ageBonus + unassignedPenalty);

    const urgency: RiskResolutionItem['urgency'] =
      inc.severity === 'CRITICAL' || priorityScore >= 80
        ? 'IMMEDIATE'
        : inc.severity === 'HIGH' || priorityScore >= 60
        ? 'HIGH'
        : 'MEDIUM';

    const suggestedAction =
      inc.status === 'OPEN'
        ? `Assign an authorized Safety Officer immediately and inspect ${inc.categoryName} at ${inc.siteId}.`
        : inc.status === 'ASSIGNED'
        ? `Safety Officer (${inc.assignedTo}) should initiate physical containment and log corrective action to move status to IN_PROGRESS.`
        : `Verify physical hazard mitigation ("${inc.correctiveAction}") and record final sign-off notes to mark RESOLVED.`;

    items.push({
      id: `RISK-INC-${inc.id}`,
      category: 'SAFETY_HAZARD',
      priorityScore,
      urgency,
      industry: inc.industry,
      siteId: inc.siteId,
      departmentId: inc.departmentId,
      title: `[${inc.severity}] Unresolved ${inc.categoryName} (${inc.id})`,
      whyGenerated: `Incident ${inc.id} has been ${inc.status} for ${hoursOpen}h with ${inc.severity} severity.`,
      suggestedAction,
      sourceRecordIds: [inc.id],
      scoreBreakdown: `Base(${inc.severity}=${baseScore}) + Age(${hoursOpen}h=+${ageBonus}) + Unassigned(+${unassignedPenalty}) = ${priorityScore}/100`,
    });
  }

  // 2. Recurring Hazard Hotspots by Department (2+ incidents in same department)
  const deptIncidentGroups = new Map<string, SafetyIncident[]>();
  for (const inc of params.incidents) {
    const key = `${inc.industry}::${inc.siteId}::${inc.departmentId}`;
    const group = deptIncidentGroups.get(key) || [];
    group.push(inc);
    deptIncidentGroups.set(key, group);
  }

  for (const [key, group] of deptIncidentGroups.entries()) {
    const unresolvedCount = group.filter((g) => g.status !== 'RESOLVED').length;
    if (group.length >= 2 && unresolvedCount >= 1) {
      const [industry, siteId, departmentId] = key.split('::') as [
        SafetyIncident['industry'],
        string,
        string,
      ];
      const priorityScore = Math.min(82, 45 + group.length * 10 + unresolvedCount * 6);
      items.push({
        id: `RISK-HOTSPOT-${departmentId}`,
        category: 'RECURRING_HOTSPOT',
        priorityScore,
        urgency: priorityScore >= 75 ? 'HIGH' : 'MEDIUM',
        industry,
        siteId,
        departmentId,
        title: `Recurring Hazard Cluster (${group.length} reports in department)`,
        whyGenerated: `Deterministic aggregation found ${group.length} safety reports (${unresolvedCount} unresolved) in department ${departmentId}: ${group.map((g) => g.id).join(', ')}.`,
        suggestedAction: `Conduct a targeted department toolbox safety audit and verify preventive engineering controls across ${departmentId}.`,
        sourceRecordIds: group.map((g) => g.id),
        scoreBreakdown: `ClusterBase(45) + Count(${group.length}×10) + Open(${unresolvedCount}×6) = ${priorityScore}/100`,
      });
    }
  }

  // 3. Unacknowledged Fatigue Alerts
  for (const alert of params.fatigueAlerts) {
    if (alert.acknowledged) continue;
    const base = alert.severity === 'HIGH' ? 68 : 48;
    const ruleBonus = alert.ruleCode === 'INSUFFICIENT_REST' ? 8 : 4;
    const priorityScore = Math.min(95, base + ruleBonus);

    items.push({
      id: `RISK-FAT-${alert.id}`,
      category: 'FATIGUE_VIOLATION',
      priorityScore,
      urgency: alert.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
      industry: alert.industry,
      siteId: alert.siteId,
      departmentId: alert.departmentId,
      title: `${alert.title} — ${alert.workerName}`,
      whyGenerated: alert.explanation,
      suggestedAction: `Review shift roster for ${alert.workerName}, ensure mandatory rest period before next assignment, and log supervisor follow-up.`,
      sourceRecordIds: alert.relevantRecordIds,
      scoreBreakdown: `FatigueSeverity(${alert.severity}=${base}) + RuleWeight(+${ruleBonus}) = ${priorityScore}/100`,
    });
  }

  // 4. Attendance Anomalies (missing check-outs or zero-duration shifts)
  for (const att of params.attendanceRecords) {
    if (
      att.status === 'FLAGGED_MISSING_CHECKOUT' ||
      att.status === 'FLAGGED_ZERO_DURATION'
    ) {
      const priorityScore = att.status === 'FLAGGED_MISSING_CHECKOUT' ? 62 : 45;
      items.push({
        id: `RISK-ATT-${att.id}`,
        category: 'ATTENDANCE_ANOMALY',
        priorityScore,
        urgency: 'MEDIUM',
        industry: att.industry,
        siteId: att.siteId,
        departmentId: att.departmentId,
        title: `Attendance Exception (${att.status.replace('FLAGGED_', '')}) — ${att.workerName}`,
        whyGenerated: `Attendance record ${att.id} on ${att.date} for ${att.workerName} is flagged: ${att.flags.join(' ')}`,
        suggestedAction: `Verify physical gate log with ${att.workerName} and supervisor before payroll cutoff; do not silently alter timestamps.`,
        sourceRecordIds: [att.id],
        scoreBreakdown: `AnomalyRule(${att.status}=${priorityScore}/100)`,
      });
    }
  }

  // 5. Payroll vs Recorded Attendance Discrepancies
  for (const pay of params.payrollDiscrepancies) {
    if (pay.status !== 'DISCREPANCY_FLAGGED') continue;
    const priorityScore = Math.min(85, 58 + Math.min(25, Math.round(Math.abs(pay.differenceInr) / 50)));
    items.push({
      id: `RISK-PAY-${pay.id}`,
      category: 'PAYROLL_DISCREPANCY',
      priorityScore,
      urgency: Math.abs(pay.differenceInr) >= 500 ? 'HIGH' : 'MEDIUM',
      industry: pay.industry,
      siteId: pay.siteId,
      departmentId: pay.departmentId,
      title: `Wage & Hours Discrepancy (${pay.workerName} — ₹${Math.abs(pay.differenceInr)})`,
      whyGenerated: pay.explanation,
      suggestedAction: `Reconcile SmartShift attendance records against payroll register for ${pay.workerName} (${pay.periodLabel}) so uncounted overtime is paid accurately.`,
      sourceRecordIds: [pay.id],
      scoreBreakdown: `DiscrepancyBase(58) + AmountWeight(₹${Math.abs(pay.differenceInr)}) = ${priorityScore}/100`,
    });
  }

  return items.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Optional Differentiator (Section 11): FairShift What-If Shift Schedule Simulator.
 * Evaluates two proposed schedules against configured fatigue & staffing rules.
 */
export function evaluateProposedSchedule(
  plan: WhatIfSchedulePlan,
  policy: FatiguePolicyConfig
): WhatIfPlanEvaluation {
  let totalProjectedHours = 0;
  let projectedOvertimeHours = 0;
  let restViolationCount = 0;
  let excessiveShiftCount = 0;
  let consecutiveShiftFlags = 0;
  const violationDetails: string[] = [];

  const shiftsByDay = new Map<number, number>();
  const shiftsByWorker = new Map<string, typeof plan.shifts>();

  for (const s of plan.shifts) {
    if (s.shiftHours <= 0) continue;
    totalProjectedHours = roundToTwo(totalProjectedHours + s.shiftHours);
    const ot = Math.max(0, roundToTwo(s.shiftHours - policy.standardShiftHours));
    projectedOvertimeHours = roundToTwo(projectedOvertimeHours + ot);

    if (s.shiftHours > policy.maxShiftHours) {
      excessiveShiftCount += 1;
      violationDetails.push(
        `Day ${s.dayIndex}: ${s.workerName} scheduled for ${s.shiftHours}h (exceeds ${policy.maxShiftHours}h max shift limit).`
      );
    }

    if (s.restHoursBefore > 0 && s.restHoursBefore < policy.minRestHoursBetweenShifts) {
      restViolationCount += 1;
      violationDetails.push(
        `Day ${s.dayIndex}: ${s.workerName} has only ${s.restHoursBefore}h rest before shift (below ${policy.minRestHoursBetweenShifts}h minimum).`
      );
    }

    shiftsByDay.set(s.dayIndex, (shiftsByDay.get(s.dayIndex) || 0) + 1);
    const workerList = shiftsByWorker.get(s.workerId) || [];
    workerList.push(s);
    shiftsByWorker.set(s.workerId, workerList);
  }

  for (const [, workerShifts] of shiftsByWorker.entries()) {
    const activeDays = new Set(workerShifts.filter((s) => s.shiftHours > 0).map((s) => s.dayIndex));
    if (activeDays.size > policy.maxConsecutiveShifts) {
      consecutiveShiftFlags += 1;
      const wName = workerShifts[0]?.workerName || 'Worker';
      violationDetails.push(
        `${wName} is scheduled for ${activeDays.size} consecutive days (exceeds limit of ${policy.maxConsecutiveShifts} days without rest).`
      );
    }
  }

  let understaffedDaysCount = 0;
  for (let day = 1; day <= 7; day++) {
    const count = shiftsByDay.get(day) || 0;
    if (count < plan.requiredDailyStaff) {
      understaffedDaysCount += 1;
      violationDetails.push(
        `Day ${day}: Staffing coverage is ${count}/${plan.requiredDailyStaff} required operators.`
      );
    }
  }

  const totalRuleViolations =
    restViolationCount +
    excessiveShiftCount +
    consecutiveShiftFlags +
    understaffedDaysCount;

  return {
    planId: plan.id,
    planName: plan.name,
    totalProjectedHours,
    projectedOvertimeHours,
    restViolationCount,
    excessiveShiftCount,
    consecutiveShiftFlags,
    understaffedDaysCount,
    totalRuleViolations,
    violationDetails,
  };
}

export function compareWhatIfSchedules(
  planA: WhatIfSchedulePlan,
  planB: WhatIfSchedulePlan,
  policy: FatiguePolicyConfig
): WhatIfComparisonResult {
  const evalA = evaluateProposedSchedule(planA, policy);
  const evalB = evaluateProposedSchedule(planB, policy);

  const bIsBetter =
    evalB.totalRuleViolations < evalA.totalRuleViolations ||
    (evalB.totalRuleViolations === evalA.totalRuleViolations &&
      evalB.projectedOvertimeHours < evalA.projectedOvertimeHours);

  const recommended = bIsBetter ? evalB : evalA;
  const alternative = bIsBetter ? evalA : evalB;

  const reasons: string[] = [
    `${recommended.planName} generates ${recommended.totalRuleViolations} total rule violations compared to ${alternative.totalRuleViolations} in ${alternative.planName}.`,
    `Projected overtime is ${recommended.projectedOvertimeHours}h in ${recommended.planName} vs ${alternative.projectedOvertimeHours}h in ${alternative.planName}.`,
    `Inter-shift rest violations: ${recommended.restViolationCount} (${recommended.planName}) vs ${alternative.restViolationCount} (${alternative.planName}).`,
    `Consecutive-shift limit flags: ${recommended.consecutiveShiftFlags} (${recommended.planName}) vs ${alternative.consecutiveShiftFlags} (${alternative.planName}).`,
  ];

  return {
    planA: evalA,
    planB: evalB,
    recommendedPlanId: recommended.planId,
    comparisonSummary: `${recommended.planName} is recommended because it reduces rule violations by ${Math.max(
      0,
      alternative.totalRuleViolations - recommended.totalRuleViolations
    )} and lowers projected overtime exposure by ${roundToTwo(
      Math.max(0, alternative.projectedOvertimeHours - recommended.projectedOvertimeHours)
    )} hours while maintaining shift coverage.`,
    reasons,
  };
}
