import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useBookingDetails } from '../hooks/useBooking';
import { useCancelBooking } from '../hooks/useCancelBooking';
import { PassengerCard } from '../components/PassengerCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { formatCurrency } from '../utils/currency';
import { formatDateTime, formatTime } from '../utils/date';
import { calculateDuration } from '../utils/duration';

type TicketDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'TicketDetails'>;

export const TicketDetailsScreen: React.FC<TicketDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { bookingId } = route.params;

  // Refetches live ticket details every time screen opens
  const { data: booking, isLoading, isError, error, refetch, isRefetching } = useBookingDetails(bookingId);

  const { mutateAsync: cancelBookingMutation, isPending: isCancelling } = useCancelBooking();

  const isAllCancelled = booking?.passengers.every((p) => p.status === 'CANCELLED');

  const handleCancelPress = () => {
    if (isAllCancelled) {
      Alert.alert('Already Cancelled', 'This booking has already been cancelled.');
      return;
    }

    Alert.alert(
      'Cancel Entire Booking?',
      'Are you sure you want to cancel this booking? This will cancel all passengers on this ticket and initiate a full refund.',
      [
        { text: 'Keep Ticket', style: 'cancel' },
        {
          text: 'Yes, Cancel Ticket',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBookingMutation(bookingId);
              Alert.alert(
                'Booking Cancelled',
                'Your booking has been cancelled successfully. Released seats have been re-allocated.'
              );
            } catch (err) {
              const msg = (err as Error).message || 'Failed to cancel booking.';
              if (msg.includes('409') || msg.toLowerCase().includes('already')) {
                Alert.alert('Cancellation Conflict', 'This booking was already cancelled.');
              } else {
                Alert.alert('Cancellation Error', msg);
              }
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#3730A3" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.body}>
        {isLoading ? (
          <LoadingState message="Fetching live ticket status..." />
        ) : isError ? (
          <ErrorState
            title="Ticket Not Found"
            message={error?.message || 'Could not load ticket details from the backend.'}
            onRetry={() => refetch()}
          />
        ) : !booking ? (
          <ErrorState title="No Ticket Data" message="Ticket data is unavailable." />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F46E5" />
            }
          >
            {/* Status Info Banner */}
            {isAllCancelled ? (
              <View style={styles.cancelledBanner}>
                <Ionicons name="close-circle" size={24} color="#B91C1C" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cancelledTitle}>TICKET CANCELLED</Text>
                  <Text style={styles.cancelledSub}>
                    This booking was cancelled. Payment refunded according to policy.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.statusInfoBanner}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#4F46E5"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.statusInfoText}>
                  Pull down to refresh and check for waitlist confirmation updates.
                </Text>
              </View>
            )}

            {/* Main Ticket Document Card */}
            <View style={styles.ticketCard}>
              <View style={styles.ticketTopRow}>
                <View>
                  <Text style={styles.labelSmall}>BOOKING REFERENCE</Text>
                  <Text style={styles.bookingIdText}>#{booking.booking_id}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>
                    {isAllCancelled ? 'CANCELLED' : 'ACTIVE TICKET'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Schedule Details if available */}
              {booking.schedule ? (
                <>
                  <View style={styles.trainRow}>
                    <Ionicons name="train" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
                    <Text style={styles.trainNameText}>
                      {booking.schedule.train_name} ({booking.schedule.train_number})
                    </Text>
                  </View>

                  <View style={styles.routeContainer}>
                    <View>
                      <Text style={styles.timeText}>{formatTime(booking.schedule.departure_time)}</Text>
                      <Text style={styles.stationText}>{booking.schedule.from_station}</Text>
                    </View>

                    <View style={styles.durationCol}>
                      <Text style={styles.durationText}>
                        {calculateDuration(
                          booking.schedule.departure_time,
                          booking.schedule.arrival_time
                        )}
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color="#6366F1" />
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.timeText}>{formatTime(booking.schedule.arrival_time)}</Text>
                      <Text style={styles.stationText}>{booking.schedule.to_station}</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.trainRow}>
                  <Ionicons name="train" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
                  <Text style={styles.trainNameText}>Schedule ID #{booking.schedule_id}</Text>
                </View>
              )}

              <View style={styles.divider} />

              {/* Passenger List */}
              <Text style={styles.sectionHeaderTitle}>Passengers & Assigned Seats</Text>
              {booking.passengers.map((passenger, idx) => (
                <PassengerCard key={passenger.bp_id || idx} passenger={passenger} index={idx} />
              ))}

              <View style={styles.divider} />

              {/* Fare & Idempotency Key Info */}
              <View style={styles.footerRow}>
                <View>
                  <Text style={styles.labelSmall}>TOTAL FARE</Text>
                  <Text style={styles.fareAmount}>{formatCurrency(booking.total_fare)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.labelSmall}>BOOKED ON</Text>
                  <Text style={styles.dateValue}>{formatDateTime(booking.created_at)}</Text>
                </View>
              </View>

              <View style={styles.idempotencyBox}>
                <Text style={styles.idempotencyLabel}>Idempotency Key:</Text>
                <Text style={styles.idempotencyValue} numberOfLines={1}>
                  {booking.idempotency_key}
                </Text>
              </View>
            </View>

            {/* Cancel Booking Action Button */}
            {!isAllCancelled && (
              <TouchableOpacity
                style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
                onPress={handleCancelPress}
                disabled={isCancelling}
                activeOpacity={0.85}
              >
                {isCancelling ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                    <Text style={styles.cancelButtonText}>Cancelling Booking...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.cancelButtonText}>Cancel Entire Booking</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  refreshBtn: {
    padding: 4,
  },
  body: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  statusInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  statusInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#3730A3',
    fontWeight: '500',
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelledTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
  },
  cancelledSub: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 2,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  ticketTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  bookingIdText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  trainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trainNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  stationText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  durationCol: {
    alignItems: 'center',
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 2,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  idempotencyBox: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  idempotencyLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginRight: 4,
  },
  idempotencyValue: {
    fontSize: 10,
    color: '#64748B',
    flex: 1,
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  cancelButtonDisabled: {
    backgroundColor: '#F87171',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
