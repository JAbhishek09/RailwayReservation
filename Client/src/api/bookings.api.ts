import { apiClient } from './client';
import { Booking, CreateBookingPayload } from '../types/booking';
import { ENV } from '../config/env';
import { MOCK_BOOKINGS } from './mockData';

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
    return mockBooking;
  }

  const response = await apiClient.post<Booking>('/bookings', payload);
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

  const response = await apiClient.get<Booking>(`/bookings/${id}`);
  return response.data;
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
 * GET /users/:userId/bookings
 * Fetch all bookings for a user from the backend (newest first).
 * In mock mode, returns the in-memory mock bookings instead.
 */
export const fetchUserBookings = async (userId: number = ENV.DEFAULT_USER_ID): Promise<Booking[]> => {
  if (ENV.USE_MOCK_API) {
    return Object.values(MOCK_BOOKINGS)
      .filter((b) => b.user_id === userId)
      .sort((a, b) => b.booking_id - a.booking_id);
  }

  const response = await apiClient.get<Booking[]>(`/users/${userId}/bookings`);
  return response.data;
};

