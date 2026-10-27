import {
  IndustryId,
  PayrollDiscrepancyRecord,
  WageCalculationInput,
  WageCalculationResult,
} from '../types/domain';
import { roundToTwo } from './attendanceService';

export function formatInr(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateWageEstimate(input: WageCalculationInput): WageCalculationResult {
  const errors: string[] = [];

  if (!Number.isFinite(input.regularHours) || input.regularHours < 0) {
    errors.push('Regular hours must be a non-negative number.');
  } else if (input.regularHours > 744) {
    errors.push('Regular hours cannot exceed 744 hours in a single period.');
  }

  if (!Number.isFinite(input.hourlyWageInr) || input.hourlyWageInr <= 0) {
    errors.push('Hourly wage must be greater than ₹0.');
  }

  if (!Number.isFinite(input.overtimeHours) || input.overtimeHours < 0) {
    errors.push('Overtime hours must be a non-negative number.');
  } else if (input.overtimeHours > 300) {
    errors.push('Overtime hours cannot exceed 300 hours in a single period.');
  }

  if (!Number.isFinite(input.overtimeMultiplier) || input.overtimeMultiplier < 1) {
    errors.push('Overtime multiplier must be at least 1.0x.');
  } else if (input.overtimeMultiplier > 5) {
    errors.push('Overtime multiplier cannot exceed 5.0x.');
  }

  if (!Number.isFinite(input.deductionsInr) || input.deductionsInr < 0) {
    errors.push('Deductions must be a non-negative amount.');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      regularHours: 0,
      hourlyWageInr: 0,
      overtimeHours: 0,
      overtimeMultiplier: 0,
      overtimeHourlyRateInr: 0,
      regularEarningsInr: 0,
      overtimeEarningsInr: 0,
      grossPayInr: 0,
      deductionsInr: 0,
      netPayInr: 0,
      formulaSteps: {
        regularStep: 'Invalid input',
        overtimeStep: 'Invalid input',
        grossStep: 'Invalid input',
        netStep: 'Invalid input',
      },
    };
  }

  const regularHours = roundToTwo(input.regularHours);
  const hourlyWageInr = roundToTwo(input.hourlyWageInr);
  const overtimeHours = roundToTwo(input.overtimeHours);
  const overtimeMultiplier = roundToTwo(input.overtimeMultiplier);
  const deductionsInr = roundToTwo(input.deductionsInr);

  const overtimeHourlyRateInr = roundToTwo(hourlyWageInr * overtimeMultiplier);
  const regularEarningsInr = roundToTwo(regularHours * hourlyWageInr);
  const overtimeEarningsInr = roundToTwo(overtimeHours * overtimeHourlyRateInr);
  const grossPayInr = roundToTwo(regularEarningsInr + overtimeEarningsInr);

  if (deductionsInr > grossPayInr) {
    errors.push('Deductions cannot exceed gross estimated earnings.');
    return {
      isValid: false,
      errors,
      regularHours,
      hourlyWageInr,
      overtimeHours,
      overtimeMultiplier,
      overtimeHourlyRateInr,
      regularEarningsInr,
      overtimeEarningsInr,
      grossPayInr,
      deductionsInr,
      netPayInr: 0,
      formulaSteps: {
        regularStep: `${regularHours}h × ${formatInr(hourlyWageInr)}/h = ${formatInr(regularEarningsInr)}`,
        overtimeStep: `${overtimeHours}h × (${formatInr(hourlyWageInr)} × ${overtimeMultiplier}x) = ${formatInr(overtimeEarningsInr)}`,
        grossStep: `${formatInr(regularEarningsInr)} + ${formatInr(overtimeEarningsInr)} = ${formatInr(grossPayInr)}`,
        netStep: 'Error: Deductions exceed gross pay',
      },
    };
  }

  const netPayInr = roundToTwo(grossPayInr - deductionsInr);

  return {
    isValid: true,
    errors: [],
    regularHours,
    hourlyWageInr,
    overtimeHours,
    overtimeMultiplier,
    overtimeHourlyRateInr,
    regularEarningsInr,
    overtimeEarningsInr,
    grossPayInr,
    deductionsInr,
    netPayInr,
    formulaSteps: {
      regularStep: `${regularHours} hrs × ${formatInr(hourlyWageInr)}/hr = ${formatInr(regularEarningsInr)}`,
      overtimeStep: `${overtimeHours} hrs × ${formatInr(overtimeHourlyRateInr)}/hr (${overtimeMultiplier}x rate) = ${formatInr(overtimeEarningsInr)}`,
      grossStep: `${formatInr(regularEarningsInr)} (Regular) + ${formatInr(overtimeEarningsInr)} (Overtime) = ${formatInr(grossPayInr)}`,
      netStep: `${formatInr(grossPayInr)} (Gross) − ${formatInr(deductionsInr)} (Deductions) = ${formatInr(netPayInr)}`,
    },
  };
}

export function evaluatePayrollDiscrepancy(params: {
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
}): PayrollDiscrepancyRecord {
  const overtimeRate = roundToTwo(params.hourlyWageInr * params.overtimeMultiplier);
  const recordedGrossInr = roundToTwo(
    params.recordedRegularHours * params.hourlyWageInr +
      params.recordedOvertimeHours * overtimeRate
  );
  const payrollGrossInr = roundToTwo(
    params.payrollRegularHours * params.hourlyWageInr +
      params.payrollOvertimeHours * overtimeRate
  );
  const differenceInr = roundToTwo(recordedGrossInr - payrollGrossInr);

  const regDiff = roundToTwo(params.recordedRegularHours - params.payrollRegularHours);
  const otDiff = roundToTwo(params.recordedOvertimeHours - params.payrollOvertimeHours);

  const hasDiscrepancy = Math.abs(differenceInr) >= 1 || Math.abs(regDiff) > 0 || Math.abs(otDiff) > 0;

  let explanation = 'Attendance hours match payroll register entries.';
  if (hasDiscrepancy) {
    const parts: string[] = [];
    if (regDiff !== 0) {
      parts.push(`regular hours differ by ${regDiff > 0 ? `+${regDiff}h` : `${regDiff}h`}`);
    }
    if (otDiff !== 0) {
      parts.push(`overtime hours differ by ${otDiff > 0 ? `+${otDiff}h` : `${otDiff}h`}`);
    }
    explanation = `Discrepancy of ${formatInr(Math.abs(differenceInr))} detected: Recorded attendance vs payroll register shows ${parts.join(' and ')}. Flagged for supervisor & payroll audit.`;
  }

  return {
    id: params.id,
    workerId: params.workerId,
    workerName: params.workerName,
    industry: params.industry,
    siteId: params.siteId,
    departmentId: params.departmentId,
    periodLabel: params.periodLabel,
    recordedRegularHours: params.recordedRegularHours,
    payrollRegularHours: params.payrollRegularHours,
    recordedOvertimeHours: params.recordedOvertimeHours,
    payrollOvertimeHours: params.payrollOvertimeHours,
    hourlyWageInr: params.hourlyWageInr,
    overtimeMultiplier: params.overtimeMultiplier,
    recordedGrossInr,
    payrollGrossInr,
    differenceInr,
    status: hasDiscrepancy ? 'DISCREPANCY_FLAGGED' : 'MATCHED',
    explanation,
  };
}
