import { useCallback, useEffect, useMemo, useState } from 'react';

import { CalendarItem, CalendarItemDraft } from '../domain/calendar-items';
import {
  addCalendarItem,
  deleteCalendarItem,
  listCalendarItemsForRange,
  updateCalendarItem,
} from '../infrastructure/calendar-item-storage';

function getMonthRange(anchorDate: Date) {
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const startDateKey = `${startDate.getFullYear()}-${`${startDate.getMonth() + 1}`.padStart(2, '0')}-${`${startDate.getDate()}`.padStart(2, '0')}`;
  const endDateKey = `${endDate.getFullYear()}-${`${endDate.getMonth() + 1}`.padStart(2, '0')}-${`${endDate.getDate()}`.padStart(2, '0')}`;

  return { startDateKey, endDateKey };
}

export function useFamilyCalendarItems(anchorDate: Date) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [error, setError] = useState('');

  const anchorYear = anchorDate.getFullYear();
  const anchorMonth = anchorDate.getMonth();

  const { startDateKey, endDateKey } = useMemo(
    () => getMonthRange(new Date(anchorYear, anchorMonth, 1)),
    [anchorMonth, anchorYear]
  );

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const nextItems = await listCalendarItemsForRange(startDateKey, endDateKey);
      setItems(nextItems);
      setError('');
    } catch {
      setError('Unable to load calendar items.');
    } finally {
      setLoading(false);
    }
  }, [endDateKey, startDateKey]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveNewItem = useCallback(async (draft: CalendarItemDraft): Promise<boolean> => {
    setSaving(true);
    try {
      await addCalendarItem(draft);
      await reload();
      setError('');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to add calendar item.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [reload]);

  const saveExistingItem = useCallback(async (itemId: string, draft: CalendarItemDraft): Promise<boolean> => {
    setSaving(true);
    try {
      await updateCalendarItem(itemId, draft);
      await reload();
      setError('');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update calendar item.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [reload]);

  const removeItem = useCallback(async (itemId: string) => {
    setSaving(true);
    try {
      await deleteCalendarItem(itemId);
      await reload();
      setError('');
    } catch {
      setError('Unable to delete calendar item.');
    } finally {
      setSaving(false);
    }
  }, [reload]);

  return {
    loading,
    saving,
    error,
    items,
    addItem: saveNewItem,
    updateItem: saveExistingItem,
    deleteItem: removeItem,
  };
}
