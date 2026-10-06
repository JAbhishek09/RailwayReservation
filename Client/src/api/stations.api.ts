import { apiClient } from './client';
import { Station } from '../types/station';
import { ENV } from '../config/env';
import { MOCK_STATIONS } from './mockData';

export const fetchStations = async (): Promise<Station[]> => {
  if (ENV.USE_MOCK_API) {
    return MOCK_STATIONS;
  }
  try {
    const response = await apiClient.get<Station[]>('/stations');
    return response.data;
  } catch (error) {
    // If backend is unreachable, return mock stations as fallback in development
    console.warn('[Stations API] Fetch failed, falling back to mock stations:', (error as Error).message);
    return MOCK_STATIONS;
  }
};

