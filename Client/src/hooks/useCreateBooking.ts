import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking } from '../api/bookings.api';
import { Booking, CreateBookingPayload } from '../types/booking';
import { BOOKING_DETAILS_QUERY_KEY, USER_BOOKINGS_QUERY_KEY } from './useBooking';
import { ENV } from '../config/env';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, CreateBookingPayload>({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: (newBooking) => {
      // Set query cache for the newly created booking
      queryClient.setQueryData(
        BOOKING_DETAILS_QUERY_KEY(newBooking.booking_id),
        newBooking
      );
      // Invalidate user bookings list so My Bookings tab updates
      queryClient.invalidateQueries({
        queryKey: USER_BOOKINGS_QUERY_KEY(ENV.DEFAULT_USER_ID),
      });
    },
  });
};

