import { describe, expect, it } from 'vitest';
import {
  calculateShiftMetrics,
  completeCheckOutRecord,
  createCheckInRecord,
  validateCheckIn,
  validateCheckOut,
} from '../services/attendanceService';
import {
  calculateWageEstimate,
  evaluatePayrollDiscrepancy,
  formatInr,
} from '../services/wageService';
import {
  canPerformIncidentAction,
  createSafetyIncidentRecord,
  isValidStatusTransition,
  transitionIncidentStatus,
  validateCreateIncidentInput,
} from '../services/incidentService';
import {
  acknowledgeFatigueAlert,
  evaluateFatigueAlerts,
} from '../services/fatigueService';
import {
  compareWhatIfSchedules,
  generateRiskResolutionQueue,
} from '../services/riskEngineService';
import { DEFAULT_FATIGUE_POLICY } from '../config/industries';
import { SEED_ATTENDANCE, SEED_INCIDENTS, SEED_PAYROLL_DISCREPANCIES, SEED_WHAT_IF_PLANS } from '../data/seedData';

describe('Feature A: Attendance & Overtime Calculations', () => {
  it('calculates exact regular and overtime hours with configurable break deductions', () => {
    const res = calculateShiftMetrics(
      '2026-10-27T07:00:00.000Z',
      '2026-10-27T17:30:00.000Z', // 10.5 gross hours = 630 mins
      30, // 30m break -> 600 net mins = 10.0 net hours
      8,
      10
    );
    expect(res.grossDurationMinutes).toBe(630);
    expect(res.netDurationMinutes).toBe(600);
    expect(res.regularHours).toBe(8);
    expect(res.overtimeHours).toBe(2);
    expect(res.status).toBe('COMPLETED');
    expect(res.flags).toHaveLength(0);
  });

  it('handles overtime boundary at exact 8.0 standard shift threshold', () => {
    const exactEight = calculateShiftMetrics(
      '2026-10-27T06:00:00.000Z',
      '2026-10-27T14:30:00.000Z',
      30,
      8,
      10
    );
    expect(exactEight.regularHours).toBe(8);
    expect(exactEight.overtimeHours).toBe(0);
    expect(exactEight.status).toBe('COMPLETED');
  });

  it('flags missing check-outs for human supervisor review', () => {
    const missing = calculateShiftMetrics('2026-10-27T07:00:00.000Z', null, 30, 8, 10);
    expect(missing.status).toBe('FLAGGED_MISSING_CHECKOUT');
    expect(missing.regularHours).toBe(0);
    expect(missing.flags[0]).toContain('MISSING_CHECKOUT');
  });

  it('flags zero-duration shifts or shifts shorter than break deduction', () => {
    const zeroShift = calculateShiftMetrics(
      '2026-10-27T07:00:00.000Z',
      '2026-10-27T07:20:00.000Z',
      30,
      8,
      10
    );
    expect(zeroShift.status).toBe('FLAGGED_ZERO_DURATION');
    expect(zeroShift.netDurationMinutes).toBe(0);
    expect(zeroShift.regularHours).toBe(0);
    expect(zeroShift.overtimeHours).toBe(0);
  });

  it('flags excessive single-shift hours exceeding maxShiftHours policy', () => {
    const excessive = calculateShiftMetrics(
      '2026-10-27T06:00:00.000Z',
      '2026-10-27T18:00:00.000Z', // 12h gross - 0.5h break = 11.5h net
      30,
      8,
      10
    );
    expect(excessive.regularHours).toBe(8);
    expect(excessive.overtimeHours).toBe(3.5);
    expect(excessive.status).toBe('FLAGGED_OVERTIME_REVIEW');
    expect(excessive.flags[0]).toContain('EXCESSIVE_HOURS');
  });

  it('prevents duplicate active check-ins for the same worker', () => {
    const activeRec = createCheckInRecord({
      id: 'ATT-TEST-1',
      workerId: 'worker-con-1',
      workerName: 'Murugan Selvaraj',
      industry: 'construction',
      siteId: 'site-con-chennai-metro',
      departmentId: 'dept-con-scaffolding',
      shiftId: 'shift-con-morning',
      checkInAt: '2026-10-27T07:00:00.000Z',
      breakMinutes: 30,
    });

    const dupCheck = validateCheckIn([activeRec], 'worker-con-1');
    expect(dupCheck.allowed).toBe(false);
    expect(dupCheck.error).toContain('Duplicate check-in blocked');

    const otherWorkerCheck = validateCheckIn([activeRec], 'worker-con-2');
    expect(otherWorkerCheck.allowed).toBe(true);
  });

  it('prevents invalid check-out timestamps earlier than check-in or already completed shifts', () => {
    const activeRec = createCheckInRecord({
      id: 'ATT-TEST-2',
      workerId: 'worker-mfg-1',
      workerName: 'Lakshmi Narayanan',
      industry: 'manufacturing',
      siteId: 'site-mfg-oragadam',
      departmentId: 'dept-mfg-press',
      shiftId: 'shift-mfg-a',
      checkInAt: '2026-10-27T06:00:00.000Z',
      breakMinutes: 30,
    });

    const backwards = validateCheckOut(activeRec, '2026-10-27T05:00:00.000Z', 30);
    expect(backwards.allowed).toBe(false);
    expect(backwards.error).toContain('earlier than check-in');

    const negativeBreak = validateCheckOut(activeRec, '2026-10-27T14:30:00.000Z', -10);
    expect(negativeBreak.allowed).toBe(false);

    const completed = completeCheckOutRecord(
      activeRec,
      '2026-10-27T14:30:00.000Z',
      30
    );
    const secondCheckout = validateCheckOut(completed, '2026-10-27T15:00:00.000Z', 30);
    expect(secondCheckout.allowed).toBe(false);
    expect(secondCheckout.error).toContain('already finalized');
  });
});

describe('Feature C: Wage Insights & Pay Arithmetic', () => {
  it('calculates regular earnings, overtime earnings, gross pay, and net pay accurately with INR formatting', () => {
    const res = calculateWageEstimate({
      regularHours: 24,
      hourlyWageInr: 130,
      overtimeHours: 7,
      overtimeMultiplier: 2.0,
      deductionsInr: 180,
    });

    expect(res.isValid).toBe(true);
    expect(res.regularEarningsInr).toBe(3120); // 24 * 130
    expect(res.overtimeHourlyRateInr).toBe(260); // 130 * 2.0
    expect(res.overtimeEarningsInr).toBe(1820); // 7 * 260
    expect(res.grossPayInr).toBe(4940);
    expect(res.netPayInr).toBe(4760);
    expect(formatInr(res.netPayInr)).toContain('4,760.00');
  });

  it('handles fractional rounding and rejects negative or invalid inputs', () => {
    const neg = calculateWageEstimate({
      regularHours: -4,
      hourlyWageInr: 130,
      overtimeHours: 2,
      overtimeMultiplier: 1.5,
      deductionsInr: 0,
    });
    expect(neg.isValid).toBe(false);
    expect(neg.errors[0]).toContain('non-negative');

    const excessiveDeduction = calculateWageEstimate({
      regularHours: 2,
      hourlyWageInr: 100,
      overtimeHours: 0,
      overtimeMultiplier: 2,
      deductionsInr: 500,
    });
    expect(excessiveDeduction.isValid).toBe(false);
    expect(excessiveDeduction.errors[0]).toContain('cannot exceed gross');
  });

  it('detects discrepancies between recorded overtime and payroll register entries', () => {
    const disc = evaluatePayrollDiscrepancy({
      id: 'PAY-TEST-1',
      workerId: 'worker-con-1',
      workerName: 'Murugan Selvaraj',
      industry: 'construction',
      siteId: 'site-con-chennai-metro',
      departmentId: 'dept-con-scaffolding',
      periodLabel: 'Test Cycle',
      recordedRegularHours: 24,
      payrollRegularHours: 24,
      recordedOvertimeHours: 6,
      payrollOvertimeHours: 3,
      hourlyWageInr: 130,
      overtimeMultiplier: 2.0,
    });
    expect(disc.status).toBe('DISCREPANCY_FLAGGED');
    expect(disc.differenceInr).toBe(780); // 3 missing OT hours * 260
  });
});

describe('Feature B: Safety Incident Management, Privacy & Role Authorization', () => {
  it('strips worker identity on anonymous reports and provides a tracking code', () => {
    const anonIncident = createSafetyIncidentRecord(
      {
        id: 'INC-CON-999',
        industry: 'construction',
        siteId: 'site-con-chennai-metro',
        departmentId: 'dept-con-scaffolding',
        categoryId: 'haz-con-scaffold',
        categoryName: 'Scaffold Instability',
        severity: 'CRITICAL',
        description: 'Unpinned scaffold ledger clamp on East Wing Pier 14.',
        isAnonymous: true,
        workerId: 'worker-con-1',
        workerName: 'Murugan Selvaraj',
        reportedVia: 'TEXT',
        createdAt: '2026-10-27T08:00:00.000Z',
      },
      42
    );

    expect(anonIncident.isAnonymous).toBe(true);
    expect(anonIncident.workerId).toBeNull();
    expect(anonIncident.workerName).toBeNull();
    expect(anonIncident.trackingCode).toMatch(/^ANON-/);
    expect(anonIncident.history[0].actorName).toContain('Anonymous');
  });

  it('validates required inputs when creating a safety report', () => {
    const bad = validateCreateIncidentInput({
      id: 'INC-1',
      industry: 'construction',
      siteId: '',
      departmentId: '',
      categoryId: '',
      categoryName: 'Test',
      severity: 'HIGH',
      description: 'short',
      isAnonymous: true,
      reportedVia: 'TEXT',
      createdAt: '2026-10-27T08:00:00.000Z',
    });
    expect(bad.valid).toBe(false);
    expect(bad.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('enforces OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED lifecycle and role-based authorization', () => {
    expect(isValidStatusTransition('OPEN', 'ASSIGNED')).toBe(true);
    expect(isValidStatusTransition('OPEN', 'RESOLVED')).toBe(false);
    expect(isValidStatusTransition('ASSIGNED', 'IN_PROGRESS')).toBe(true);
    expect(isValidStatusTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
    expect(isValidStatusTransition('RESOLVED', 'OPEN')).toBe(false);

    expect(canPerformIncidentAction('worker', 'CREATE')).toBe(true);
    expect(canPerformIncidentAction('worker', 'ASSIGN')).toBe(false);
    expect(canPerformIncidentAction('worker', 'RESOLVE')).toBe(false);
    expect(canPerformIncidentAction('safety_officer', 'ASSIGN')).toBe(true);
    expect(canPerformIncidentAction('admin', 'RESOLVE')).toBe(true);

    const openIncident = SEED_INCIDENTS[0]; // INC-CON-101 (OPEN)

    // Worker role must be blocked from assigning
    expect(() =>
      transitionIncidentStatus({
        incident: openIncident,
        toStatus: 'ASSIGNED',
        actorRole: 'worker',
        actorName: 'Murugan Selvaraj',
        assignedTo: 'Er. Karthikeyan Subramanian',
        timestamp: '2026-10-27T09:00:00.000Z',
      })
    ).toThrow(/Authorization Denied/);

    // Admin assigns safety officer
    const assigned = transitionIncidentStatus({
      incident: openIncident,
      toStatus: 'ASSIGNED',
      actorRole: 'admin',
      actorName: 'Site Operations Director',
      assignedTo: 'Er. Karthikeyan Subramanian',
      timestamp: '2026-10-27T09:05:00.000Z',
    });
    expect(assigned.status).toBe('ASSIGNED');
    expect(assigned.assignedTo).toBe('Er. Karthikeyan Subramanian');

    // Safety officer records corrective action -> IN_PROGRESS
    const inProgress = transitionIncidentStatus({
      incident: assigned,
      toStatus: 'IN_PROGRESS',
      actorRole: 'safety_officer',
      actorName: 'Er. Karthikeyan Subramanian',
      correctiveAction: 'Installed forged double couplers and perimeter toe-boards on Pier P-14.',
      timestamp: '2026-10-27T09:40:00.000Z',
    });
    expect(inProgress.status).toBe('IN_PROGRESS');

    // Safety officer records resolution verification -> RESOLVED
    const resolved = transitionIncidentStatus({
      incident: inProgress,
      toStatus: 'RESOLVED',
      actorRole: 'safety_officer',
      actorName: 'Er. Karthikeyan Subramanian',
      resolutionNotes: 'Rigging load test passed and green-tagged for crew resumption.',
      timestamp: '2026-10-27T10:15:00.000Z',
    });
    expect(resolved.status).toBe('RESOLVED');
    expect(resolved.resolvedAt).toBe('2026-10-27T10:15:00.000Z');
    expect(resolved.history).toHaveLength(4);
  });
});

describe('Feature D, E & Differentiators: Fatigue Rules, Risk Engine & What-If Simulator', () => {
  it('detects excessive shift hours, insufficient inter-shift rest, and repeated overtime', () => {
    const alerts = evaluateFatigueAlerts(SEED_ATTENDANCE, DEFAULT_FATIGUE_POLICY);
    expect(alerts.length).toBeGreaterThanOrEqual(4);

    const ruleCodes = alerts.map((a) => a.ruleCode);
    expect(ruleCodes).toContain('EXCESSIVE_SHIFT_HOURS');
    expect(ruleCodes).toContain('INSUFFICIENT_REST');
    expect(ruleCodes).toContain('REPEATED_OVERTIME');

    // Verify worker role cannot acknowledge fatigue alert
    expect(() =>
      acknowledgeFatigueAlert({
        alert: alerts[0],
        actorRole: 'worker',
        actorName: 'Worker',
        followUpNotes: 'Trying to self-acknowledge',
        timestamp: '2026-10-27T10:00:00.000Z',
      })
    ).toThrow(/Authorization Denied/);

    // Verify admin can acknowledge with documented follow-up
    const acked = acknowledgeFatigueAlert({
      alert: alerts[0],
      actorRole: 'admin',
      actorName: 'Plant Manager',
      followUpNotes: 'Assigned relief operator for tomorrow morning shift.',
      timestamp: '2026-10-27T10:00:00.000Z',
    });
    expect(acked.acknowledged).toBe(true);
    expect(acked.acknowledgedBy).toBe('Plant Manager');
  });

  it('prioritizes hazards, recurring hotspots, fatigue flags, and payroll discrepancies in the Risk-to-Resolution Engine', () => {
    const alerts = evaluateFatigueAlerts(SEED_ATTENDANCE, DEFAULT_FATIGUE_POLICY);
    const queue = generateRiskResolutionQueue({
      incidents: SEED_INCIDENTS,
      fatigueAlerts: alerts,
      attendanceRecords: SEED_ATTENDANCE,
      payrollDiscrepancies: SEED_PAYROLL_DISCREPANCIES,
      referenceTimeIso: '2026-10-27T10:00:00.000Z',
    });

    expect(queue.length).toBeGreaterThan(0);
    // Highest priority item should be CRITICAL unresolved safety incident
    expect(queue[0].category).toBe('SAFETY_HAZARD');
    expect(queue[0].urgency).toBe('IMMEDIATE');
    expect(queue.some((i) => i.category === 'PAYROLL_DISCREPANCY')).toBe(true);
    expect(queue.some((i) => i.category === 'ATTENDANCE_ANOMALY')).toBe(true);
  });

  it('evaluates What-If proposed schedules and recommends the lower-violation plan', () => {
    const [planA, planB] = SEED_WHAT_IF_PLANS.manufacturing;
    const comparison = compareWhatIfSchedules(planA, planB, DEFAULT_FATIGUE_POLICY);

    expect(comparison.planB.totalRuleViolations).toBeLessThan(
      comparison.planA.totalRuleViolations
    );
    expect(comparison.recommendedPlanId).toBe(planB.id);
    expect(comparison.comparisonSummary).toContain('Plan B');
  });
});
