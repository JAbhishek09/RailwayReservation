import { Station } from '../types/station';
import { Schedule } from '../types/schedule';
import { Booking } from '../types/booking';

export const MOCK_STATIONS: Station[] = [
  { station_id: 1, code: 'INDB', name: 'Indore Jn', city: 'Indore' },
  { station_id: 2, code: 'BPL', name: 'Bhopal Jn', city: 'Bhopal' },
  { station_id: 3, code: 'NDLS', name: 'New Delhi', city: 'Delhi' },
  { station_id: 4, code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai' },
  { station_id: 5, code: 'ADI', name: 'Ahmedabad Jn', city: 'Ahmedabad' },
];

export const MOCK_SCHEDULES: Schedule[] = [
  {
    schedule_id: 1,
    train_number: 'T101',
    train_name: 'Indore Express',
    from_station: 'Indore Jn',
    to_station: 'Delhi',
    departure_time: '2026-10-10T02:30:00.000Z',
    arrival_time: '2026-10-10T12:30:00.000Z',
    fare: '850.00',
    available_seats: 12,
  },
  {
    schedule_id: 2,
    train_number: 'T102',
    train_name: 'Malwa Express',
    from_station: 'Indore Jn',
    to_station: 'Delhi',
    departure_time: '2026-10-10T16:00:00.000Z',
    arrival_time: '2026-10-11T06:00:00.000Z',
    fare: '920.00',
    available_seats: 0, // Waitlist available!
  },
  {
    schedule_id: 3,
    train_number: 'T103',
    train_name: 'Bhopal Shatabdi',
    from_station: 'Bhopal Jn',
    to_station: 'New Delhi',
    departure_time: '2026-10-10T06:00:00.000Z',
    arrival_time: '2026-10-10T14:30:00.000Z',
    fare: '1250.00',
    available_seats: 24,
  },
  {
    schedule_id: 4,
    train_number: 'T104',
    train_name: 'Avantika Express',
    from_station: 'Indore Jn',
    to_station: 'Mumbai Central',
    departure_time: '2026-10-10T17:30:00.000Z',
    arrival_time: '2026-10-11T06:15:00.000Z',
    fare: '1100.00',
    available_seats: 5,
  },
];

export const MOCK_BOOKINGS: Record<number, Booking> = {
  7: {
    booking_id: 7,
    user_id: 1,
    schedule_id: 1,
    total_fare: '1700.00',
    idempotency_key: 'b9423c10-8b1e-4054-9fa2-8e104e138a01',
    created_at: '2026-10-06T10:00:00.000Z',
    passengers: [
      {
        bp_id: 11,
        name: 'Rahul Sharma',
        age: 28,
        gender: 'M',
        status: 'CONFIRMED',
        coach_code: 'S1',
        seat_number: 4,
      },
      {
        bp_id: 12,
        name: 'Priya Sharma',
        age: 26,
        gender: 'F',
        status: 'WAITLISTED',
        coach_code: null,
        seat_number: null,
      },
    ],
    schedule: MOCK_SCHEDULES[0],
  },
};

