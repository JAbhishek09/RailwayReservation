import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PassengerStatus } from '../types/booking';

type BadgeType = PassengerStatus | 'Available' | 'Waitlist Available';

interface StatusBadgeProps {
  status: BadgeType;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'CONFIRMED':
        return {
          bg: '#DCFCE7',
          text: '#15803D',
          border: '#86EFAC',
          icon: 'checkmark-circle-outline' as const,
          label: 'CONFIRMED',
        };
      case 'WAITLISTED':
        return {
          bg: '#FEF3C7',
          text: '#B45309',
          border: '#FDE68A',
          icon: 'time-outline' as const,
          label: 'WAITLISTED',
        };
      case 'CANCELLED':
        return {
          bg: '#FEE2E2',
          text: '#B91C1C',
          border: '#FCA5A5',
          icon: 'close-circle-outline' as const,
          label: 'CANCELLED',
        };
      case 'Available':
        return {
          bg: '#ECFDF5',
          text: '#047857',
          border: '#6EE7B7',
          icon: 'checkbox-outline' as const,
          label: 'Available',
        };
      case 'Waitlist Available':
        return {
          bg: '#FFFBEB',
          text: '#D97706',
          border: '#FCD34D',
          icon: 'alert-circle-outline' as const,
          label: 'Waitlist Available',
        };
      default:
        return {
          bg: '#F3F4F6',
          text: '#374151',
          border: '#E5E7EB',
          icon: 'information-circle-outline' as const,
          label: String(status),
        };
    }
  };

  const styleConfig = getBadgeStyle();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badgeContainer,
        { backgroundColor: styleConfig.bg, borderColor: styleConfig.border },
        isSm && styles.badgeSm,
      ]}
    >
      <Ionicons
        name={styleConfig.icon}
        size={isSm ? 12 : 14}
        color={styleConfig.text}
        style={styles.icon}
      />
      <Text style={[styles.badgeText, { color: styleConfig.text }, isSm && styles.textSm]}>
        {styleConfig.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 14,
  },
  icon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 10,
  },
});

