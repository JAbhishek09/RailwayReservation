import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { PassengerCard } from '../components/PassengerCard';
import { formatCurrency } from '../utils/currency';
import { formatDateTime, formatTime } from '../utils/date';
import { calculateDuration } from '../utils/duration';

type BookingConfirmationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'BookingConfirmation'
>;

export const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  route,
  navigation,
}) => {
  const { booking } = route.params;
  const schedule = booking.schedule;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#15803D" />

      {/* Success Top Banner */}
      <View style={styles.successBanner}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark-sharp" size={32} color="#15803D" />
        </View>
        <Text style={styles.successTitle}>Booking Successful!</Text>
        <Text style={styles.successSub}>
          Your ticket has been generated. Seat allocation is automatic.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* E-Ticket Card */}
        <View style={styles.ticketCard}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <View>
              <Text style={styles.ticketHeaderLabel}>BOARDING PASS</Text>
              <Text style={styles.bookingIdText}>Booking ID: #{booking.booking_id}</Text>
            </View>
            <View style={styles.eTicketBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#4F46E5" style={{ marginRight: 4 }} />
              <Text style={styles.eTicketBadgeText}>E-TICKET</Text>
            </View>
          </View>

          <View style={styles.dashedSeparator} />

          {/* Train Details */}
          {schedule && (
            <View style={styles.trainRow}>
              <Ionicons name="train" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.trainNameText}>{schedule.train_name}</Text>
                <Text style={styles.trainNumberText}>Train #{schedule.train_number}</Text>
              </View>
            </View>
          )}

          {/* Route & Times */}
          {schedule && (
            <View style={styles.routeBox}>
              <View style={styles.routeCol}>
                <Text style={styles.timeText}>{formatTime(schedule.departure_time)}</Text>
                <Text style={styles.stationText}>{schedule.from_station}</Text>
              </View>

              <View style={styles.durationCol}>
                <Text style={styles.durationText}>
                  {calculateDuration(schedule.departure_time, schedule.arrival_time)}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#6366F1" />
              </View>

              <View style={[styles.routeCol, { alignItems: 'flex-end' }]}>
                <Text style={styles.timeText}>{formatTime(schedule.arrival_time)}</Text>
                <Text style={styles.stationText}>{schedule.to_station}</Text>
              </View>
            </View>
          )}

          <View style={styles.dashedSeparator} />

          {/* Passengers Section */}
          <View style={styles.passengersSection}>
            <Text style={styles.passengersSectionTitle}>Passenger List & Seat Status</Text>
            {booking.passengers.map((passenger, index) => (
              <PassengerCard key={passenger.bp_id || index} passenger={passenger} index={index} />
            ))}
          </View>

          <View style={styles.dashedSeparator} />

          {/* Ticket Footer / Fare & Date */}
          <View style={styles.ticketFooter}>
            <View>
              <Text style={styles.footerLabel}>Total Fare Paid</Text>
              <Text style={styles.footerFareValue}>{formatCurrency(booking.total_fare)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>Booking Date</Text>
              <Text style={styles.footerDateValue}>{formatDateTime(booking.created_at)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => navigation.navigate('TicketDetails', { bookingId: booking.booking_id })}
          activeOpacity={0.85}
        >
          <Ionicons name="receipt-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.detailsBtnText}>View Ticket & Cancel Option</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.myBookingsBtn}
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'MyBookings',
            })
          }
          activeOpacity={0.8}
        >
          <Ionicons name="bookmark-outline" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
          <Text style={styles.myBookingsBtnText}>Go to My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          activeOpacity={0.7}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#15803D',
  },
  successBanner: {
    backgroundColor: '#15803D',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successSub: {
    fontSize: 13,
    color: '#DCFCE7',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollContent: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    paddingBottom: 36,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: -24,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  bookingIdText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  eTicketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eTicketBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  dashedSeparator: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  trainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trainNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  trainNumberText: {
    fontSize: 12,
    color: '#64748B',
  },
  routeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
  },
  routeCol: {
    flex: 1,
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
    paddingHorizontal: 8,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 2,
  },
  passengersSection: {
    marginVertical: 4,
  },
  passengersSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  footerFareValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  footerDateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  detailsBtn: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  myBookingsBtn: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  myBookingsBtnText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '700',
  },
  homeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  homeBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});

