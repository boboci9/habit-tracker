export const PHASE_1_COMPLIANCE = {
  // Phase 1 is local-first by design: child habit payloads do not leave device boundaries.
  offDeviceChildHabitTransmissionAllowed: false,
  childFacingBehavioralTrackingSdkAllowed: false,
  sensitiveLocalControlKeys: ['parent_pin_secure'] as const,
  disallowedPlainSetupStateKeys: ['parent_pin'] as const,
  diagnosticRequiredMetadataKeys: ['report_id', 'correlation_id', 'generated_at', 'profile_alias'] as const,
  diagnosticDisallowedPayloadFields: ['learning_text', 'pushups', 'raw_profile_id'] as const,
  phase2SchoolCoachIntegrationDefaultEnabled: false,
  phase2RequiredChecklistControls: [
    'parent_consent_capture_and_storage',
    'least_privilege_role_policy',
    'audit_logging_and_access_review',
    'data_rights_review_export_deletion_process',
    'dry_run_verification_evidence',
  ] as const,
  approvedMinimumDataset: [
    'profile_metadata',
    'habit_events',
    'streak_state',
    'reward_config',
    'calendar_coordination',
    'setup_state',
    'diagnostic_bundle',
  ] as const,
} as const;

export type ApprovedDatasetCategory = (typeof PHASE_1_COMPLIANCE.approvedMinimumDataset)[number];
