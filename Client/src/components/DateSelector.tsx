import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addDays, format, parseISO } from 'date-fns';
import { formatDate, toYYYYMMDD } from '../utils/date';

interface DateSelectorProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChangeDate: (dateStr: string) => void;
  error?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  label = 'Travel Date',
  value,
  onChangeDate,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const today = new Date();
  
  // Create quick options (Today, Tomorrow, +2 Days, +3 Days, +7 Days, +14 Days)
  const quickOptions = [
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: addDays(today, 1) },
    { label: format(addDays(today, 2), 'EEE, dd MMM'), date: addDays(today, 2) },
    { label: format(addDays(today, 3), 'EEE, dd MMM'), date: addDays(today, 3) },
    { label: format(addDays(today, 7), 'EEE, dd MMM'), date: addDays(today, 7) },
    { label: format(addDays(today, 14), 'EEE, dd MMM'), date: addDays(today, 14) },
  ];

  const handleSelectQuick = (d: Date) => {
    const formatted = toYYYYMMDD(d);
    onChangeDate(formatted);
    setModalVisible(false);
  };

  const displayString = value ? formatDate(value) : 'Select Travel Date';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.selectorButton, Boolean(error) && styles.errorBorder]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorLeft}>
          <Ionicons name="calendar-outline" size={20} color="#4F46E5" style={styles.icon} />
          <Text style={value ? styles.valueText : styles.placeholderText}>{displayString}</Text>
        </View>
        <Ionicons name="chevron-down-outline" size={18} color="#64748B" />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Quick shortcut pills under date field */}
      <View style={styles.quickPillsRow}>
        <Text style={styles.quickPillLabel}>Quick select:</Text>
        {quickOptions.slice(0, 3).map((opt, idx) => {
          const optStr = toYYYYMMDD(opt.date);
          const isSelected = optStr === value;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.quickPill, isSelected && styles.quickPillSelected]}
              onPress={() => onChangeDate(optStr)}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickPillText, isSelected && styles.quickPillTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Departure Date</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubTitle}>Select a date for your train journey:</Text>

            {quickOptions.map((opt, idx) => {
              const optStr = toYYYYMMDD(opt.date);
              const isSelected = optStr === value;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dateOptionCard, isSelected && styles.dateOptionSelected]}
                  onPress={() => handleSelectQuick(opt.date)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateOptionLeft}>
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={isSelected ? '#4F46E5' : '#64748B'}
                      style={{ marginRight: 12 }}
                    />
                    <View>
                      <Text style={[styles.dateOptionTitle, isSelected && styles.dateOptionTitleSelected]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.dateOptionSub}>{formatDate(optStr)}</Text>
                    </View>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 56,
  },
  errorBorder: {
    borderColor: '#EF4444',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  placeholderText: {
    fontSize: 15,
    color: '#94A3B8',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
  quickPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quickPillLabel: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 6,
  },
  quickPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  quickPillSelected: {
    backgroundColor: '#4F46E5',
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickPillTextSelected: {
    color: '#FFFFFF',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalSubTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  dateOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  dateOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  dateOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateOptionTitleSelected: {
    color: '#4F46E5',
  },
  dateOptionSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});

