import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  clearSetupComplete,
  SetupDraft,
  clearSetupDraft,
  getSetupDraft,
  isSetupComplete,
  markSetupComplete,
  saveSetupDraft,
} from '../infrastructure/setup-storage';

const DEFAULT_DRAFT: SetupDraft = {
  familyName: '',
  childCount: 2,
  initialRewardLabel: '',
};

export function useFamilySetup() {
  const [loading, setLoading] = useState(true);
  const [complete, setComplete] = useState(false);
  const [draft, setDraft] = useState<SetupDraft>(DEFAULT_DRAFT);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const completed = await isSetupComplete();
        const savedDraft = await getSetupDraft();
        if (!mounted) {
          return;
        }
        setComplete(completed);
        setDraft(savedDraft ?? DEFAULT_DRAFT);
      } catch {
        if (mounted) {
          setError('Unable to load setup state.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const safeDraft = draft ?? DEFAULT_DRAFT;

  useEffect(() => {
    if (loading || complete) {
      return;
    }

    let active = true;
    void saveSetupDraft(draft).catch(() => {
      if (active) {
        setError('Unable to save setup draft.');
      }
    });

    return () => {
      active = false;
    };
  }, [draft, loading, complete]);

  const validation = useMemo(() => {
    const familyNameOk = safeDraft.familyName.trim().length > 0;
    const rewardOk = safeDraft.initialRewardLabel.trim().length > 0;
    const childCountOk = Number.isFinite(safeDraft.childCount) && safeDraft.childCount >= 2;

    return {
      isValid: familyNameOk && rewardOk && childCountOk,
      familyNameOk,
      rewardOk,
      childCountOk,
    };
  }, [safeDraft]);

  const completeSetup = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    if (!validation.isValid) {
      setError('Please complete all required fields before continuing.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const normalizedDraft: SetupDraft = {
        familyName: safeDraft.familyName.trim(),
        childCount: safeDraft.childCount,
        initialRewardLabel: safeDraft.initialRewardLabel.trim(),
      };
      await saveSetupDraft(normalizedDraft);
      await markSetupComplete();
      setComplete(true);
    } catch {
      setError('Unable to complete setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [safeDraft, isSubmitting, validation.isValid]);

  const resetSetup = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await clearSetupDraft();
      await clearSetupComplete();
      setDraft(DEFAULT_DRAFT);
      setComplete(false);
      setError('');
    } catch {
      setError('Unable to reset setup state.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  return {
    loading,
    complete,
    draft,
    error,
    validation,
    isSubmitting,
    setDraft,
    completeSetup,
    resetSetup,
  };
}
