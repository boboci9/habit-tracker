import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ChildProfileSettingsInput,
  ChildProfile,
  ChildProfileInput,
  addChildProfile,
  deleteChildProfile,
  getProfileCountStatus,
  listChildProfiles,
  updateChildProfileWithSettings,
} from '../infrastructure/profile-storage';

const COLOR_OPTIONS = ['#f04438', '#f79009', '#12b76a', '#1570ef', '#7a5af8', '#0ba5ec'];
const AVATAR_OPTIONS = ['star', 'rocket', 'book', 'heart', 'planet', 'spark'];

const DEFAULT_FORM: ChildProfileInput = {
  name: '',
  age: 8,
  avatar: AVATAR_OPTIONS[0],
  color: COLOR_OPTIONS[0],
};

export function useProfilePicker() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [form, setForm] = useState<ChildProfileInput>(DEFAULT_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProfiles = useCallback(async (isMounted?: () => boolean) => {
    const allProfiles = await listChildProfiles();

    if (isMounted && !isMounted()) {
      return;
    }

    setProfiles(allProfiles);
    if (allProfiles.length > 0) {
      setSelectedProfileId((prev) => prev ?? allProfiles[0].id);
    } else {
      setSelectedProfileId(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        await loadProfiles(() => mounted);
      } catch {
        if (mounted) {
          setError('Unable to load child profiles.');
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
  }, [loadProfiles]);

  const countStatus = useMemo(() => getProfileCountStatus(profiles.length), [profiles.length]);

  const availableColors = useMemo(() => {
    const used = new Set(profiles.map((profile) => profile.color));
    return COLOR_OPTIONS.filter((color) => !used.has(color));
  }, [profiles]);

  useEffect(() => {
    if (availableColors.length > 0 && !availableColors.includes(form.color)) {
      setForm((prev) => ({ ...prev, color: availableColors[0] }));
    }
  }, [availableColors, form.color]);

  const formValidation = useMemo(() => {
    const nameOk = form.name.trim().length > 0;
    const ageOk = Number.isFinite(form.age) && form.age >= 4 && form.age <= 17;
    const avatarOk = form.avatar.trim().length > 0;
    const colorOk = form.color.trim().length > 0;

    return {
      isValid: nameOk && ageOk && avatarOk && colorOk,
      nameOk,
      ageOk,
      avatarOk,
      colorOk,
    };
  }, [form]);

  const addProfile = useCallback(async (parentVerified: boolean) => {
    if (submitting) {
      return;
    }

    if (!parentVerified) {
      setError('Parent verification is required.');
      return;
    }

    if (!formValidation.isValid) {
      setError('Please complete all child profile fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const created = await addChildProfile(form);
      setProfiles((prev) => [...prev, created]);
      setSelectedProfileId(created.id);
      setForm((prev) => ({
        ...DEFAULT_FORM,
        avatar: prev.avatar,
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to add child profile.');
    } finally {
      setSubmitting(false);
    }
  }, [form, formValidation.isValid, submitting]);

  const reloadProfiles = useCallback(async () => {
    await loadProfiles();
  }, [loadProfiles]);

  const saveProfile = useCallback(
    async (profileId: string, profileInput: ChildProfileInput, settingsInput: ChildProfileSettingsInput) => {
      await updateChildProfileWithSettings(profileId, profileInput, settingsInput);
      await loadProfiles();
    },
    [loadProfiles]
  );

  const removeProfile = useCallback(
    async (profileId: string) => {
      await deleteChildProfile(profileId);
      await loadProfiles();
      setSelectedProfileId((prev) => (prev === profileId ? null : prev));
    },
    [loadProfiles]
  );

  const selectChildProfile = useCallback((profileId: string) => {
    setSelectedProfileId(profileId);
  }, []);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId]
  );

  return {
    loading,
    profiles,
    selectedProfile,
    selectedProfileId,
    selectChildProfile,
    form,
    setForm,
    formValidation,
    addChildProfile: addProfile,
    saveChildProfile: saveProfile,
    removeChildProfile: removeProfile,
    reloadProfiles,
    countStatus,
    availableColors,
    avatarOptions: AVATAR_OPTIONS,
    error,
    submitting,
  };
}
