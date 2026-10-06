import { useQuery } from '@tanstack/react-query';
import { fetchBookingById, fetchUserBookings } from '../api/bookings.api';
import { Booking } from '../types/booking';
import { ENV } from '../config/env';

export const BOOKING_DETAILS_QUERY_KEY = (id: number | string) => ['booking', String(id)];
export const USER_BOOKINGS_QUERY_KEY = (userId: number) => ['userBookings', userId];

export const useBookingDetails = (id: number | string | undefined, enabled = true) => {
  return useQuery<Booking, Error>({
    queryKey: BOOKING_DETAILS_QUERY_KEY(id || ''),
    queryFn: () => fetchBookingById(id!),
    enabled: enabled && Boolean(id),
    staleTime: 0, // Always refetch fresh status when visiting ticket screen
  });
};

export const useUserBookings = (userId: number = ENV.DEFAULT_USER_ID) => {
  return useQuery<Booking[], Error>({
    queryKey: USER_BOOKINGS_QUERY_KEY(userId),
    queryFn: () => fetchUserBookings(userId),
    staleTime: 1000 * 30, // 30 seconds
  });
};

