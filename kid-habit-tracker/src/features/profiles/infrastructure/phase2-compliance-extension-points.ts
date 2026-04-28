import { PHASE_1_COMPLIANCE } from '../../../config/compliance';

export type ComplianceHookResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      code: 'not-enabled' | 'invalid-input' | 'blocked';
    };

export type ConsentCaptureInput = {
  parentProfileAlias: string;
  consentScope: 'education_record_processing' | 'cloud_sync_account';
  consentStatementVersion: string;
};

export type ConsentCaptureRecord = {
  consentId: string;
  parentProfileAlias: string;
  consentScope: ConsentCaptureInput['consentScope'];
  statementVersion: string;
  capturedAt: string;
};

export type DeletionWorkflowInput = {
  parentProfileAlias: string;
  subjectProfileAlias: string;
  reason: string;
};

export type DeletionWorkflowRecord = {
  requestId: string;
  parentProfileAlias: string;
  subjectProfileAlias: string;
  status: 'queued' | 'rejected';
  submittedAt: string;
};

export type RetentionPolicyInput = {
  category: 'diagnostic_bundle' | 'habit_events' | 'profile_metadata';
  ageDays: number;
};

export type RetentionPolicyRecord = {
  category: RetentionPolicyInput['category'];
  action: 'retain' | 'delete';
  policyVersion: string;
  evaluatedAt: string;
};

export interface ConsentCaptureHook {
  captureParentConsent(input: ConsentCaptureInput): Promise<ComplianceHookResult<ConsentCaptureRecord>>;
}

export interface DeletionWorkflowHook {
  submitDeletionRequest(input: DeletionWorkflowInput): Promise<ComplianceHookResult<DeletionWorkflowRecord>>;
}

export interface RetentionPolicyHook {
  evaluateRetentionPolicy(input: RetentionPolicyInput): Promise<ComplianceHookResult<RetentionPolicyRecord>>;
}

const PHASE_2_NOT_ENABLED_ERROR = 'Phase 2 compliance extensions are not enabled in Phase 1.';

function notEnabled<T>(): ComplianceHookResult<T> {
  return {
    ok: false,
    error: PHASE_2_NOT_ENABLED_ERROR,
    code: 'not-enabled',
  };
}

// No-op Phase 1 adapter: explicit extension point for future cloud/account compliance flows.
export const phase2ConsentCaptureHook: ConsentCaptureHook = {
  async captureParentConsent() {
    return notEnabled<ConsentCaptureRecord>();
  },
};

// No-op Phase 1 adapter: deletion workflows stay blocked until Phase 2 is enabled.
export const phase2DeletionWorkflowHook: DeletionWorkflowHook = {
  async submitDeletionRequest() {
    return notEnabled<DeletionWorkflowRecord>();
  },
};

// No-op Phase 1 adapter: retention policy enforcement is scaffolded but intentionally disabled.
export const phase2RetentionPolicyHook: RetentionPolicyHook = {
  async evaluateRetentionPolicy() {
    return notEnabled<RetentionPolicyRecord>();
  },
};

export type ChecklistSignOffEvidence = {
  completed: boolean;
  signedBy: string;
  signedAt: string;
};

export type DryRunVerificationEvidence = {
  completed: boolean;
  artifactId: string;
  executedAt: string;
};

export type SchoolCoachIntegrationGateInput = {
  requestedEnabled: boolean;
  checklistSignOff: ChecklistSignOffEvidence | null;
  dryRunVerification: DryRunVerificationEvidence | null;
  policyVersion?: string;
};

export type SchoolCoachIntegrationGateDecision = {
  requestedEnabled: boolean;
  enabled: boolean;
  blocked: boolean;
  reasons: string[];
  requiredChecks: {
    checklistSignOff: boolean;
    dryRunVerification: boolean;
  };
  policyVersion: string;
  evaluatedAt: string;
};

export function evaluateSchoolCoachIntegrationGate(
  input: SchoolCoachIntegrationGateInput
): SchoolCoachIntegrationGateDecision {
  if (!PHASE_1_COMPLIANCE.phase2SchoolCoachIntegrationDefaultEnabled) {
    const reasons = [
      'School/coach integration is hard-blocked in Phase 1 regardless of checklist or dry-run evidence.',
    ];

    return {
      requestedEnabled: input.requestedEnabled,
      enabled: false,
      blocked: input.requestedEnabled,
      reasons,
      requiredChecks: {
        checklistSignOff: false,
        dryRunVerification: false,
      },
      policyVersion: input.policyVersion ?? 'phase2-ferpa-gate-v1',
      evaluatedAt: new Date().toISOString(),
    };
  }

  const hasChecklistEvidence =
    !!input.checklistSignOff?.completed &&
    input.checklistSignOff.signedBy.trim().length > 0 &&
    input.checklistSignOff.signedAt.trim().length > 0;
  const hasDryRunEvidence =
    !!input.dryRunVerification?.completed &&
    input.dryRunVerification.artifactId.trim().length > 0 &&
    input.dryRunVerification.executedAt.trim().length > 0;

  const requiredChecks = {
    checklistSignOff: hasChecklistEvidence,
    dryRunVerification: hasDryRunEvidence,
  };
  const reasons: string[] = [];

  if (input.requestedEnabled && !requiredChecks.checklistSignOff) {
    reasons.push('Checklist sign-off evidence is required before enabling school/coach integration.');
  }

  if (input.requestedEnabled && !requiredChecks.dryRunVerification) {
    reasons.push('Dry-run verification evidence is required before enabling school/coach integration.');
  }

  const blocked = input.requestedEnabled && reasons.length > 0;

  return {
    requestedEnabled: input.requestedEnabled,
    enabled: input.requestedEnabled && !blocked,
    blocked,
    reasons,
    requiredChecks,
    policyVersion: input.policyVersion ?? 'phase2-ferpa-gate-v1',
    evaluatedAt: new Date().toISOString(),
  };
}
