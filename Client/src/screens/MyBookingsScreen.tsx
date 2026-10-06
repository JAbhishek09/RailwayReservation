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
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList } from '../navigation/TabNavigator';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserBookings } from '../hooks/useBooking';
import { BookingCard } from '../components/BookingCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { Booking } from '../types/booking';
import { ENV } from '../config/env';

type MyBookingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'MyBookings'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const MyBookingsScreen: React.FC<MyBookingsScreenProps> = ({ navigation }) => {
  const {
    data: bookings,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useUserBookings(ENV.DEFAULT_USER_ID);

  const handleViewTicket = (booking: Booking) => {
    navigation.navigate('TicketDetails', { bookingId: booking.booking_id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#3730A3" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="receipt" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>My Bookings</Text>
            <Text style={styles.headerSub}>User ID: #{ENV.DEFAULT_USER_ID}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Body Content */}
      <View style={styles.body}>
        {isLoading ? (
          <LoadingState message="Loading your bookings..." />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Bookings"
            message={error?.message || 'Unable to retrieve your booking history.'}
            onRetry={() => refetch()}
          />
        ) : !bookings || bookings.length === 0 ? (
          <EmptyState
            icon="bookmark-outline"
            title="No Bookings Yet"
            description="You have not booked any train tickets yet. Search for available train schedules to start."
            actionText="Search Trains Now"
            onAction={() => navigation.navigate('Home')}
          />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => String(item.booking_id)}
            renderItem={({ item }) => (
              <BookingCard booking={item} onViewTicket={handleViewTicket} />
            )}
            contentContainerStyle={styles.listPadding}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListHeaderComponent={
              <View style={styles.listHeaderBanner}>
                <Text style={styles.listHeaderBannerText}>
                  Showing {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3730A3',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#C7D2FE',
    marginTop: 1,
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
  listHeaderBanner: {
    marginBottom: 12,
  },
  listHeaderBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
