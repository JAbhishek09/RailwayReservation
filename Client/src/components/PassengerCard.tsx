import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingPassenger } from '../types/booking';
import { StatusBadge } from './StatusBadge';

interface PassengerCardProps {
  passenger: BookingPassenger;
  index: number;
}

export const PassengerCard: React.FC<PassengerCardProps> = ({ passenger, index }) => {
  const getGenderLabel = (g: string) => {
    switch (g) {
      case 'M':
        return 'Male';
      case 'F':
        return 'Female';
      default:
        return 'Other';
    }
  };

  const isConfirmed = passenger.status === 'CONFIRMED';
  const isWaitlisted = passenger.status === 'WAITLISTED';

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <View style={styles.iconCircle}>
          <Ionicons name="person-outline" size={18} color="#4F46E5" />
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.nameText}>{passenger.name}</Text>
          <Text style={styles.detailsText}>
            {passenger.age} yrs • {getGenderLabel(passenger.gender)}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <StatusBadge status={passenger.status} size="sm" />

        <View style={styles.seatInfoContainer}>
          {isConfirmed && passenger.coach_code && passenger.seat_number ? (
            <View style={styles.seatBadge}>
              <Text style={styles.seatBadgeLabel}>Coach / Seat</Text>
              <Text style={styles.seatBadgeValue}>
                {passenger.coach_code} - {passenger.seat_number}
              </Text>
            </View>
          ) : isWaitlisted ? (
            <Text style={styles.waitlistSeatText}>No Seat Assigned</Text>
          ) : (
            <Text style={styles.cancelledText}>Cancelled</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoCol: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailsText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  seatInfoContainer: {
    marginTop: 4,
  },
  seatBadge: {
    alignItems: 'flex-end',
  },
  seatBadgeLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  seatBadgeValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  waitlistSeatText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
  },
  cancelledText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

