import {
  AttendanceRecord,
  FatigueAlert,
  FatiguePolicyConfig,
  UserRole,
} from '../types/domain';
import { roundToTwo } from './attendanceService';

export function evaluateFatigueAlerts(
  records: AttendanceRecord[],
  policy: FatiguePolicyConfig,
  existingAcknowledgements: Record<
    string,
    {
      acknowledged: boolean;
      acknowledgedBy: string | null;
      acknowledgedAt: string | null;
      followUpNotes: string | null;
    }
  > = {}
): FatigueAlert[] {
  const alerts: FatigueAlert[] = [];

  // Group completed/reviewed records by workerId
  const byWorker = new Map<string, AttendanceRecord[]>();
  for (const rec of records) {
    if (rec.checkOutAt === null) continue;
    const list = byWorker.get(rec.workerId) || [];
    list.push(rec);
    byWorker.set(rec.workerId, list);
  }

  for (const [workerId, workerRecords] of byWorker.entries()) {
    const sorted = [...workerRecords].sort(
      (a, b) => Date.parse(a.checkInAt) - Date.parse(b.checkInAt)
    );
    if (sorted.length === 0) continue;

    const latest = sorted[sorted.length - 1];

    // Rule 1: Excessive single-shift recorded hours (> policy.maxShiftHours)
    const excessiveRecords = sorted.filter(
      (r) => roundToTwo(r.regularHours + r.overtimeHours) > policy.maxShiftHours
    );
    if (excessiveRecords.length > 0) {
      const worst = excessiveRecords.reduce((prev, curr) =>
        curr.regularHours + curr.overtimeHours > prev.regularHours + prev.overtimeHours
          ? curr
          : prev
      );
      const totalH = roundToTwo(worst.regularHours + worst.overtimeHours);
      const alertId = `FATIGUE-${workerId}-EXCESSIVE_SHIFT_HOURS`;
      const ack = existingAcknowledgements[alertId];

      alerts.push({
        id: alertId,
        workerId,
        workerName: latest.workerName,
        industry: latest.industry,
        siteId: latest.siteId,
        departmentId: latest.departmentId,
        ruleCode: 'EXCESSIVE_SHIFT_HOURS',
        severity: totalH >= policy.maxShiftHours + 2 ? 'HIGH' : 'MODERATE',
        title: `Excessive Single-Shift Hours (${totalH}h recorded)`,
        explanation: `Rule Triggered: Worker ${latest.workerName} logged ${totalH} net hours on ${worst.date} (Record ${worst.id}), exceeding the configured single-shift limit of ${policy.maxShiftHours} hours. Advisory review only — verify hydration, rest break compliance, and relief staffing.`,
        relevantRecordIds: excessiveRecords.map((r) => r.id),
        triggeredValue: `${totalH} hrs`,
        thresholdValue: `Max ${policy.maxShiftHours} hrs/shift`,
        acknowledged: ack?.acknowledged ?? false,
        acknowledgedBy: ack?.acknowledgedBy ?? null,
        acknowledgedAt: ack?.acknowledgedAt ?? null,
        followUpNotes: ack?.followUpNotes ?? null,
      });
    }

    // Rule 2: Insufficient rest between consecutive shifts (< policy.minRestHoursBetweenShifts)
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (!prev.checkOutAt) continue;

      const restHours = roundToTwo(
        (Date.parse(curr.checkInAt) - Date.parse(prev.checkOutAt)) / 3600000
      );
      if (restHours >= 0 && restHours < policy.minRestHoursBetweenShifts) {
        const alertId = `FATIGUE-${workerId}-INSUFFICIENT_REST`;
        const ack = existingAcknowledgements[alertId];
        alerts.push({
          id: alertId,
          workerId,
          workerName: latest.workerName,
          industry: latest.industry,
          siteId: curr.siteId,
          departmentId: curr.departmentId,
          ruleCode: 'INSUFFICIENT_REST',
          severity: restHours < 8 ? 'HIGH' : 'MODERATE',
          title: `Insufficient Inter-Shift Rest (${restHours}h rest window)`,
          explanation: `Rule Triggered: Turnaround rest between shift ${prev.id} (out ${prev.checkOutAt.slice(11, 16)}) and shift ${curr.id} (in ${curr.checkInAt.slice(11, 16)}) was ${restHours} hours, below the configured minimum rest period of ${policy.minRestHoursBetweenShifts} hours.`,
          relevantRecordIds: [prev.id, curr.id],
          triggeredValue: `${restHours} hrs rest`,
          thresholdValue: `Min ${policy.minRestHoursBetweenShifts} hrs rest`,
          acknowledged: ack?.acknowledged ?? false,
          acknowledgedBy: ack?.acknowledgedBy ?? null,
          acknowledgedAt: ack?.acknowledgedAt ?? null,
          followUpNotes: ack?.followUpNotes ?? null,
        });
        break;
      }
    }

    // Rule 3: Repeated overtime shifts (>= policy.repeatedOvertimeCountThreshold)
    const overtimeShifts = sorted.filter((r) => r.overtimeHours > 0);
    if (overtimeShifts.length >= policy.repeatedOvertimeCountThreshold) {
      const totalOt = roundToTwo(
        overtimeShifts.reduce((sum, r) => sum + r.overtimeHours, 0)
      );
      const alertId = `FATIGUE-${workerId}-REPEATED_OVERTIME`;
      const ack = existingAcknowledgements[alertId];
      alerts.push({
        id: alertId,
        workerId,
        workerName: latest.workerName,
        industry: latest.industry,
        siteId: latest.siteId,
        departmentId: latest.departmentId,
        ruleCode: 'REPEATED_OVERTIME',
        severity: overtimeShifts.length >= policy.repeatedOvertimeCountThreshold + 1 ? 'HIGH' : 'MODERATE',
        title: `Repeated Overtime Pattern (${overtimeShifts.length} OT shifts / ${totalOt}h OT)`,
        explanation: `Rule Triggered: Worker ${latest.workerName} recorded overtime in ${overtimeShifts.length} shifts (${totalOt} total OT hours across records ${overtimeShifts.map((r) => r.id).join(', ')}), reaching the configured threshold of ${policy.repeatedOvertimeCountThreshold} overtime shifts.`,
        relevantRecordIds: overtimeShifts.map((r) => r.id),
        triggeredValue: `${overtimeShifts.length} OT shifts (${totalOt}h)`,
        thresholdValue: `Max ${policy.repeatedOvertimeCountThreshold} OT shifts`,
        acknowledged: ack?.acknowledged ?? false,
        acknowledgedBy: ack?.acknowledgedBy ?? null,
        acknowledgedAt: ack?.acknowledgedAt ?? null,
        followUpNotes: ack?.followUpNotes ?? null,
      });
    }

    // Rule 4: Consecutive shifts exceeding configured limit (> policy.maxConsecutiveShifts)
    const uniqueDates = Array.from(new Set(sorted.map((r) => r.date))).sort();
    let maxStreak = 0;
    let currentStreak = 0;
    let streakDates: string[] = [];
    let bestStreakDates: string[] = [];

    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
        streakDates = [uniqueDates[0]];
      } else {
        const prevDate = new Date(`${uniqueDates[i - 1]}T00:00:00Z`);
        const currDate = new Date(`${uniqueDates[i]}T00:00:00Z`);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
        if (diffDays === 1) {
          currentStreak += 1;
          streakDates.push(uniqueDates[i]);
        } else {
          currentStreak = 1;
          streakDates = [uniqueDates[i]];
        }
      }
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        bestStreakDates = [...streakDates];
      }
    }

    if (maxStreak > policy.maxConsecutiveShifts) {
      const relevantRecs = sorted.filter((r) => bestStreakDates.includes(r.date));
      const alertId = `FATIGUE-${workerId}-CONSECUTIVE_SHIFTS_LIMIT`;
      const ack = existingAcknowledgements[alertId];
      alerts.push({
        id: alertId,
        workerId,
        workerName: latest.workerName,
        industry: latest.industry,
        siteId: latest.siteId,
        departmentId: latest.departmentId,
        ruleCode: 'CONSECUTIVE_SHIFTS_LIMIT',
        severity: 'HIGH',
        title: `Consecutive Shifts Exceeded (${maxStreak} consecutive days)`,
        explanation: `Rule Triggered: Worker ${latest.workerName} worked ${maxStreak} consecutive days (${bestStreakDates[0]} to ${bestStreakDates[bestStreakDates.length - 1]}), exceeding the configured maximum of ${policy.maxConsecutiveShifts} consecutive shifts without a rest day.`,
        relevantRecordIds: relevantRecs.map((r) => r.id),
        triggeredValue: `${maxStreak} consecutive days`,
        thresholdValue: `Max ${policy.maxConsecutiveShifts} consecutive days`,
        acknowledged: ack?.acknowledged ?? false,
        acknowledgedBy: ack?.acknowledgedBy ?? null,
        acknowledgedAt: ack?.acknowledgedAt ?? null,
        followUpNotes: ack?.followUpNotes ?? null,
      });
    }
  }

  return alerts;
}

export function acknowledgeFatigueAlert(params: {
  alert: FatigueAlert;
  actorRole: UserRole;
  actorName: string;
  followUpNotes: string;
  timestamp: string;
}): FatigueAlert {
  if (params.actorRole !== 'admin' && params.actorRole !== 'safety_officer') {
    throw new Error(
      `Authorization Denied: Role '${params.actorRole}' cannot acknowledge fatigue flags.`
    );
  }
  const cleanNotes = (params.followUpNotes || '').trim();
  if (cleanNotes.length < 5) {
    throw new Error(
      'Follow-up documentation note (at least 5 characters) is required when acknowledging a fatigue alert.'
    );
  }
  return {
    ...params.alert,
    acknowledged: true,
    acknowledgedBy: params.actorName.trim() || 'Authorized Supervisor',
    acknowledgedAt: params.timestamp,
    followUpNotes: cleanNotes,
  };
}
