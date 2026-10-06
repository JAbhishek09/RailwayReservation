export interface Schedule {
  schedule_id: number;
  train_number: string;
  train_name: string;
  from_station: string;
  to_station: string;
  departure_time: string;
  arrival_time: string;
  fare: string; // Fare is a STRING because MySQL DECIMAL is returned as text
  available_seats: number;
}

export interface SearchScheduleParams {
  from: string; // station code
  to: string;   // station code
  date: string; // YYYY-MM-DD
}
