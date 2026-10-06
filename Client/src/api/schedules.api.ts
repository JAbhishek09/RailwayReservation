import { apiClient } from './client';
import { Schedule, SearchScheduleParams } from '../types/schedule';
import { ENV } from '../config/env';
import { MOCK_SCHEDULES } from './mockData';

export const fetchSchedules = async (params: SearchScheduleParams): Promise<Schedule[]> => {
  if (ENV.USE_MOCK_API) {
    // [MOCK MODE] Returns hardcoded mock data — toggle USE_MOCK_API in env.ts
    return MOCK_SCHEDULES;
  }
  // Real API call — errors propagate to React Query → ErrorState shown to user
  const response = await apiClient.get<Schedule[]>('/schedules', { params });
  return response.data;
};

