import { useCallback, useEffect, useMemo, useState } from 'react';

import { ChildProfile, ChildProfileInput, ChildProfileSettingsInput } from '../infrastructure/profile-storage';
import { scheduleDailyReminderForProfile } from '../infrastructure/reminder-notifications';
import { verifyParentPin } from '../infrastructure/setup-storage';

type UseParentProtectedSettingsOptions = {
  selectedProfile: ChildProfile | null;
  saveChildProfile: (
    profileId: string,
    profileInput: ChildProfileInput,
    settingsInput: ChildProfileSettingsInput
  ) => Promise<void>;
  removeChildProfile: (profileId: string) => Promise<void>;
};

const DEFAULT_DRAFT: ChildProfileInput = {
  name: '',
  age: 8,
  avatar: 'star',
  color: '#1570ef',
};

const DEFAULT_SETTINGS: ChildProfileSettingsInput = {
  rewardTargetDays: 7,
  reminderTime: '18:00',
};

function isValidReminderInput(reminderTime: string): boolean {
  const trimmed = reminderTime.trim();
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed) || trimmed.toLowerCase() === 'off';
}

type AuthorizationContext = 'parent' | 'child';

export function useParentProtectedSettings({
  selectedProfile,
  saveChildProfile,
  removeChildProfile,
}: UseParentProtectedSettingsOptions) {
  const [pin, setPin] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ChildProfileInput>(DEFAULT_DRAFT);
  const [settingsDraft, setSettingsDraft] = useState<ChildProfileSettingsInput>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!selectedProfile) {
      return;
    }

    setProfileDraft({
      name: selectedProfile.name,
      age: selectedProfile.age,
      avatar: selectedProfile.avatar,
      color: selectedProfile.color,
    });
    setSettingsDraft({
      rewardTargetDays: selectedProfile.rewardTargetDays,
      reminderTime: selectedProfile.reminderTime,
    });
  }, [selectedProfile]);

  const authorizationContext: AuthorizationContext = verified ? 'parent' : 'child';

  const denyIfChildMode = useCallback((): boolean => {
    if (authorizationContext === 'parent') {
      return false;
    }

    setError('Parent mode is required for this action.');
    return true;
  }, [authorizationContext]);

  const verify = useCallback(async () => {
    if (saving) {
      return;
    }

    setError('');
    try {
      const ok = await verifyParentPin(pin, 'parent');
      if (!ok) {
        setVerified(false);
        setError('Parent verification failed.');
        return;
      }

      setVerified(true);
    } catch (e) {
      setVerified(false);
      setError(e instanceof Error ? e.message : 'Unable to verify parent credentials.');
    }
  }, [pin, saving]);

  const lock = useCallback(() => {
    setVerified(false);
    setPin('');
  }, []);

  const saveSelected = useCallback(async () => {
    if (denyIfChildMode()) {
      return;
    }

    if (!selectedProfile) {
      setError('Select a child profile first.');
      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      await saveChildProfile(selectedProfile.id, profileDraft, settingsDraft);

      const reminderResult = await scheduleDailyReminderForProfile(
        selectedProfile.id,
        profileDraft.name.trim().length > 0 ? profileDraft.name : selectedProfile.name,
        settingsDraft.reminderTime
      );

      if (!reminderResult.ok) {
        setError(reminderResult.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save profile settings.');
    } finally {
      setSaving(false);
    }
  }, [denyIfChildMode, profileDraft, saveChildProfile, saving, selectedProfile, settingsDraft]);

  const removeSelected = useCallback(async () => {
    if (denyIfChildMode()) {
      return;
    }

    if (!selectedProfile) {
      setError('Select a child profile first.');
      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      await removeChildProfile(selectedProfile.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to remove profile.');
    } finally {
      setSaving(false);
    }
  }, [denyIfChildMode, removeChildProfile, saving, selectedProfile]);

  const formValid = useMemo(() => {
    const nameOk = profileDraft.name.trim().length > 0;
    const ageOk = Number.isFinite(profileDraft.age) && profileDraft.age >= 4 && profileDraft.age <= 17;
    const rewardOk =
      Number.isFinite(settingsDraft.rewardTargetDays) &&
      settingsDraft.rewardTargetDays >= 1 &&
      settingsDraft.rewardTargetDays <= 60;
    const reminderOk = isValidReminderInput(settingsDraft.reminderTime);

    return {
      isValid: nameOk && ageOk && rewardOk && reminderOk,
      nameOk,
      ageOk,
      rewardOk,
      reminderOk,
    };
  }, [profileDraft, settingsDraft]);

  return {
    pin,
    setPin,
    authorizationContext,
    verified,
    verify,
    lock,
    error,
    saving,
    profileDraft,
    setProfileDraft,
    settingsDraft,
    setSettingsDraft,
    formValid,
    saveSelected,
    removeSelected,
  };
}
