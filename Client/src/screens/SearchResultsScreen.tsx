import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSchedules } from '../hooks/useSchedules';
import { TrainCard } from '../components/TrainCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { formatDate } from '../utils/date';
import { Schedule } from '../types/schedule';

type SearchResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchResults'>;

export const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({ route, navigation }) => {
  const { from, to, date } = route.params;

  const { data: schedules, isLoading, isError, error, refetch, isRefetching } = useSchedules({
    from,
    to,
    date,
  });

  const handleBookSchedule = (schedule: Schedule) => {
    navigation.navigate('PassengerBooking', { schedule });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#3730A3" />

      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.routeHeaderTitle}>
              {from} → {to}
            </Text>
            <Text style={styles.dateHeaderSub}>{formatDate(date)}</Text>
          </View>
          <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Body Content */}
      <View style={styles.body}>
        {isLoading ? (
          <LoadingState message="Searching available train schedules..." />
        ) : isError ? (
          <ErrorState
            title="Unable to load schedules"
            message={error?.message || 'Failed to fetch schedules from backend.'}
            onRetry={() => refetch()}
          />
        ) : !schedules || schedules.length === 0 ? (
          <EmptyState
            icon="train-outline"
            title="No Trains Found"
            description={`No direct trains found from ${from} to ${to} on ${formatDate(date)}.`}
            actionText="Modify Search"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <FlatList
            data={schedules}
            keyExtractor={(item) => String(item.schedule_id)}
            renderItem={({ item }) => (
              <TrainCard schedule={item} onBookPress={handleBookSchedule} />
            )}
            contentContainerStyle={styles.listPadding}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListHeaderComponent={
              <View style={styles.resultCountBanner}>
                <Text style={styles.resultCountText}>
                  Found {schedules.length} train {schedules.length === 1 ? 'schedule' : 'schedules'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3730A3',
  },
  header: {
    backgroundColor: '#3730A3',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  routeHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateHeaderSub: {
    fontSize: 12,
    color: '#C7D2FE',
    marginTop: 2,
  },
  refreshBtn: {
    padding: 6,
  },
  body: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listPadding: {
    padding: 16,
    paddingBottom: 32,
  },
  resultCountBanner: {
    marginBottom: 12,
  },
  resultCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
