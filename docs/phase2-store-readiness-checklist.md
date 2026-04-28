# Phase 2 Store Readiness Checklist

This checklist defines the required hardening and compliance packaging work before moving from pilot-ready to store-ready release scope.

## Scope

- Applies only after Phase 1 pilot gate completion.
- Covers App Store / Google Play submission readiness.
- Does not alter or block Phase 1 pilot release-gate criteria.

## Compliance Packaging

- [ ] Data handling policy package reviewed and signed off.
- [ ] Child privacy compliance package assembled for store review context.
- [ ] Terms, privacy notice, and support-contact metadata prepared for submission.
- [ ] Audit trail references linked to release evidence bundle.

## Metadata Assets

- [ ] App Store metadata draft prepared (name, subtitle, description, keywords).
- [ ] Google Play metadata draft prepared (title, short description, full description).
- [ ] Required icon, screenshots, and age-rating assets are complete and versioned.
- [ ] Store listing localization strategy documented for planned launch markets.

## Submission Policy Checks

- [ ] Platform policy checklist run for Apple submission requirements.
- [ ] Platform policy checklist run for Google Play submission requirements.
- [ ] Declared permissions and data-safety disclosures reviewed against implementation.
- [ ] Any policy exceptions or open questions are documented with owner and due date.

## Rollout Criteria

- [ ] Release candidate passes all pilot release gates.
- [ ] Store-readiness scaffold verifier passes with no missing sections.
- [ ] Store metadata and compliance packages are approved by release owner.
- [ ] Rollout plan includes phased release controls and rollback instructions.

## Transition Criteria: Pilot-Ready to Store-Ready

All criteria below must be true:

1. Phase 1 pilot release gates are green and unchanged.
2. Every checklist section in this document is complete.
3. Compliance and metadata artifacts are attached to release evidence.
4. Release owner explicitly marks transition as store-ready.
