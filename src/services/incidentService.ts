import {
  IncidentSeverity,
  IncidentStatus,
  IndustryId,
  SafetyIncident,
  UserRole,
} from '../types/domain';

const ALLOWED_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  OPEN: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS', 'RESOLVED'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: [],
};

export function isValidStatusTransition(
  fromStatus: IncidentStatus,
  toStatus: IncidentStatus
): boolean {
  return ALLOWED_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
}

export function canPerformIncidentAction(
  role: UserRole,
  action: 'CREATE' | 'ASSIGN' | 'UPDATE_STATUS' | 'RESOLVE'
): boolean {
  if (action === 'CREATE') {
    return role === 'worker' || role === 'admin' || role === 'safety_officer';
  }
  return role === 'admin' || role === 'safety_officer';
}

export function generateTrackingCode(isAnonymous: boolean, sequenceNum: number): string {
  const prefix = isAnonymous ? 'ANON' : 'TRK';
  const deterministicCode = ((sequenceNum * 7919 + 104729) % 9000) + 1000;
  return `${prefix}-${deterministicCode}-${String(sequenceNum).padStart(2, '0')}`;
}

export interface CreateIncidentInput {
  id: string;
  trackingCode?: string;
  industry: IndustryId;
  siteId: string;
  departmentId: string;
  categoryId: string;
  categoryName: string;
  severity: IncidentSeverity;
  title?: string;
  description: string;
  isAnonymous: boolean;
  workerId?: string | null;
  workerName?: string | null;
  reportedVia: 'TEXT' | 'VOICE';
  createdAt: string;
}

export function validateCreateIncidentInput(input: CreateIncidentInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.categoryId || !input.categoryId.trim()) {
    errors.push('Hazard category is required.');
  }
  if (!input.siteId || !input.siteId.trim()) {
    errors.push('Worksite / plant selection is required.');
  }
  if (!input.departmentId || !input.departmentId.trim()) {
    errors.push('Department selection is required.');
  }
  if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(input.severity)) {
    errors.push('Valid hazard severity is required.');
  }
  const cleanDescription = (input.description || '').trim();
  if (cleanDescription.length < 8) {
    errors.push('Please provide a clear hazard description (at least 8 characters).');
  }
  if (cleanDescription.length > 1000) {
    errors.push('Hazard description must be under 1000 characters.');
  }
  if (!input.isAnonymous && (!input.workerId || !input.workerName)) {
    errors.push('Worker identity is required for non-anonymous reports.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function createSafetyIncidentRecord(
  input: CreateIncidentInput,
  sequenceNum = 1
): SafetyIncident {
  const validation = validateCreateIncidentInput(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const sanitizedDescription = input.description.trim();
  const autoTitle =
    input.title && input.title.trim().length > 0
      ? input.title.trim()
      : `${input.categoryName}: ${sanitizedDescription.slice(0, 56)}${
          sanitizedDescription.length > 56 ? '…' : ''
        }`;

  // Strict privacy enforcement: anonymous reports NEVER store workerId or workerName
  const safeWorkerId = input.isAnonymous ? null : input.workerId ?? null;
  const safeWorkerName = input.isAnonymous ? null : input.workerName ?? null;
  const auditActorName = input.isAnonymous
    ? 'Anonymous Worker (Identity Redacted)'
    : safeWorkerName || 'Worker';

  const trackingCode =
    input.trackingCode || generateTrackingCode(input.isAnonymous, sequenceNum);

  return {
    id: input.id,
    trackingCode,
    industry: input.industry,
    siteId: input.siteId,
    departmentId: input.departmentId,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    severity: input.severity,
    title: autoTitle,
    description: sanitizedDescription,
    isAnonymous: input.isAnonymous,
    workerId: safeWorkerId,
    workerName: safeWorkerName,
    reportedVia: input.reportedVia,
    status: 'OPEN',
    assignedTo: null,
    correctiveAction: null,
    resolutionNotes: null,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    resolvedAt: null,
    history: [
      {
        timestamp: input.createdAt,
        actorRole: 'worker',
        actorName: auditActorName,
        fromStatus: null,
        toStatus: 'OPEN',
        note: `Safety hazard reported via ${input.reportedVia} (${
          input.isAnonymous ? 'Anonymous Protection Active' : 'Named Report'
        }).`,
      },
    ],
  };
}

export interface TransitionIncidentParams {
  incident: SafetyIncident;
  toStatus: IncidentStatus;
  actorRole: UserRole;
  actorName: string;
  assignedTo?: string;
  correctiveAction?: string;
  resolutionNotes?: string;
  timestamp: string;
}

export function transitionIncidentStatus(params: TransitionIncidentParams): SafetyIncident {
  const { incident, toStatus, actorRole, actorName, timestamp } = params;

  const actionType =
    toStatus === 'ASSIGNED'
      ? 'ASSIGN'
      : toStatus === 'RESOLVED'
      ? 'RESOLVE'
      : 'UPDATE_STATUS';

  if (!canPerformIncidentAction(actorRole, actionType)) {
    throw new Error(
      `Authorization Denied: Role '${actorRole}' is not permitted to perform '${actionType}' on safety incidents.`
    );
  }

  if (!isValidStatusTransition(incident.status, toStatus)) {
    throw new Error(
      `Invalid status transition from '${incident.status}' to '${toStatus}'. Permitted flow: OPEN → ASSIGNED → IN_PROGRESS → RESOLVED.`
    );
  }

  const nextAssignedTo =
    params.assignedTo !== undefined ? params.assignedTo.trim() : incident.assignedTo;
  if (toStatus === 'ASSIGNED' && (!nextAssignedTo || nextAssignedTo.length === 0)) {
    throw new Error('Assigning an incident requires selecting an authorized Safety Officer.');
  }

  const nextCorrectiveAction =
    params.correctiveAction !== undefined
      ? params.correctiveAction.trim()
      : incident.correctiveAction;
  const nextResolutionNotes =
    params.resolutionNotes !== undefined
      ? params.resolutionNotes.trim()
      : incident.resolutionNotes;

  if (toStatus === 'IN_PROGRESS' && (!nextCorrectiveAction || nextCorrectiveAction.length < 5)) {
    throw new Error(
      'Moving to IN_PROGRESS requires recording the corrective action being executed (min 5 characters).'
    );
  }

  if (toStatus === 'RESOLVED') {
    if (!nextCorrectiveAction || nextCorrectiveAction.length < 5) {
      throw new Error(
        'Resolving an incident requires a documented corrective action (min 5 characters).'
      );
    }
    if (!nextResolutionNotes || nextResolutionNotes.length < 5) {
      throw new Error(
        'Resolving an incident requires verification/resolution notes (min 5 characters).'
      );
    }
  }

  const auditNoteParts: string[] = [`Status moved from ${incident.status} to ${toStatus}.`];
  if (params.assignedTo) {
    auditNoteParts.push(`Assigned to: ${params.assignedTo}.`);
  }
  if (params.correctiveAction) {
    auditNoteParts.push(`Corrective Action: ${params.correctiveAction}.`);
  }
  if (params.resolutionNotes) {
    auditNoteParts.push(`Resolution Note: ${params.resolutionNotes}.`);
  }

  return {
    ...incident,
    status: toStatus,
    assignedTo: nextAssignedTo ?? null,
    correctiveAction: nextCorrectiveAction ?? null,
    resolutionNotes: nextResolutionNotes ?? null,
    updatedAt: timestamp,
    resolvedAt: toStatus === 'RESOLVED' ? timestamp : incident.resolvedAt,
    history: [
      ...incident.history,
      {
        timestamp,
        actorRole,
        actorName: actorName.trim() || 'Authorized Safety Officer',
        fromStatus: incident.status,
        toStatus,
        note: auditNoteParts.join(' '),
      },
    ],
  };
}
