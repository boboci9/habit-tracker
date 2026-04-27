import { useCallback, useEffect, useMemo, useState } from 'react';

import { ChildProfile, ChildProfileInput, ChildProfileSettingsInput } from '../infrastructure/profile-storage';
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

  const verify = useCallback(async () => {
    if (saving) {
      return;
    }

    setError('');
    const ok = await verifyParentPin(pin);
    if (!ok) {
      setVerified(false);
      setError('Parent verification failed.');
      return;
    }

    setVerified(true);
  }, [pin, saving]);

  const lock = useCallback(() => {
    setVerified(false);
    setPin('');
  }, []);

  const saveSelected = useCallback(async () => {
    if (!selectedProfile) {
      setError('Select a child profile first.');
      return;
    }
    if (!verified) {
      setError('Parent verification is required.');
      return;
    }
    if (saving) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      await saveChildProfile(selectedProfile.id, profileDraft, settingsDraft);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save profile settings.');
    } finally {
      setSaving(false);
    }
  }, [profileDraft, saveChildProfile, saving, selectedProfile, settingsDraft, verified]);

  const removeSelected = useCallback(async () => {
    if (!selectedProfile) {
      setError('Select a child profile first.');
      return;
    }
    if (!verified) {
      setError('Parent verification is required.');
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
  }, [removeChildProfile, saving, selectedProfile, verified]);

  const formValid = useMemo(() => {
    const nameOk = profileDraft.name.trim().length > 0;
    const ageOk = Number.isFinite(profileDraft.age) && profileDraft.age >= 4 && profileDraft.age <= 17;
    const rewardOk =
      Number.isFinite(settingsDraft.rewardTargetDays) &&
      settingsDraft.rewardTargetDays >= 1 &&
      settingsDraft.rewardTargetDays <= 60;
    const reminderOk = /^([01]\d|2[0-3]):([0-5]\d)$/.test(settingsDraft.reminderTime.trim());

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
