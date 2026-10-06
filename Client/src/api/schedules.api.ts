import { apiClient } from './client';
import { Schedule, SearchScheduleParams } from '../types/schedule';
import { ENV } from '../config/env';
import { MOCK_SCHEDULES } from './mockData';

export const fetchSchedules = async (params: SearchScheduleParams): Promise<Schedule[]> => {
  if (ENV.USE_MOCK_API) {
    return MOCK_SCHEDULES;
  }
  try {
    const response = await apiClient.get<Schedule[]>('/schedules', { params });
    return response.data;
  } catch (error) {
    console.warn('[Schedules API] Server search failed, falling back to mock schedules:', (error as Error).message);
    // Return mock data for dev testing if backend is offline
    return MOCK_SCHEDULES;
  }
};

