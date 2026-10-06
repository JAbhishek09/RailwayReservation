import { apiClient } from './client';
import { Station } from '../types/station';
import { ENV } from '../config/env';
import { MOCK_STATIONS } from './mockData';

export const fetchStations = async (): Promise<Station[]> => {
  if (ENV.USE_MOCK_API) {
    // [MOCK MODE] Returns hardcoded mock stations — toggle USE_MOCK_API in env.ts
    return MOCK_STATIONS;
  }
  // Real API call — errors propagate to React Query → ErrorState shown to user
  const response = await apiClient.get<Station[]>('/stations');
  return response.data;
};

