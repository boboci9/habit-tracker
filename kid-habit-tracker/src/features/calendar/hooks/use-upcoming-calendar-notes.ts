import { useCallback, useEffect, useState } from 'react';

import { CalendarNote, CalendarNoteDraft } from '../domain/calendar-notes';
import {
  addCalendarNote,
  deleteCalendarNote,
  listCalendarNotes,
  updateCalendarNote,
} from '../infrastructure/calendar-note-storage';

export function useUpcomingCalendarNotes() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const nextNotes = await listCalendarNotes();
      setNotes(nextNotes);
      setError('');
    } catch {
      setError('Unable to load upcoming notes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveNewNote = useCallback(async (draft: CalendarNoteDraft): Promise<boolean> => {
    setSaving(true);
    try {
      await addCalendarNote(draft);
      await reload();
      setError('');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to add upcoming note.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [reload]);

  const saveExistingNote = useCallback(async (noteId: string, draft: CalendarNoteDraft): Promise<boolean> => {
    setSaving(true);
    try {
      await updateCalendarNote(noteId, draft);
      await reload();
      setError('');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update upcoming note.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [reload]);

  const removeNote = useCallback(async (noteId: string) => {
    setSaving(true);
    try {
      await deleteCalendarNote(noteId);
      await reload();
      setError('');
    } catch {
      setError('Unable to delete upcoming note.');
    } finally {
      setSaving(false);
    }
  }, [reload]);

  return {
    loading,
    saving,
    notes,
    error,
    addNote: saveNewNote,
    updateNote: saveExistingNote,
    deleteNote: removeNote,
  };
}
