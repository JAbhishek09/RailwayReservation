import { useQuery } from '@tanstack/react-query';
import { fetchStations } from '../api/stations.api';
import { Station } from '../types/station';

export const STATIONS_QUERY_KEY = ['stations'];

export const useStations = () => {
  return useQuery<Station[], Error>({
    queryKey: STATIONS_QUERY_KEY,
    queryFn: fetchStations,
    staleTime: 1000 * 60 * 30, // 30 minutes cache for station list
  });
};

