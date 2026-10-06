import { apiClient } from './client';
import { Booking, CreateBookingPayload } from '../types/booking';
import { ENV } from '../config/env';
import { MOCK_BOOKINGS } from './mockData';

// Local array to store created booking IDs in current session / local storage layer
const sessionBookingIds: number[] = [7]; // Seeded default booking ID for testing

export const addBookingIdToHistory = (bookingId: number) => {
  if (!sessionBookingIds.includes(bookingId)) {
    sessionBookingIds.unshift(bookingId);
  }
};

export const getSessionBookingIds = (): number[] => {
  return [...sessionBookingIds];
};

/**
 * POST /bookings
 * Create a new railway booking.
 */
export const createBooking = async (payload: CreateBookingPayload): Promise<Booking> => {
  if (ENV.USE_MOCK_API) {
    const newId = Math.floor(Math.random() * 1000) + 10;
    const mockBooking: Booking = {
      booking_id: newId,
      user_id: payload.userId,
      schedule_id: payload.scheduleId,
      total_fare: (payload.passengers.length * 850).toFixed(2),
      idempotency_key: payload.idempotencyKey,
      created_at: new Date().toISOString(),
      passengers: payload.passengers.map((p, idx) => ({
        bp_id: newId * 10 + idx,
        name: p.name,
        age: p.age,
        gender: p.gender,
        status: idx === 0 ? 'CONFIRMED' : 'WAITLISTED',
        coach_code: idx === 0 ? 'S1' : null,
        seat_number: idx === 0 ? idx + 5 : null,
      })),
    };
    MOCK_BOOKINGS[newId] = mockBooking;
    addBookingIdToHistory(newId);
    return mockBooking;
  }

  const response = await apiClient.post<Booking>('/bookings', payload);
  if (response.data?.booking_id) {
    addBookingIdToHistory(response.data.booking_id);
  }
  return response.data;
};

/**
 * GET /bookings/:id
 * Retrieve booking details by ID (used for fresh status updates).
 */
export const fetchBookingById = async (id: number | string): Promise<Booking> => {
  if (ENV.USE_MOCK_API) {
    const numericId = Number(id);
    if (MOCK_BOOKINGS[numericId]) {
      return MOCK_BOOKINGS[numericId];
    }
    throw new Error('Booking not found');
  }

  try {
    const response = await apiClient.get<Booking>(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    const numericId = Number(id);
    if (MOCK_BOOKINGS[numericId]) {
      return MOCK_BOOKINGS[numericId];
    }
    throw error;
  }
};

/**
 * POST /bookings/:id/cancel
 * Cancel an entire booking.
 */
export const cancelBooking = async (id: number | string): Promise<Booking> => {
  if (ENV.USE_MOCK_API) {
    const numericId = Number(id);
    const booking = MOCK_BOOKINGS[numericId];
    if (!booking) {
      throw new Error('Booking not found');
    }
    if (booking.passengers.every((p) => p.status === 'CANCELLED')) {
      const err = new Error('Booking is already cancelled.');
      (err as unknown as { response: { status: number } }).response = { status: 409 };
      throw err;
    }
    booking.passengers = booking.passengers.map((p) => ({
      ...p,
      status: 'CANCELLED',
      coach_code: null,
      seat_number: null,
    }));
    return booking;
  }

  const response = await apiClient.post<Booking>(`/bookings/${id}/cancel`);
  return response.data;
};

/**
 * Helper to fetch all bookings for current user.
 * Fetches all saved booking IDs in parallel via GET /bookings/:id.
 */
export const fetchUserBookings = async (userId: number = ENV.DEFAULT_USER_ID): Promise<Booking[]> => {
  const ids = getSessionBookingIds();
  if (ids.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(ids.map((id) => fetchBookingById(id)));
  const bookings: Booking[] = [];
  for (const res of results) {
    if (res.status === 'fulfilled' && res.value) {
      if (res.value.user_id === userId) {
        bookings.push(res.value);
      }
    }
  }
  return bookings;
};

