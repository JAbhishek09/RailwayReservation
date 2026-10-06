import { Schedule } from './schedule';

export type PassengerStatus = 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';

export type Gender = 'M' | 'F' | 'O';

export type PaymentMode = 'UPI' | 'CARD' | 'NETBANKING';

export interface CreatePassengerDto {
  name: string;
  age: number;
  gender: Gender;
}

export interface CreateBookingPayload {
  userId: number;
  scheduleId: number;
  idempotencyKey: string;
  mode: PaymentMode;
  passengers: CreatePassengerDto[];
}

export interface BookingPassenger {
  bp_id: number;
  name: string;
  age: number;
  gender: Gender;
  status: PassengerStatus;
  coach_code: string | null;
  seat_number: number | null;
}

export interface Booking {
  booking_id: number;
  user_id: number;
  schedule_id: number;
  total_fare: string;
  idempotency_key: string;
  created_at: string;
  passengers: BookingPassenger[];
  // Enriched schedule data when retrieved locally or joined
  schedule?: Schedule;
}
