import { AttendanceRecord, AttendanceStatus, IndustryId } from '../types/domain';

export interface ShiftCalculationResult {
  grossDurationMinutes: number;
  netDurationMinutes: number;
  totalNetHours: number;
  regularHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
  flags: string[];
}

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function validateCheckIn(
  records: AttendanceRecord[],
  workerId: string
): { allowed: boolean; error?: string } {
  if (!workerId || !workerId.trim()) {
    return { allowed: false, error: 'Worker ID is required to check in.' };
  }
  const activeRecord = records.find(
    (r) => r.workerId === workerId && r.status === 'ACTIVE' && r.checkOutAt === null
  );
  if (activeRecord) {
    return {
      allowed: false,
      error: `Duplicate check-in blocked: Worker already has an active shift (${activeRecord.id}) started at ${activeRecord.checkInAt}.`,
    };
  }
  return { allowed: true };
}

export function validateCheckOut(
  record: AttendanceRecord | undefined,
  checkOutIso: string,
  breakMinutes: number
): { allowed: boolean; error?: string } {
  if (!record) {
    return { allowed: false, error: 'Cannot check out: No active attendance record found.' };
  }
  if (record.status !== 'ACTIVE' || record.checkOutAt !== null) {
    return {
      allowed: false,
      error: `Cannot check out: Shift ${record.id} is already finalized with status ${record.status}.`,
    };
  }
  if (!Number.isFinite(breakMinutes) || breakMinutes < 0 || breakMinutes > 240) {
    return {
      allowed: false,
      error: 'Break deduction must be between 0 and 240 minutes.',
    };
  }
  const inMs = Date.parse(record.checkInAt);
  const outMs = Date.parse(checkOutIso);
  if (Number.isNaN(inMs) || Number.isNaN(outMs)) {
    return { allowed: false, error: 'Invalid check-in or check-out timestamp format.' };
  }
  if (outMs < inMs) {
    return {
      allowed: false,
      error: 'Invalid check-out: Check-out timestamp cannot be earlier than check-in timestamp.',
    };
  }
  return { allowed: true };
}

export function calculateShiftMetrics(
  checkInIso: string,
  checkOutIso: string | null,
  breakMinutes: number,
  standardShiftHours = 8,
  maxShiftHours = 10
): ShiftCalculationResult {
  if (checkOutIso === null) {
    return {
      grossDurationMinutes: 0,
      netDurationMinutes: 0,
      totalNetHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      status: 'FLAGGED_MISSING_CHECKOUT',
      flags: ['MISSING_CHECKOUT: Shift has no recorded check-out timestamp; flagged for supervisor review.'],
    };
  }

  const inMs = Date.parse(checkInIso);
  const outMs = Date.parse(checkOutIso);
  const grossMinutes = Math.max(0, Math.round((outMs - inMs) / 60000));
  const safeBreak = Math.max(0, Math.round(breakMinutes));

  if (grossMinutes === 0 || grossMinutes <= safeBreak) {
    return {
      grossDurationMinutes: grossMinutes,
      netDurationMinutes: 0,
      totalNetHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      status: 'FLAGGED_ZERO_DURATION',
      flags: [
        `ZERO_NET_DURATION: Gross shift duration (${grossMinutes} min) is less than or equal to break deduction (${safeBreak} min).`,
      ],
    };
  }

  const netMinutes = grossMinutes - safeBreak;
  const totalNetHours = roundToTwo(netMinutes / 60);
  const regularHours = roundToTwo(Math.min(totalNetHours, standardShiftHours));
  const overtimeHours = roundToTwo(Math.max(0, totalNetHours - standardShiftHours));

  const flags: string[] = [];
  let status: AttendanceStatus = 'COMPLETED';

  if (totalNetHours > maxShiftHours) {
    status = 'FLAGGED_OVERTIME_REVIEW';
    flags.push(
      `EXCESSIVE_HOURS: Net shift duration (${totalNetHours}h) exceeds configured single-shift limit (${maxShiftHours}h).`
    );
  }

  return {
    grossDurationMinutes: grossMinutes,
    netDurationMinutes: netMinutes,
    totalNetHours,
    regularHours,
    overtimeHours,
    status,
    flags,
  };
}

export function createCheckInRecord(params: {
  id: string;
  workerId: string;
  workerName: string;
  industry: IndustryId;
  siteId: string;
  departmentId: string;
  shiftId: string;
  checkInAt: string;
  breakMinutes: number;
}): AttendanceRecord {
  const datePart = params.checkInAt.slice(0, 10);
  return {
    id: params.id,
    workerId: params.workerId,
    workerName: params.workerName,
    industry: params.industry,
    siteId: params.siteId,
    departmentId: params.departmentId,
    shiftId: params.shiftId,
    date: datePart,
    checkInAt: params.checkInAt,
    checkOutAt: null,
    breakMinutes: params.breakMinutes,
    grossDurationMinutes: 0,
    netDurationMinutes: 0,
    regularHours: 0,
    overtimeHours: 0,
    status: 'ACTIVE',
    flags: [],
  };
}

export function completeCheckOutRecord(
  record: AttendanceRecord,
  checkOutAt: string,
  breakMinutes: number,
  standardShiftHours = 8,
  maxShiftHours = 10
): AttendanceRecord {
  const validation = validateCheckOut(record, checkOutAt, breakMinutes);
  if (!validation.allowed) {
    throw new Error(validation.error);
  }

  const metrics = calculateShiftMetrics(
    record.checkInAt,
    checkOutAt,
    breakMinutes,
    standardShiftHours,
    maxShiftHours
  );

  return {
    ...record,
    checkOutAt,
    breakMinutes,
    grossDurationMinutes: metrics.grossDurationMinutes,
    netDurationMinutes: metrics.netDurationMinutes,
    regularHours: metrics.regularHours,
    overtimeHours: metrics.overtimeHours,
    status: metrics.status,
    flags: metrics.flags,
  };
}
