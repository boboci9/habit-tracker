import { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useFamilySetup } from '../features/profiles/hooks/use-family-setup';
import {
  CalendarItemDraft,
  CalendarItemType,
  projectCalendarItemsByDate,
} from '../features/calendar/domain/calendar-items';
import {
  CALENDAR_NOTES_MAX_COUNT,
  CalendarNoteDraft,
} from '../features/calendar/domain/calendar-notes';
import { useFamilyCalendarFoundation } from '../features/calendar/hooks/use-family-calendar-foundation';
import { useFamilyCalendarItems } from '../features/calendar/hooks/use-family-calendar-items';
import { useHabitTrackerPanel } from '../features/calendar/hooks/use-habit-tracker-panel';
import { useUpcomingCalendarNotes } from '../features/calendar/hooks/use-upcoming-calendar-notes';
import { useDailyCheckin } from '../features/checkin/hooks/use-daily-checkin';
import { useParentProtectedSettings } from '../features/profiles/hooks/use-parent-protected-settings';
import { useProfilePicker } from '../features/profiles/hooks/use-profile-picker';
import { useDailyLearningCard } from '../features/rewards/hooks/use-daily-learning-card';
import { useReinforcementMascot } from '../features/rewards/hooks/use-reinforcement-mascot';
import { useRewardProgress } from '../features/rewards/hooks/use-reward-progress';
import { useWeeklyParentSummary } from '../features/profiles/hooks/use-weekly-parent-summary';

const DEFAULT_SETUP_DRAFT = {
  familyName: '',
  childCount: 2,
  initialRewardLabel: '',
};

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
    prompts,
  } = useWeeklyParentSummary();

  const isProfileReady = countStatus.minReached;
  const [familyCalendarMonth, setFamilyCalendarMonth] = useState(() => new Date());
  const [showFamilyCalendar, setShowFamilyCalendar] = useState(false);
  const [showHabitTrackerPanel, setShowHabitTrackerPanel] = useState(false);
  const [calendarDraft, setCalendarDraft] = useState<CalendarItemDraft>({
    type: 'shared_event',
    title: '',
    dateKey: '',
    profileId: null,
  });
  const [upcomingNoteDraft, setUpcomingNoteDraft] = useState<CalendarNoteDraft>({
    noteText: '',
    dateKey: '',
  });
  const [editingCalendarItemId, setEditingCalendarItemId] = useState<string | null>(null);
  const [editingUpcomingNoteId, setEditingUpcomingNoteId] = useState<string | null>(null);

  const shiftFamilyCalendarMonth = (deltaMonths: number) => {
    setFamilyCalendarMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + deltaMonths, 1)
    );
  };

  const {
    monthLabel: familyCalendarMonthLabel,
    weekdayLabels: familyCalendarWeekdayLabels,
    weeks: familyCalendarWeeks,
    legend: familyCalendarLegend,
  } = useFamilyCalendarFoundation(familyCalendarMonth, profiles);

  const {
    loading: calendarItemsLoading,
    saving: calendarItemsSaving,
    error: calendarItemsError,
    items: calendarItems,
    addItem: addCalendarItem,
    updateItem: updateCalendarItem,
    deleteItem: deleteCalendarItem,
  } = useFamilyCalendarItems(familyCalendarMonth);

  const calendarItemsByDate = useMemo(
    () => projectCalendarItemsByDate(calendarItems),
    [calendarItems]
  );

  const profileColorById = useMemo(() => {
    const nextMap: Record<string, string> = {};
    for (const profile of profiles) {
      nextMap[profile.id] = profile.color;
    }
    return nextMap;
  }, [profiles]);

  const {
    loading: habitTrackerLoading,
    error: habitTrackerError,
    weekLabel: habitTrackerWeekLabel,
    rows: habitTrackerRows,
  } = useHabitTrackerPanel(familyCalendarMonth, profiles);

  const {
    loading: upcomingNotesLoading,
    saving: upcomingNotesSaving,
    notes: upcomingNotes,
    error: upcomingNotesError,
    addNote: addUpcomingNote,
    updateNote: updateUpcomingNote,
    deleteNote: deleteUpcomingNote,
  } = useUpcomingCalendarNotes();

  const defaultCalendarDateKey = useMemo(() => {
    const firstCurrentMonthDay = familyCalendarWeeks
      .flat()
      .find((day) => day.inCurrentMonth)?.dateKey;
    return firstCurrentMonthDay ?? '';
  }, [familyCalendarWeeks]);

  const resetCalendarDraft = () => {
    setCalendarDraft({
      type: 'shared_event',
      title: '',
      dateKey: defaultCalendarDateKey,
      profileId: null,
    });
    setEditingCalendarItemId(null);
  };

  const resetUpcomingNoteDraft = () => {
    setUpcomingNoteDraft({
      noteText: '',
      dateKey: defaultCalendarDateKey,
    });
    setEditingUpcomingNoteId(null);
  };

  const handleSaveCalendarItem = async () => {
    const nextDraft: CalendarItemDraft = {
      ...calendarDraft,
      dateKey: calendarDraft.dateKey || defaultCalendarDateKey,
      profileId: calendarDraft.type === 'child_schedule' ? calendarDraft.profileId : null,
    };

    const saved = editingCalendarItemId
      ? await updateCalendarItem(editingCalendarItemId, nextDraft)
      : await addCalendarItem(nextDraft);

    if (saved) {
      resetCalendarDraft();
    }
  };

  const handleEditCalendarItem = (itemId: string) => {
    const target = calendarItems.find((item) => item.id === itemId);
    if (!target) {
      return;
    }

    setEditingCalendarItemId(itemId);
    setCalendarDraft({
      type: target.type,
      title: target.title,
      dateKey: target.dateKey,
      profileId: target.profileId,
    });
  };

  const handleSaveUpcomingNote = async () => {
    const nextDraft: CalendarNoteDraft = {
      ...upcomingNoteDraft,
      dateKey: upcomingNoteDraft.dateKey || defaultCalendarDateKey,
    };

    const saved = editingUpcomingNoteId
      ? await updateUpcomingNote(editingUpcomingNoteId, nextDraft)
      : await addUpcomingNote(nextDraft);

    if (saved) {
      resetUpcomingNoteDraft();
    }
  };

  const handleEditUpcomingNote = (noteId: string) => {
    const target = upcomingNotes.find((note) => note.id === noteId);
    if (!target) {
      return;
    }

    setEditingUpcomingNoteId(noteId);
    setUpcomingNoteDraft({
      noteText: target.noteText,
      dateKey: target.dateKey,
    });
  };

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

  const setupDraft = draft ?? DEFAULT_SETUP_DRAFT;

  const {
    loading: checkinLoading,
    saving: checkinSaving,
    error: checkinError,
    form: checkinForm,
    setForm: setCheckinForm,
    formValidation: checkinValidation,
    saveTodayCheckin,
    hasSubmittedToday,
    todayRecord,
    streakState,
    historyRecords,
    selectedHistoryDate,
    setSelectedHistoryDate,
    selectedHistoryRecord,
    selectedHistoryTimeline,
    latestDiagnosticBundle,
    diagnosticError,
    diagnosticSaving,
    createStreakDisputeReport,
  } = useDailyCheckin(selectedProfile?.id ?? null, parentVerified ? 'parent' : 'child');

  const {
    loading: rewardLoading,
    error: rewardError,
    rewardState,
    unlockMessage,
  } = useRewardProgress(
    selectedProfile?.id ?? null,
    selectedProfile?.rewardTargetDays ?? 7,
    setupDraft.initialRewardLabel,
    todayRecord?.updatedAt ?? 0
  );

  const {
    loading: mascotLoading,
    error: mascotError,
    mascotState,
    reinforcementMessage,
  } = useReinforcementMascot({
    profileId: selectedProfile?.id ?? null,
    hasSubmittedToday,
    streakState,
    completedCheckins: rewardState.completedCheckins,
    refreshKey: todayRecord?.updatedAt ?? 0,
  });

  const {
    loading: learningCardLoading,
    error: learningCardError,
    ageBand: learningCardAgeBand,
    card: dailyLearningCard,
  } = useDailyLearningCard(selectedProfile?.id ?? null, selectedProfile?.age ?? null);

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
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Profile Picker</Text>
              <Text style={styles.subtitle}>
                Add and select child profiles. At least {countStatus.min} and at most {countStatus.max} profiles.
              </Text>
              <Pressable style={styles.keyboardDismissButton} onPress={Keyboard.dismiss}>
                <Text style={styles.keyboardDismissButtonText}>Hide keyboard</Text>
              </Pressable>

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
                    onPress={() => {
                      setShowFamilyCalendar(false);
                      selectChildProfile(item.id);
                    }}
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

              <View style={styles.familyCalendarEntryRow}>
                <Pressable
                  style={[styles.button, styles.familyCalendarEntryButton]}
                  onPress={() => {
                    setShowFamilyCalendar(true);
                    setCalendarDraft((prev) => ({
                      ...prev,
                      dateKey: prev.dateKey || defaultCalendarDateKey,
                    }));
                    setUpcomingNoteDraft((prev) => ({
                      ...prev,
                      dateKey: prev.dateKey || defaultCalendarDateKey,
                    }));
                  }}>
                  <Text style={styles.buttonText}>Open Family Calendar</Text>
                </Pressable>
              </View>

              {showFamilyCalendar && (
                <View style={styles.familyCalendarCard}>
                  <View style={styles.familyCalendarHeaderRow}>
                    <Pressable
                      style={[styles.button, styles.secondaryButton, styles.familyCalendarHeaderButton]}
                      onPress={() => shiftFamilyCalendarMonth(-1)}>
                      <Text style={styles.secondaryButtonText}>Prev month</Text>
                    </Pressable>
                    <Text style={styles.familyCalendarMonthText}>{familyCalendarMonthLabel}</Text>
                    <Pressable
                      style={[styles.button, styles.secondaryButton, styles.familyCalendarHeaderButton]}
                      onPress={() => shiftFamilyCalendarMonth(1)}>
                      <Text style={styles.secondaryButtonText}>Next month</Text>
                    </Pressable>
                  </View>

                  <View style={styles.familyCalendarLegendRow}>
                    {familyCalendarLegend.map((item) => (
                      <View key={item.profileId} style={styles.familyCalendarLegendItem}>
                        <View style={[styles.familyCalendarLegendDot, { backgroundColor: item.color }]} />
                        <Text style={styles.familyCalendarLegendText}>{item.childName}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.familyCalendarEditorCard}>
                    <Text style={styles.streakTitle}>Calendar edit controls</Text>

                    <View style={styles.familyCalendarTypeRow}>
                      {(['shared_event', 'child_schedule'] as CalendarItemType[]).map((type) => {
                        const isSelected = calendarDraft.type === type;
                        return (
                          <Pressable
                            key={type}
                            style={[styles.chip, isSelected && styles.chipSelected]}
                            onPress={() =>
                              setCalendarDraft((prev) => ({
                                ...prev,
                                type,
                                profileId: type === 'shared_event' ? null : prev.profileId,
                              }))
                            }>
                            <Text style={styles.chipText}>
                              {type === 'shared_event' ? 'Shared event' : 'Child schedule'}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Title"
                      value={calendarDraft.title}
                      onChangeText={(value) => setCalendarDraft((prev) => ({ ...prev, title: value }))}
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Date (YYYY-MM-DD)"
                      value={calendarDraft.dateKey}
                      onChangeText={(value) => setCalendarDraft((prev) => ({ ...prev, dateKey: value }))}
                    />

                    {calendarDraft.type === 'child_schedule' ? (
                      <View style={styles.familyCalendarTypeRow}>
                        {profiles.map((profile) => {
                          const isSelected = calendarDraft.profileId === profile.id;
                          return (
                            <Pressable
                              key={profile.id}
                              style={[
                                styles.familyCalendarProfileChip,
                                isSelected && styles.familyCalendarProfileChipSelected,
                              ]}
                              onPress={() =>
                                setCalendarDraft((prev) => ({
                                  ...prev,
                                  profileId: profile.id,
                                }))
                              }>
                              <View style={[styles.familyCalendarLegendDot, { backgroundColor: profile.color }]} />
                              <Text style={styles.chipText}>{profile.name}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}

                    {calendarItemsError.length > 0 ? <Text style={styles.error}>{calendarItemsError}</Text> : null}

                    <View style={styles.parentButtonRow}>
                      <Pressable
                        style={[
                          styles.button,
                          styles.parentButton,
                          (!parentVerified || calendarItemsSaving) && styles.buttonDisabled,
                        ]}
                        disabled={!parentVerified || calendarItemsSaving}
                        onPress={() => void handleSaveCalendarItem()}>
                        <Text style={styles.buttonText}>
                          {calendarItemsSaving
                            ? 'Saving...'
                            : editingCalendarItemId
                              ? 'Update calendar item'
                              : 'Add calendar item'}
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[styles.button, styles.secondaryButton, styles.parentButton]}
                        disabled={calendarItemsSaving}
                        onPress={resetCalendarDraft}>
                        <Text style={styles.secondaryButtonText}>Clear</Text>
                      </Pressable>
                    </View>

                    {!parentVerified ? (
                      <Text style={styles.helperError}>Verify parent PIN to edit calendar items.</Text>
                    ) : null}
                  </View>

                  <View style={styles.familyCalendarGrid}>
                    <View style={styles.familyCalendarWeekHeaderRow}>
                      {familyCalendarWeekdayLabels.map((label) => (
                        <Text key={label} style={styles.familyCalendarWeekHeaderText}>
                          {label}
                        </Text>
                      ))}
                    </View>

                    {familyCalendarWeeks.map((week) => (
                      <View key={week[0].dateKey} style={styles.familyCalendarWeekRow}>
                        {week.map((day) => (
                          // Render shared and child schedule overlays with distinct visual cues.
                          <View
                            key={day.dateKey}
                            style={[
                              styles.familyCalendarDayCell,
                              !day.inCurrentMonth && styles.familyCalendarDayCellMuted,
                            ]}>
                            <Text
                              style={[
                                styles.familyCalendarDayText,
                                !day.inCurrentMonth && styles.familyCalendarDayTextMuted,
                              ]}>
                              {day.dayOfMonth}
                            </Text>

                            {day.inCurrentMonth ? (
                              <>
                                {(() => {
                                  const dayProjection = calendarItemsByDate[day.dateKey] ?? {
                                    sharedEvents: [],
                                    childSchedules: [],
                                  };

                                  return (
                                    <>
                                      {dayProjection.sharedEvents.length > 0 ? (
                                        <View style={styles.familyCalendarSharedBadge}>
                                          <Text style={styles.familyCalendarSharedBadgeText}>
                                            Shared {dayProjection.sharedEvents.length}
                                          </Text>
                                        </View>
                                      ) : null}

                                      <View style={styles.familyCalendarIndicatorRow}>
                                        {dayProjection.childSchedules.slice(0, 3).map((entry) => (
                                          <View
                                            key={entry.id}
                                            style={[
                                              styles.familyCalendarIndicatorDot,
                                              {
                                                backgroundColor:
                                                  (entry.profileId && profileColorById[entry.profileId]) || '#98a2b3',
                                              },
                                            ]}
                                          />
                                        ))}
                                        {dayProjection.childSchedules.length > 3 ? (
                                          <Text style={styles.familyCalendarOverflowText}>
                                            +{dayProjection.childSchedules.length - 3}
                                          </Text>
                                        ) : null}
                                      </View>
                                    </>
                                  );
                                })()}
                              </>
                            ) : (
                              <Text style={styles.familyCalendarMutedMarker}>-</Text>
                            )}
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>

                  <Text style={styles.familyCalendarHintText}>
                    Shared events and child schedules are shown together in the combined dashboard.
                  </Text>

                  {calendarItemsLoading ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <View style={styles.familyCalendarItemsList}>
                      {calendarItems.length === 0 ? (
                        <Text style={styles.placeholderText}>No shared events or child schedule items yet.</Text>
                      ) : (
                        calendarItems.map((item) => (
                          <View key={item.id} style={styles.familyCalendarListItem}>
                            <View style={styles.familyCalendarListItemMeta}>
                              <Text style={styles.familyCalendarListItemTitle}>{item.title}</Text>
                              <Text style={styles.placeholderText}>
                                {item.dateKey} - {item.type === 'shared_event' ? 'Shared event' : 'Child schedule'}
                              </Text>
                            </View>

                            <View style={styles.familyCalendarListActions}>
                              <Pressable
                                style={[styles.button, styles.secondaryButton, styles.familyCalendarTinyButton]}
                                onPress={() => handleEditCalendarItem(item.id)}>
                                <Text style={styles.secondaryButtonText}>Edit</Text>
                              </Pressable>
                              <Pressable
                                style={[styles.button, styles.dangerButton, styles.familyCalendarTinyButton]}
                                disabled={!parentVerified || calendarItemsSaving}
                                onPress={() => void deleteCalendarItem(item.id)}>
                                <Text style={styles.buttonText}>Delete</Text>
                              </Pressable>
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  )}

                  <View style={styles.habitTrackerCard}>
                    <Pressable
                      style={[styles.button, styles.secondaryButton, styles.habitTrackerToggleButton]}
                      onPress={() => setShowHabitTrackerPanel((prev) => !prev)}>
                      <Text style={styles.secondaryButtonText}>
                        {showHabitTrackerPanel ? 'Hide habits/chores tracker' : 'Show habits/chores tracker'}
                      </Text>
                    </Pressable>

                    {showHabitTrackerPanel ? (
                      <>
                        <Text style={styles.parentSubtitle}>Week: {habitTrackerWeekLabel}</Text>
                        <Text style={styles.habitTrackerHint}>
                          Completion shows canonical check-in alignment (Done/Open) with color and text cues.
                        </Text>

                        {habitTrackerLoading ? (
                          <ActivityIndicator size="small" />
                        ) : habitTrackerError.length > 0 ? (
                          <Text style={styles.error}>{habitTrackerError}</Text>
                        ) : (
                          <View style={styles.habitTrackerList}>
                            {habitTrackerRows.map((row) => (
                              <View key={row.profileId} style={styles.habitTrackerRowCard}>
                                <View style={styles.habitTrackerRowHeader}>
                                  <View style={[styles.familyCalendarLegendDot, { backgroundColor: row.color }]} />
                                  <Text style={styles.habitTrackerRowName}>{row.childName}</Text>
                                </View>

                                <View style={styles.habitTrackerWeekRow}>
                                  {row.cells.map((cell) => (
                                    <View key={`${row.profileId}-${cell.dateKey}`} style={styles.habitTrackerCell}>
                                      <Text style={styles.habitTrackerDayLabel}>{cell.dayLabel}</Text>
                                      <Text style={styles.habitTrackerAssignment}>Daily</Text>
                                      <Text
                                        style={[
                                          styles.habitTrackerStatus,
                                          cell.completed ? styles.habitTrackerStatusDone : styles.habitTrackerStatusOpen,
                                        ]}>
                                        {cell.statusCue}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </>
                    ) : null}
                  </View>

                  <View style={styles.upcomingNotesCard}>
                    <Text style={styles.streakTitle}>Upcoming notes</Text>
                    <Text style={styles.habitTrackerHint}>
                      Keep up to {CALENDAR_NOTES_MAX_COUNT} short family logistics reminders.
                    </Text>

                    <TextInput
                      style={[styles.input, styles.multilineInput]}
                      placeholder="Note text"
                      maxLength={120}
                      value={upcomingNoteDraft.noteText}
                      onChangeText={(value) => setUpcomingNoteDraft((prev) => ({ ...prev, noteText: value }))}
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Date (YYYY-MM-DD)"
                      value={upcomingNoteDraft.dateKey}
                      onChangeText={(value) => setUpcomingNoteDraft((prev) => ({ ...prev, dateKey: value }))}
                    />

                    {upcomingNotesError.length > 0 ? <Text style={styles.error}>{upcomingNotesError}</Text> : null}

                    <View style={styles.parentButtonRow}>
                      <Pressable
                        style={[
                          styles.button,
                          styles.parentButton,
                          (!parentVerified || upcomingNotesSaving) && styles.buttonDisabled,
                        ]}
                        disabled={!parentVerified || upcomingNotesSaving}
                        onPress={() => void handleSaveUpcomingNote()}>
                        <Text style={styles.buttonText}>
                          {upcomingNotesSaving
                            ? 'Saving...'
                            : editingUpcomingNoteId
                              ? 'Update note'
                              : 'Add note'}
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[styles.button, styles.secondaryButton, styles.parentButton]}
                        disabled={upcomingNotesSaving}
                        onPress={resetUpcomingNoteDraft}>
                        <Text style={styles.secondaryButtonText}>Clear</Text>
                      </Pressable>
                    </View>

                    {!parentVerified ? (
                      <Text style={styles.helperError}>Verify parent PIN to edit upcoming notes.</Text>
                    ) : null}

                    {upcomingNotesLoading ? (
                      <ActivityIndicator size="small" />
                    ) : upcomingNotes.length === 0 ? (
                      <Text style={styles.placeholderText}>No upcoming notes yet.</Text>
                    ) : (
                      <View style={styles.upcomingNotesList}>
                        {upcomingNotes.map((note) => (
                          <View key={note.id} style={styles.upcomingNotesItem}>
                            <View style={styles.familyCalendarListItemMeta}>
                              <Text style={styles.familyCalendarListItemTitle}>{note.noteText}</Text>
                              <Text style={styles.placeholderText}>{note.dateKey}</Text>
                            </View>

                            <View style={styles.familyCalendarListActions}>
                              <Pressable
                                style={[styles.button, styles.secondaryButton, styles.familyCalendarTinyButton]}
                                disabled={!parentVerified || upcomingNotesSaving}
                                onPress={() => handleEditUpcomingNote(note.id)}>
                                <Text style={styles.secondaryButtonText}>Edit</Text>
                              </Pressable>
                              <Pressable
                                style={[styles.button, styles.dangerButton, styles.familyCalendarTinyButton]}
                                disabled={!parentVerified || upcomingNotesSaving}
                                onPress={() => void deleteUpcomingNote(note.id)}>
                                <Text style={styles.buttonText}>Delete</Text>
                              </Pressable>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <Pressable
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => setShowFamilyCalendar(false)}>
                    <Text style={styles.secondaryButtonText}>Back to Profile Picker</Text>
                  </Pressable>
                </View>
              )}

              {selectedProfile && isProfileReady && (
                <View style={styles.placeholderView}>
                  <Text style={styles.placeholderTitle}>Today check-in</Text>
                  <Text style={styles.placeholderText}>Child: {selectedProfile.name}</Text>
                  <Text style={styles.placeholderText}>
                    Status: {hasSubmittedToday ? 'Complete' : 'Incomplete'}
                  </Text>
                  <View style={styles.streakCard}>
                    <Text style={styles.streakTitle}>Streak engine status</Text>
                    <Text style={styles.placeholderText}>Current streak: {streakState.currentStreak} day(s)</Text>
                    <Text style={styles.placeholderText}>Grace days remaining: {streakState.graceDaysRemaining}</Text>
                    <Text style={styles.placeholderText}>Grace days used: {streakState.graceDaysUsed}</Text>
                    <Text style={styles.placeholderText}>Transition: {streakState.lastTransition}</Text>
                    <Text style={styles.placeholderText}>Status tag: {streakState.status}</Text>
                    <Text style={styles.placeholderText}>Reason: {streakState.statusReason}</Text>
                  </View>

                  <View style={styles.rewardCard}>
                    <Text style={styles.streakTitle}>Reward progress</Text>
                    {rewardLoading ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <>
                        <Text style={styles.placeholderText}>Current reward goal: {rewardState.rewardGoalLabel}</Text>
                        <Text style={styles.placeholderText}>
                          Progress to next milestone: {rewardState.progressToNextMilestone}/{rewardState.targetDays}
                        </Text>
                        <Text style={styles.placeholderText}>
                          Remaining to unlock: {rewardState.remainingToNextMilestone} day(s)
                        </Text>
                        <Text style={styles.placeholderText}>
                          Milestones unlocked: {rewardState.achievedMilestones}
                        </Text>
                        <Text style={styles.placeholderText}>Next milestone: #{rewardState.nextMilestoneNumber}</Text>
                        {unlockMessage ? <Text style={styles.successText}>{unlockMessage}</Text> : null}
                      </>
                    )}
                    {rewardError.length > 0 ? <Text style={styles.error}>{rewardError}</Text> : null}
                  </View>

                  <View style={styles.mascotCard}>
                    <Text style={styles.streakTitle}>Mascot evolution</Text>
                    {mascotLoading ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <>
                        <Text style={styles.placeholderText}>Stage: {mascotState.stageLabel}</Text>
                        <Text style={styles.placeholderText}>Stage key: {mascotState.stageKey}</Text>
                        <Text style={styles.placeholderText}>
                          Completed check-ins counted: {mascotState.sourceCompletedCheckins}
                        </Text>
                      </>
                    )}
                    {mascotError.length > 0 ? <Text style={styles.error}>{mascotError}</Text> : null}
                  </View>

                  <View style={styles.reinforcementCard}>
                    <Text style={styles.streakTitle}>Reinforcement feedback</Text>
                    {reinforcementMessage ? (
                      <>
                        <Text style={styles.reinforcementTitle}>{reinforcementMessage.title}</Text>
                        <Text style={styles.placeholderText}>{reinforcementMessage.body}</Text>
                      </>
                    ) : (
                      <Text style={styles.placeholderText}>Complete today&apos;s check-in to get feedback.</Text>
                    )}
                  </View>

                  <View style={styles.learningCardCard}>
                    <Text style={styles.streakTitle}>Daily learning card</Text>
                    {learningCardLoading ? (
                      <ActivityIndicator size="small" />
                    ) : dailyLearningCard ? (
                      <>
                        <Text style={styles.learningCardTitle}>{dailyLearningCard.title}</Text>
                        <Text style={styles.placeholderText}>{dailyLearningCard.body}</Text>
                        <Text style={styles.placeholderText}>Age band: {learningCardAgeBand}</Text>
                      </>
                    ) : (
                      <Text style={styles.placeholderText}>{learningCardError}</Text>
                    )}
                  </View>

                  {checkinLoading ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <>
                      <Text style={styles.label}>Pushups *</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        value={checkinForm.pushups}
                        onChangeText={(value) =>
                          setCheckinForm((prev) => ({
                            ...prev,
                            pushups: value.replace(/[^0-9]/g, ''),
                          }))
                        }
                        placeholder="How many pushups today?"
                      />
                      {!checkinValidation.pushupsOk && (
                        <Text style={styles.helperError}>Pushups must be a non-negative number.</Text>
                      )}

                      <Text style={styles.label}>One new thing I learned *</Text>
                      <TextInput
                        style={[styles.input, styles.multilineInput]}
                        multiline
                        value={checkinForm.learningText}
                        onChangeText={(value) => setCheckinForm((prev) => ({ ...prev, learningText: value }))}
                        placeholder="Write one learning from today"
                      />
                      {!checkinValidation.learningTextOk && (
                        <Text style={styles.helperError}>Learning entry is required.</Text>
                      )}

                      {checkinError.length > 0 && <Text style={styles.error}>{checkinError}</Text>}

                      <Pressable
                        style={[
                          styles.button,
                          (!checkinValidation.isValid || checkinSaving) && styles.buttonDisabled,
                        ]}
                        disabled={!checkinValidation.isValid || checkinSaving}
                        onPress={() => void saveTodayCheckin()}>
                        <Text style={styles.buttonText}>
                          {checkinSaving
                            ? 'Saving...'
                            : hasSubmittedToday
                              ? 'Update today check-in'
                              : 'Save today check-in'}
                        </Text>
                      </Pressable>

                      {todayRecord && (
                        <Text style={styles.placeholderText}>Last saved pushups: {todayRecord.pushups}</Text>
                      )}

                      <View style={styles.historyCard}>
                        <Text style={styles.streakTitle}>Day-level history</Text>
                        <Text style={styles.historyHint}>
                          Select a date to see the persisted habit record and streak rule outcome.
                        </Text>

                        {historyRecords.length === 0 ? (
                          <Text style={styles.placeholderText}>No history yet.</Text>
                        ) : (
                          <>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.historyDateRow}>
                              {historyRecords.map((record) => {
                                const isSelected = selectedHistoryDate === record.checkinDate;
                                return (
                                  <Pressable
                                    key={record.checkinDate}
                                    onPress={() => setSelectedHistoryDate(record.checkinDate)}
                                    style={[styles.historyDateChip, isSelected && styles.historyDateChipSelected]}>
                                    <Text
                                      style={[
                                        styles.historyDateChipText,
                                        isSelected && styles.historyDateChipTextSelected,
                                      ]}>
                                      {record.checkinDate}
                                    </Text>
                                  </Pressable>
                                );
                              })}
                            </ScrollView>

                            {selectedHistoryRecord ? (
                              <View style={styles.historyDetails}>
                                <Text style={styles.placeholderText}>Date: {selectedHistoryRecord.checkinDate}</Text>
                                <Text style={styles.placeholderText}>Pushups: {selectedHistoryRecord.pushups}</Text>
                                <Text style={styles.placeholderText}>
                                  Learning: {selectedHistoryRecord.learningText}
                                </Text>
                                <Text style={styles.placeholderText}>
                                  Completed: {selectedHistoryRecord.completed ? 'Yes' : 'No'}
                                </Text>
                                <Text style={styles.placeholderText}>
                                  Streak status:{' '}
                                  {selectedHistoryTimeline?.status ?? 'No streak context for this date'}
                                </Text>
                                <Text style={styles.placeholderText}>
                                  Transition:{' '}
                                  {selectedHistoryTimeline?.transition ?? 'No transition for this date'}
                                </Text>
                                <Text style={styles.placeholderText}>
                                  Rule reason:{' '}
                                  {selectedHistoryTimeline?.reason ??
                                    'No streak rule applies because this date is not a completed streak event.'}
                                </Text>
                              </View>
                            ) : null}

                            <View style={styles.diagnosticCard}>
                              <Text style={styles.streakTitle}>Streak dispute diagnostics</Text>
                              <Text style={styles.historyHint}>
                                Parent mode can generate a local-only bundle with chronology and streak reasoning.
                              </Text>

                              <Pressable
                                style={[
                                  styles.button,
                                  styles.secondaryButton,
                                  (!parentVerified || diagnosticSaving) && styles.buttonDisabled,
                                ]}
                                disabled={!parentVerified || diagnosticSaving}
                                onPress={() => void createStreakDisputeReport()}>
                                <Text style={styles.secondaryButtonText}>
                                  {diagnosticSaving ? 'Generating diagnostics...' : 'Generate dispute bundle'}
                                </Text>
                              </Pressable>

                              {!parentVerified ? (
                                <Text style={styles.helperError}>Parent mode is required for this action.</Text>
                              ) : null}

                              {diagnosticError.length > 0 ? (
                                <Text style={styles.error}>{diagnosticError}</Text>
                              ) : null}

                              {latestDiagnosticBundle ? (
                                <View style={styles.historyDetails}>
                                  <Text style={styles.placeholderText}>
                                    Report id: {latestDiagnosticBundle.reportId}
                                  </Text>
                                  <Text style={styles.placeholderText}>
                                    Correlation: {latestDiagnosticBundle.correlationId}
                                  </Text>
                                  <Text style={styles.placeholderText}>
                                    Generated at: {latestDiagnosticBundle.generatedAt}
                                  </Text>
                                  <Text style={styles.placeholderText}>
                                    Profile alias: {latestDiagnosticBundle.profileAlias}
                                  </Text>
                                  <Text style={styles.placeholderText}>
                                    Snapshot: {latestDiagnosticBundle.streakSnapshot.status} | streak{' '}
                                    {latestDiagnosticBundle.streakSnapshot.currentStreak}
                                  </Text>
                                  <Text style={styles.placeholderText}>Rule chronology:</Text>
                                  {latestDiagnosticBundle.ruleHistory.length === 0 ? (
                                    <Text style={styles.placeholderText}>No streak rule history available.</Text>
                                  ) : (
                                    latestDiagnosticBundle.ruleHistory.map((entry) => (
                                      <Text key={entry.checkinDate} style={styles.placeholderText}>
                                        {entry.checkinDate}: {entry.transition} / {entry.status} - {entry.reason}
                                      </Text>
                                    ))
                                  )}
                                </View>
                              ) : null}
                            </View>
                          </>
                        )}
                      </View>
                    </>
                  )}
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
                  onChangeText={(value) =>
                    setSettingsDraft((prev) => ({ ...prev, reminderTime: value.toUpperCase() }))
                  }
                  placeholder="Reminder time (HH:MM or OFF)"
                />

                <View style={styles.parentButtonRow}>
                  <Pressable
                    style={[styles.button, styles.secondaryButton, styles.parentButton]}
                    disabled={parentSaving}
                    onPress={() => setSettingsDraft((prev) => ({ ...prev, reminderTime: 'OFF' }))}>
                    <Text style={styles.secondaryButtonText}>Disable reminder</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.secondaryButton, styles.parentButton]}
                    disabled={parentSaving}
                    onPress={() => setSettingsDraft((prev) => ({ ...prev, reminderTime: '18:00' }))}>
                    <Text style={styles.secondaryButtonText}>Set 18:00</Text>
                  </Pressable>
                </View>

                {!parentFormValid.isValid && (
                  <Text style={styles.helperError}>
                    Provide valid profile, reward target, and reminder time (HH:MM or OFF).
                  </Text>
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Family Setup</Text>
            <Text style={styles.subtitle}>Complete first-launch setup to begin habit tracking.</Text>
            <Pressable style={styles.keyboardDismissButton} onPress={Keyboard.dismiss}>
              <Text style={styles.keyboardDismissButtonText}>Hide keyboard</Text>
            </Pressable>

        <Text style={styles.label}>Family name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter family name"
          value={setupDraft.familyName}
          onChangeText={(value) =>
            setDraft((prev) => ({ ...(prev ?? DEFAULT_SETUP_DRAFT), familyName: value }))
          }
        />
        {!validation.familyNameOk && <Text style={styles.helperError}>Family name is required.</Text>}

        <Text style={styles.label}>Number of children (2+ required) *</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={String(setupDraft.childCount)}
          onChangeText={(value) => {
            const parsed = Number(value.replace(/[^0-9]/g, ''));
            setDraft((prev) => ({
              ...(prev ?? DEFAULT_SETUP_DRAFT),
              childCount: Number.isFinite(parsed) ? parsed : 0,
            }));
          }}
        />
        {!validation.childCountOk && <Text style={styles.helperError}>Child count must be 2 or more.</Text>}

        <Text style={styles.label}>Initial reward label *</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: Movie night"
          value={setupDraft.initialRewardLabel}
          onChangeText={(value) =>
            setDraft((prev) => ({ ...(prev ?? DEFAULT_SETUP_DRAFT), initialRewardLabel: value }))
          }
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fc',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
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
  keyboardDismissButton: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
  },
  keyboardDismissButtonText: {
    color: '#344054',
    fontSize: 12,
    fontWeight: '600',
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
  streakCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    padding: 10,
    gap: 2,
    backgroundColor: '#f8f9fc',
  },
  rewardCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    padding: 10,
    gap: 2,
    backgroundColor: '#eefcf6',
  },
  mascotCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    padding: 10,
    gap: 2,
    backgroundColor: '#fff8eb',
  },
  reinforcementCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    padding: 10,
    gap: 2,
    backgroundColor: '#eef4ff',
  },
  reinforcementTitle: {
    color: '#1d2939',
    fontWeight: '700',
    marginBottom: 2,
  },
  learningCardCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    padding: 10,
    gap: 2,
    backgroundColor: '#edf7ff',
  },
  learningCardTitle: {
    color: '#1d2939',
    fontWeight: '700',
    marginBottom: 2,
  },
  streakTitle: {
    color: '#1d2939',
    fontWeight: '700',
  },
  historyCard: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    padding: 10,
    gap: 6,
    backgroundColor: '#fff',
  },
  historyHint: {
    color: '#475467',
    fontSize: 12,
  },
  historyDateRow: {
    gap: 8,
    paddingVertical: 4,
  },
  historyDateChip: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f8f9fc',
  },
  historyDateChipSelected: {
    borderColor: '#1570ef',
    backgroundColor: '#e9f2ff',
  },
  historyDateChipText: {
    color: '#344054',
    fontSize: 12,
    fontWeight: '600',
  },
  historyDateChipTextSelected: {
    color: '#175cd3',
  },
  historyDetails: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    padding: 8,
    gap: 2,
    backgroundColor: '#f8f9fc',
  },
  diagnosticCard: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    backgroundColor: '#f5fbff',
  },
  multilineInput: {
    minHeight: 84,
    textAlignVertical: 'top',
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
  familyCalendarEntryRow: {
    marginTop: 10,
  },
  familyCalendarEntryButton: {
    marginTop: 0,
  },
  familyCalendarCard: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    backgroundColor: '#f8fbff',
    padding: 10,
    gap: 8,
  },
  familyCalendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  familyCalendarHeaderButton: {
    marginTop: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 92,
  },
  familyCalendarMonthText: {
    color: '#1d2939',
    fontWeight: '700',
    fontSize: 14,
  },
  familyCalendarLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  familyCalendarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
  familyCalendarLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  familyCalendarLegendText: {
    color: '#344054',
    fontSize: 11,
    fontWeight: '600',
  },
  familyCalendarEditorCard: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    backgroundColor: '#fff',
  },
  familyCalendarTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  familyCalendarProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  familyCalendarProfileChipSelected: {
    borderColor: '#1570ef',
    backgroundColor: '#e9f2ff',
  },
  familyCalendarGrid: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  familyCalendarWeekHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#edf2ff',
    borderBottomWidth: 1,
    borderBottomColor: '#d0d5dd',
  },
  familyCalendarWeekHeaderText: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#344054',
  },
  familyCalendarWeekRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e7ec',
  },
  familyCalendarDayCell: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: '#e4e7ec',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  familyCalendarDayCellMuted: {
    backgroundColor: '#f8f9fc',
  },
  familyCalendarDayText: {
    color: '#1d2939',
    fontSize: 12,
    fontWeight: '700',
  },
  familyCalendarDayTextMuted: {
    color: '#98a2b3',
  },
  familyCalendarIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  familyCalendarSharedBadge: {
    borderRadius: 6,
    backgroundColor: '#ffead5',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  familyCalendarSharedBadgeText: {
    color: '#9a3412',
    fontSize: 9,
    fontWeight: '700',
  },
  familyCalendarIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  familyCalendarOverflowText: {
    color: '#475467',
    fontSize: 10,
    fontWeight: '600',
  },
  familyCalendarMutedMarker: {
    color: '#98a2b3',
    fontSize: 10,
    fontWeight: '600',
  },
  familyCalendarHintText: {
    color: '#475467',
    fontSize: 12,
  },
  familyCalendarItemsList: {
    gap: 8,
  },
  familyCalendarListItem: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  familyCalendarListItemMeta: {
    flex: 1,
    gap: 2,
  },
  familyCalendarListItemTitle: {
    color: '#1d2939',
    fontSize: 12,
    fontWeight: '700',
  },
  familyCalendarListActions: {
    flexDirection: 'row',
    gap: 6,
  },
  familyCalendarTinyButton: {
    marginTop: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 64,
  },
  habitTrackerCard: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    backgroundColor: '#fff',
  },
  habitTrackerToggleButton: {
    marginTop: 0,
  },
  habitTrackerHint: {
    color: '#475467',
    fontSize: 12,
  },
  habitTrackerList: {
    gap: 8,
  },
  habitTrackerRowCard: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    backgroundColor: '#f8fbff',
  },
  habitTrackerRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  habitTrackerRowName: {
    color: '#1d2939',
    fontWeight: '700',
    fontSize: 12,
  },
  habitTrackerWeekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  habitTrackerCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 3,
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 1,
  },
  habitTrackerDayLabel: {
    color: '#475467',
    fontSize: 10,
    fontWeight: '700',
  },
  habitTrackerAssignment: {
    color: '#344054',
    fontSize: 10,
  },
  habitTrackerStatus: {
    fontSize: 10,
    fontWeight: '700',
  },
  habitTrackerStatusDone: {
    color: '#027a48',
  },
  habitTrackerStatusOpen: {
    color: '#b54708',
  },
  upcomingNotesCard: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    backgroundColor: '#fff',
  },
  upcomingNotesList: {
    gap: 8,
  },
  upcomingNotesItem: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
});
