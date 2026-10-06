import { format, parseISO, isValid } from 'date-fns';

/**
 * Format date string (ISO or YYYY-MM-DD) into clean readable date.
 * Example: "2026-10-10T02:30:00.000Z" -> "Sat, 10 Oct 2026"
 */
export const formatDate = (dateInput: string | Date): string => {
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) {
      return String(dateInput);
    }
    return format(d, 'EEE, dd MMM yyyy');
  } catch {
    return String(dateInput);
  }
};

/**
 * Format time from ISO string or Date object.
 * Example: "2026-10-10T02:30:00.000Z" -> "02:30 AM"
 */
export const formatTime = (dateInput: string | Date): string => {
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) {
      return '';
    }
    return format(d, 'hh:mm a');
  } catch {
    return '';
  }
};

/**
 * Format ISO string into full Date and Time.
 * Example: "10 Oct 2026, 02:30 AM"
 */
export const formatDateTime = (dateInput: string | Date): string => {
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) {
      return String(dateInput);
    }
    return format(d, 'dd MMM yyyy, hh:mm a');
  } catch {
    return String(dateInput);
  }
};

/**
 * Format Date object into YYYY-MM-DD format for backend search query parameter.
 */
export const toYYYYMMDD = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};
