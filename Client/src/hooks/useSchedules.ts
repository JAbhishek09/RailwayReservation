import { useQuery } from '@tanstack/react-query';
import { fetchSchedules } from '../api/schedules.api';
import { Schedule, SearchScheduleParams } from '../types/schedule';

export const SCHEDULES_QUERY_KEY = (params: SearchScheduleParams) => [
  'schedules',
  params.from,
  params.to,
  params.date,
];

export const useSchedules = (params: SearchScheduleParams, enabled = true) => {
  return useQuery<Schedule[], Error>({
    queryKey: SCHEDULES_QUERY_KEY(params),
    queryFn: () => fetchSchedules(params),
    enabled: enabled && Boolean(params.from && params.to && params.date),
    staleTime: 1000 * 60 * 2, // 2 minutes stale time for search results
  });
};

