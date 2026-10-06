import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types/booking';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/date';

interface BookingCardProps {
  booking: Booking;
  onViewTicket: (booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onViewTicket }) => {
  const confirmedCount = booking.passengers.filter((p) => p.status === 'CONFIRMED').length;
  const waitlistedCount = booking.passengers.filter((p) => p.status === 'WAITLISTED').length;
  const cancelledCount = booking.passengers.filter((p) => p.status === 'CANCELLED').length;

  const totalPassengers = booking.passengers.length;

  // Determine overall status for badge display
  let primaryStatusBadge: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED' = 'CONFIRMED';
  if (totalPassengers > 0 && cancelledCount === totalPassengers) {
    primaryStatusBadge = 'CANCELLED';
  } else if (waitlistedCount > 0 && confirmedCount === 0) {
    primaryStatusBadge = 'WAITLISTED';
  }

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.idContainer}>
          <Text style={styles.idLabel}>BOOKING ID</Text>
          <Text style={styles.idValue}>#{booking.booking_id}</Text>
        </View>
        <StatusBadge status={primaryStatusBadge} size="sm" />
      </View>

      <View style={styles.divider} />

      {/* Train Info */}
      <View style={styles.trainRow}>
        <Ionicons name="train-outline" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
        <Text style={styles.trainTitle}>
          {booking.schedule ? `${booking.schedule.train_name} (${booking.schedule.train_number})` : `Schedule #${booking.schedule_id}`}
        </Text>
      </View>

      {/* Booking Date */}
      <Text style={styles.dateText}>Booked on: {formatDateTime(booking.created_at)}</Text>

      {/* Passengers Summary Pill Row */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{totalPassengers}</Text>
          <Text style={styles.summaryLabel}>{totalPassengers === 1 ? 'Passenger' : 'Passengers'}</Text>
        </View>
        <View style={styles.vertDivider} />

        <View style={styles.passengerStatusPills}>
          {confirmedCount > 0 && (
            <Text style={[styles.statusPillText, { color: '#15803D' }]}>
              {confirmedCount} Confirmed
            </Text>
          )}
          {waitlistedCount > 0 && (
            <Text style={[styles.statusPillText, { color: '#B45309' }]}>
              {waitlistedCount} Waitlisted
            </Text>
          )}
          {cancelledCount > 0 && (
            <Text style={[styles.statusPillText, { color: '#B91C1C' }]}>
              {cancelledCount} Cancelled
            </Text>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.totalLabel}>Total Fare</Text>
          <Text style={styles.totalValue}>{formatCurrency(booking.total_fare)}</Text>
        </View>

        <TouchableOpacity
          style={styles.ticketBtn}
          onPress={() => onViewTicket(booking)}
          activeOpacity={0.8}
        >
          <Text style={styles.ticketBtnText}>View Ticket</Text>
          <Ionicons name="receipt-outline" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  idContainer: {},
  idLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  idValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  trainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trainTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  summaryItem: {
    alignItems: 'center',
    paddingRight: 12,
  },
  summaryNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4F46E5',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  vertDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginRight: 12,
  },
  passengerStatusPills: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  ticketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ticketBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

