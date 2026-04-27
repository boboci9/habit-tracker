import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useFamilySetup } from '../features/profiles/hooks/use-family-setup';
import { useParentProtectedSettings } from '../features/profiles/hooks/use-parent-protected-settings';
import { useProfilePicker } from '../features/profiles/hooks/use-profile-picker';
import { useWeeklyParentSummary } from '../features/profiles/hooks/use-weekly-parent-summary';

export default function FamilySetupScreen() {
  const {
    loading: pickerLoading,
    profiles,
    selectedProfile,
    selectedProfileId,
    selectChildProfile,
    form,
    setForm,
    formValidation,
    addChildProfile,
    saveChildProfile,
    removeChildProfile,
    countStatus,
    availableColors,
    avatarOptions,
    error: pickerError,
    submitting: pickerSubmitting,
  } = useProfilePicker();

  const {
    pin,
    setPin,
    verified: parentVerified,
    verify,
    lock,
    error: parentError,
    saving: parentSaving,
    profileDraft,
    setProfileDraft,
    settingsDraft,
    setSettingsDraft,
    formValid: parentFormValid,
    saveSelected,
    removeSelected,
  } = useParentProtectedSettings({
    selectedProfile,
    saveChildProfile,
    removeChildProfile,
  });

  const {
    weekStart,
    rows: weeklyRows,
    loading: weeklyLoading,
    error: weeklyError,
    saving: weeklySaving,
    recordTodayForProfile,
    prompts,
  } = useWeeklyParentSummary();

  const isProfileReady = countStatus.minReached;

  const {
    loading,
    complete,
    draft,
    error,
    validation,
    isSubmitting,
    setDraft,
    completeSetup,
    resetSetup,
  } = useFamilySetup();

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading setup...</Text>
      </SafeAreaView>
    );
  }

  if (complete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Profile Picker</Text>
          <Text style={styles.subtitle}>
            Add and select child profiles. At least {countStatus.min} and at most {countStatus.max} profiles.
          </Text>

          {pickerLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>
                  {profiles.length}/{countStatus.max} profiles
                </Text>
              </View>

              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Child name"
                value={form.name}
                onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
              />
              {!formValidation.nameOk && <Text style={styles.helperError}>Name is required.</Text>}

              <Text style={styles.label}>Age *</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={String(form.age)}
                onChangeText={(value) => {
                  const parsed = Number(value.replace(/[^0-9]/g, ''));
                  setForm((prev) => ({ ...prev, age: Number.isFinite(parsed) ? parsed : 0 }));
                }}
              />
              {!formValidation.ageOk && <Text style={styles.helperError}>Age must be between 4 and 17.</Text>}

              <Text style={styles.label}>Avatar *</Text>
              <View style={styles.avatarRow}>
                {avatarOptions.map((avatar) => (
                  <Pressable
                    key={avatar}
                    style={[styles.chip, form.avatar === avatar && styles.chipSelected]}
                    onPress={() => setForm((prev) => ({ ...prev, avatar }))}>
                    <Text style={styles.chipText}>{avatar}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Color *</Text>
              <View style={styles.colorRow}>
                {(availableColors.length > 0 ? availableColors : [form.color]).map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color },
                      form.color === color && styles.colorDotSelected,
                    ]}
                    onPress={() => setForm((prev) => ({ ...prev, color }))}
                  />
                ))}
              </View>

              {pickerError.length > 0 && <Text style={styles.error}>{pickerError}</Text>}

              <Pressable
                style={[
                  styles.button,
                  (!formValidation.isValid || pickerSubmitting || countStatus.maxReached || !parentVerified) &&
                    styles.buttonDisabled,
                ]}
                disabled={!formValidation.isValid || pickerSubmitting || countStatus.maxReached || !parentVerified}
                onPress={() => void addChildProfile(parentVerified)}>
                <Text style={styles.buttonText}>{pickerSubmitting ? 'Adding...' : 'Add child profile'}</Text>
              </Pressable>

              {!parentVerified && (
                <Text style={styles.helperError}>Parent verification is required to add profiles.</Text>
              )}

              {!countStatus.minReached && (
                <Text style={styles.helperError}>
                  Add at least {countStatus.min} child profiles to continue.
                </Text>
              )}

              <Text style={styles.label}>Profile Picker</Text>
              <FlatList
                data={profiles}
                keyExtractor={(item) => item.id}
                horizontal
                contentContainerStyle={styles.cardList}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => selectChildProfile(item.id)}
                    style={[
                      styles.profileCard,
                      { borderColor: item.color },
                      selectedProfileId === item.id && styles.profileCardSelected,
                    ]}>
                    <Text style={styles.profileName}>{item.name}</Text>
                    <Text style={styles.profileMeta}>Age {item.age}</Text>
                    <Text style={styles.profileMeta}>Avatar {item.avatar}</Text>
                  </Pressable>
                )}
              />

              {selectedProfile && isProfileReady && (
                <View style={styles.placeholderView}>
                  <Text style={styles.placeholderTitle}>Selected child view</Text>
                  <Text style={styles.placeholderText}>selectChildProfile: {selectedProfile.name}</Text>
                  <Text style={styles.placeholderText}>No login required. Child flow placeholder active.</Text>
                </View>
              )}

              <View style={styles.parentCard}>
                <Text style={styles.parentTitle}>Parent-protected settings</Text>
                <Text style={styles.parentSubtitle}>
                  Verify to edit/remove profiles and update reward/reminder settings.
                </Text>

                <Text style={styles.label}>Parent PIN</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  keyboardType="number-pad"
                  value={pin}
                  onChangeText={setPin}
                  placeholder="Enter parent PIN"
                />

                <View style={styles.parentButtonRow}>
                  <Pressable style={[styles.button, styles.parentButton]} onPress={() => void verify()}>
                    <Text style={styles.buttonText}>{parentVerified ? 'Verified' : 'Verify parent'}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.secondaryButton, styles.parentButton]}
                    onPress={lock}
                    disabled={!parentVerified || parentSaving}>
                    <Text style={styles.secondaryButtonText}>Lock</Text>
                  </Pressable>
                </View>

                <Text style={styles.label}>Edit selected profile</Text>
                <TextInput
                  style={styles.input}
                  value={profileDraft.name}
                  onChangeText={(value) => setProfileDraft((prev) => ({ ...prev, name: value }))}
                  placeholder="Profile name"
                />
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(profileDraft.age)}
                  onChangeText={(value) => {
                    const parsed = Number(value.replace(/[^0-9]/g, ''));
                    setProfileDraft((prev) => ({ ...prev, age: Number.isFinite(parsed) ? parsed : 0 }));
                  }}
                  placeholder="Age"
                />
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(settingsDraft.rewardTargetDays)}
                  onChangeText={(value) => {
                    const parsed = Number(value.replace(/[^0-9]/g, ''));
                    setSettingsDraft((prev) => ({
                      ...prev,
                      rewardTargetDays: Number.isFinite(parsed) ? parsed : 0,
                    }));
                  }}
                  placeholder="Reward target days"
                />
                <TextInput
                  style={styles.input}
                  value={settingsDraft.reminderTime}
                  onChangeText={(value) => setSettingsDraft((prev) => ({ ...prev, reminderTime: value }))}
                  placeholder="Reminder time (HH:MM)"
                />

                {!parentFormValid.isValid && (
                  <Text style={styles.helperError}>Provide valid profile, reward target, and reminder time.</Text>
                )}

                {parentError.length > 0 && <Text style={styles.error}>{parentError}</Text>}

                <View style={styles.parentButtonRow}>
                  <Pressable
                    style={[styles.button, styles.parentButton, (!parentVerified || !parentFormValid.isValid) && styles.buttonDisabled]}
                    disabled={!parentVerified || !parentFormValid.isValid || parentSaving}
                    onPress={() => void saveSelected()}>
                    <Text style={styles.buttonText}>{parentSaving ? 'Saving...' : 'Save selected profile'}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.dangerButton, styles.parentButton]}
                    disabled={!parentVerified || parentSaving || !selectedProfile}
                    onPress={() => void removeSelected()}>
                    <Text style={styles.buttonText}>Remove selected profile</Text>
                  </Pressable>
                </View>

                {parentVerified ? (
                  <>
                    <View style={styles.weeklySection}>
                      <Text style={styles.parentTitle}>Weekly parent summary</Text>
                      <Text style={styles.parentSubtitle}>Week of {weekStart}</Text>

                      {weeklyLoading ? (
                        <ActivityIndicator size="small" />
                      ) : (
                        <>
                          {weeklyRows.map((row) => (
                            <View key={row.profileId} style={styles.weeklyCard}>
                              <Text style={styles.weeklyName}>{row.childName}</Text>
                              <Text style={styles.weeklyMeta}>Completion: {row.completionPercentage}%</Text>
                              <Text style={styles.weeklyMeta}>Streak status: {row.streakStatus}</Text>
                              <Text style={styles.weeklyMeta}>Missed days: {row.missedDayCount}</Text>

                              {selectedProfile?.id === row.profileId && (
                                <Pressable
                                  style={[styles.button, styles.parentButton, (parentSaving || weeklySaving) && styles.buttonDisabled]}
                                  disabled={parentSaving || weeklySaving}
                                  onPress={() => void recordTodayForProfile(row.profileId)}>
                                  <Text style={styles.buttonText}>{weeklySaving ? 'Saving...' : 'Record today as complete'}</Text>
                                </Pressable>
                              )}
                            </View>
                          ))}
                        </>
                      )}

                      {weeklyError.length > 0 && <Text style={styles.error}>{weeklyError}</Text>}
                    </View>

                    <View style={styles.weeklySection}>
                      <Text style={styles.parentTitle}>Reinforcement guidance prompts</Text>
                      {prompts.map((prompt) => (
                        <Text key={prompt} style={styles.promptText}>
                          - {prompt}
                        </Text>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={styles.helperError}>Verify parent PIN to view weekly summary and guidance prompts.</Text>
                )}
              </View>
            </>
          )}

          <Pressable
            style={[styles.button, styles.secondaryButton, isSubmitting && styles.buttonDisabled]}
            disabled={isSubmitting}
            onPress={() => void resetSetup()}>
            <Text style={styles.secondaryButtonText}>Reset demo setup</Text>
          </Pressable>
          <Text style={styles.secondaryHelperText}>Reset keeps existing child profiles.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Family Setup</Text>
        <Text style={styles.subtitle}>Complete first-launch setup to begin habit tracking.</Text>

        <Text style={styles.label}>Family name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter family name"
          value={draft.familyName}
          onChangeText={(value) => setDraft((prev) => ({ ...prev, familyName: value }))}
        />
        {!validation.familyNameOk && <Text style={styles.helperError}>Family name is required.</Text>}

        <Text style={styles.label}>Number of children (2+ required) *</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={String(draft.childCount)}
          onChangeText={(value) => {
            const parsed = Number(value.replace(/[^0-9]/g, ''));
            setDraft((prev) => ({
              ...prev,
              childCount: Number.isFinite(parsed) ? parsed : 0,
            }));
          }}
        />
        {!validation.childCountOk && <Text style={styles.helperError}>Child count must be 2 or more.</Text>}

        <Text style={styles.label}>Initial reward label *</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: Movie night"
          value={draft.initialRewardLabel}
          onChangeText={(value) => setDraft((prev) => ({ ...prev, initialRewardLabel: value }))}
        />
        {!validation.rewardOk && <Text style={styles.helperError}>Reward label is required.</Text>}

        {error.length > 0 && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.button, (!validation.isValid || isSubmitting) && styles.buttonDisabled]}
          disabled={!validation.isValid || isSubmitting}
          onPress={() => void completeSetup()}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Saving...' : 'Complete setup'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fc',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#555',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  cardList: {
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#667085',
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  helperError: {
    color: '#b42318',
    fontSize: 12,
  },
  error: {
    color: '#b42318',
    marginTop: 4,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#1570ef',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#98a2b3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  counterBadge: {
    backgroundColor: '#eef4ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  counterText: {
    color: '#175cd3',
    fontWeight: '600',
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipSelected: {
    borderColor: '#1570ef',
    backgroundColor: '#e9f2ff',
  },
  chipText: {
    color: '#344054',
    fontSize: 12,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#fff',
  },
  colorDotSelected: {
    borderColor: '#111827',
  },
  profileCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    minWidth: 130,
    backgroundColor: '#fff',
  },
  profileCardSelected: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileMeta: {
    color: '#475467',
    fontSize: 12,
  },
  placeholderView: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#f2f4f7',
    padding: 12,
    gap: 4,
  },
  placeholderTitle: {
    fontWeight: '700',
    color: '#1d2939',
  },
  placeholderText: {
    color: '#344054',
    fontSize: 12,
  },
  parentCard: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    padding: 12,
    gap: 8,
  },
  parentTitle: {
    color: '#1d2939',
    fontWeight: '700',
  },
  parentSubtitle: {
    color: '#475467',
    fontSize: 12,
  },
  parentButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  parentButton: {
    flex: 1,
  },
  dangerButton: {
    backgroundColor: '#b42318',
  },
  weeklySection: {
    marginTop: 10,
    gap: 6,
  },
  weeklyCard: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  weeklyName: {
    fontWeight: '700',
    color: '#1d2939',
  },
  weeklyMeta: {
    fontSize: 12,
    color: '#475467',
  },
  promptText: {
    fontSize: 12,
    color: '#344054',
  },
  successText: {
    color: '#027a48',
    marginBottom: 4,
  },
  secondaryButton: {
    backgroundColor: '#f2f4f7',
  },
  secondaryButtonText: {
    color: '#344054',
    fontWeight: '600',
  },
  secondaryHelperText: {
    marginTop: 6,
    color: '#667085',
    fontSize: 12,
    textAlign: 'center',
  },
});
