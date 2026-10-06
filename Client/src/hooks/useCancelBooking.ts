import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from '../api/bookings.api';
import { Booking } from '../types/booking';
import { BOOKING_DETAILS_QUERY_KEY, USER_BOOKINGS_QUERY_KEY } from './useBooking';
import { ENV } from '../config/env';

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, number | string>({
    mutationFn: (bookingId: number | string) => cancelBooking(bookingId),
    onSuccess: (updatedBooking, bookingId) => {
      // Update individual booking detail in cache
      queryClient.setQueryData(
        BOOKING_DETAILS_QUERY_KEY(bookingId),
        updatedBooking
      );
      // Invalidate both individual booking and user list queries to trigger fresh refetch
      queryClient.invalidateQueries({
        queryKey: BOOKING_DETAILS_QUERY_KEY(bookingId),
      });
      queryClient.invalidateQueries({
        queryKey: USER_BOOKINGS_QUERY_KEY(ENV.DEFAULT_USER_ID),
      });
    },
  });
};

