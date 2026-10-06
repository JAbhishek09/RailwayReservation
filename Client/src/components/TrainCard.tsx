import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Schedule } from '../types/schedule';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '../utils/currency';
import { formatTime } from '../utils/date';
import { calculateDuration } from '../utils/duration';

interface TrainCardProps {
  schedule: Schedule;
  onBookPress: (schedule: Schedule) => void;
}

export const TrainCard: React.FC<TrainCardProps> = ({ schedule, onBookPress }) => {
  const durationStr = calculateDuration(schedule.departure_time, schedule.arrival_time);
  const depTimeStr = formatTime(schedule.departure_time);
  const arrTimeStr = formatTime(schedule.arrival_time);

  const isAvailable = schedule.available_seats > 0;
  const badgeStatus = isAvailable ? 'Available' : 'Waitlist Available';

  return (
    <View style={styles.card}>
      {/* Train Header */}
      <View style={styles.headerRow}>
        <View style={styles.trainNameContainer}>
          <View style={styles.trainIconCircle}>
            <Ionicons name="train" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.trainName}>{schedule.train_name}</Text>
            <Text style={styles.trainNumber}>#{schedule.train_number}</Text>
          </View>
        </View>

        <StatusBadge status={badgeStatus} size="sm" />
      </View>

      <View style={styles.divider} />

      {/* Time & Duration Row */}
      <View style={styles.routeRow}>
        {/* Departure */}
        <View style={styles.stationColLeft}>
          <Text style={styles.timeText}>{depTimeStr}</Text>
          <Text style={styles.stationName} numberOfLines={1}>
            {schedule.from_station}
          </Text>
        </View>

        {/* Duration Visual Arrow */}
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>{durationStr}</Text>
          <View style={styles.lineWithArrow}>
            <View style={styles.dot} />
            <View style={styles.dashedLine} />
            <Ionicons name="airplane-sharp" size={14} color="#6366F1" style={styles.trainDirectionIcon} />
            <View style={styles.dashedLine} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Arrival */}
        <View style={styles.stationColRight}>
          <Text style={styles.timeText}>{arrTimeStr}</Text>
          <Text style={styles.stationName} numberOfLines={1}>
            {schedule.to_station}
          </Text>
        </View>
      </View>

      {/* Footer Info & Action */}
      <View style={styles.footerRow}>
        <View style={styles.fareSeatsCol}>
          <Text style={styles.fareLabel}>Fare / Passenger</Text>
          <Text style={styles.fareValue}>{formatCurrency(schedule.fare)}</Text>
          <Text style={styles.seatsCountText}>
            {isAvailable ? `${schedule.available_seats} seats available` : 'WL tickets available'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.bookBtn, !isAvailable && styles.bookBtnWL]}
          onPress={() => onBookPress(schedule)}
          activeOpacity={0.8}
        >
          <Text style={styles.bookBtnText}>{isAvailable ? 'Book Now' : 'Book Waitlist'}</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trainNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trainIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  trainName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  trainNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stationColLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  stationColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  stationName: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  durationContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  lineWithArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
  },
  dashedLine: {
    width: 24,
    height: 2,
    backgroundColor: '#C7D2FE',
  },
  trainDirectionIcon: {
    transform: [{ rotate: '90deg' }],
    marginHorizontal: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
  },
  fareSeatsCol: {
    flex: 1,
  },
  fareLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  fareValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  seatsCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookBtnWL: {
    backgroundColor: '#D97706',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

