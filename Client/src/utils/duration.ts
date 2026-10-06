import { parseISO, differenceInMinutes, isValid } from 'date-fns';

/**
 * Calculates duration between departure and arrival ISO timestamp strings.
 * Returns formatted string like "10h 00m" or "5h 45m".
 */
export const calculateDuration = (departureISO: string, arrivalISO: string): string => {
  try {
    const dep = parseISO(departureISO);
    const arr = parseISO(arrivalISO);

    if (!isValid(dep) || !isValid(arr)) {
      return '--';
    }

    const totalMinutes = Math.abs(differenceInMinutes(arr, dep));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    }
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  } catch {
    return '--';
  }
};
