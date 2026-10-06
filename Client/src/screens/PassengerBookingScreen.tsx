import React, { useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { PassengerForm, BookingFormValues } from '../components/PassengerForm';
import { useCreateBooking } from '../hooks/useCreateBooking';
import { formatCurrency } from '../utils/currency';
import { calculateDuration } from '../utils/duration';
import { formatTime } from '../utils/date';
import { ENV } from '../config/env';
import { PaymentMode } from '../types/booking';

// Zod Schema for Booking Form
const passengerSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }),
  age: z
    .number({ message: 'Age must be a valid number' })
    .min(1, { message: 'Age must be at least 1' })
    .max(120, { message: 'Enter a valid age' }),
  gender: z.enum(['M', 'F', 'O'], { message: 'Gender is required' }),
});

const bookingSchema = z.object({
  mode: z.enum(['UPI', 'CARD', 'NETBANKING'], { message: 'Select payment mode' }),
  passengers: z
    .array(passengerSchema)
    .min(1, { message: 'At least 1 passenger is required' })
    .max(6, { message: 'Maximum 6 passengers allowed per booking' }),
});

type PassengerBookingScreenProps = NativeStackScreenProps<RootStackParamList, 'PassengerBooking'>;

export const PassengerBookingScreen: React.FC<PassengerBookingScreenProps> = ({
  route,
  navigation,
}) => {
  const { schedule } = route.params;
  const { mutateAsync: submitBooking, isPending } = useCreateBooking();

  // Persistent Idempotency Key stored in useRef so it remains identical on retries
  const idempotencyKeyRef = useRef<string>(uuidv4());

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      mode: 'UPI',
      passengers: [{ name: '', age: 25, gender: 'M' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'passengers',
  });

  const selectedPaymentMode = watch('mode');
  const passengerCount = fields.length;
  const farePerPassenger = parseFloat(schedule.fare) || 0;
  const totalFare = farePerPassenger * passengerCount;

  const handleAddPassenger = () => {
    if (fields.length < 6) {
      append({ name: '', age: 25, gender: 'M' });
    } else {
      Alert.alert('Limit Reached', 'Maximum 6 passengers allowed per booking.');
    }
  };

  const handleRemovePassenger = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      Alert.alert('Minimum Limit', 'At least 1 passenger is required.');
    }
  };

  const paymentOptions: { label: string; value: PaymentMode; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'UPI', value: 'UPI', icon: 'qr-code-outline' },
    { label: 'Card', value: 'CARD', icon: 'card-outline' },
    { label: 'Net Banking', value: 'NETBANKING', icon: 'business-outline' },
  ];

  const onSubmit = async (data: BookingFormValues) => {
    try {
      const payload = {
        userId: ENV.DEFAULT_USER_ID,
        scheduleId: schedule.schedule_id,
        idempotencyKey: idempotencyKeyRef.current, // Reused idempotency key for network retry safety
        mode: data.mode,
        passengers: data.passengers,
      };

      const bookingResult = await submitBooking(payload);

      // On successful creation, attach schedule object to result for display and navigate to confirmation
      const enrichedBooking = {
        ...bookingResult,
        schedule,
      };

      navigation.navigate('BookingConfirmation', { booking: enrichedBooking });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to complete booking. Please try again.';
      Alert.alert('Booking Failed', errorMsg, [
        {
          text: 'Retry Booking',
          onPress: () => {
            // Re-submitting reuses the same idempotencyKeyRef.current!
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#3730A3" />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Passenger Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Train Summary Header Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardTop}>
            <Ionicons name="train" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
            <Text style={styles.trainTitle}>{schedule.train_name}</Text>
            <View style={styles.badgeNumber}>
              <Text style={styles.badgeNumberText}>#{schedule.train_number}</Text>
            </View>
          </View>

          <View style={styles.summaryRouteRow}>
            <View>
              <Text style={styles.timeText}>{formatTime(schedule.departure_time)}</Text>
              <Text style={styles.stationText}>{schedule.from_station}</Text>
            </View>
            <View style={styles.durationCol}>
              <Text style={styles.durationText}>
                {calculateDuration(schedule.departure_time, schedule.arrival_time)}
              </Text>
              <Ionicons name="swap-horizontal" size={18} color="#818CF8" />
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.timeText}>{formatTime(schedule.arrival_time)}</Text>
              <Text style={styles.stationText}>{schedule.to_station}</Text>
            </View>
          </View>
        </View>

        {/* Passenger List Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Passengers ({passengerCount}/6)</Text>
          {fields.length < 6 && (
            <TouchableOpacity onPress={handleAddPassenger} style={styles.addBtn} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={20} color="#4F46E5" />
              <Text style={styles.addBtnText}>Add Passenger</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dynamic Passenger Forms */}
        {fields.map((field, index) => (
          <PassengerForm
            key={field.id}
            index={index}
            control={control}
            errors={errors}
            onRemove={() => handleRemovePassenger(index)}
            canRemove={fields.length > 1}
          />
        ))}

        {/* Payment Mode Selector */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Select Payment Mode</Text>

          <View style={styles.paymentOptionsRow}>
            {paymentOptions.map((opt) => {
              const isSelected = selectedPaymentMode === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.paymentOptionCard, isSelected && styles.paymentOptionSelected]}
                  onPress={() => setValue('mode', opt.value, { shouldValidate: true })}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={opt.icon}
                    size={22}
                    color={isSelected ? '#4F46E5' : '#64748B'}
                    style={{ marginBottom: 6 }}
                  />
                  <Text style={[styles.paymentOptionText, isSelected && styles.paymentOptionTextSelected]}>
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#4F46E5"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.mode && <Text style={styles.errorText}>{errors.mode.message}</Text>}
        </View>

        {/* Price Breakdown Card */}
        <View style={styles.fareBreakdownCard}>
          <Text style={styles.fareBreakdownTitle}>Fare Breakdown</Text>
          <View style={styles.fareRow}>
            <Text style={styles.fareRowLabel}>
              Ticket Fare ({formatCurrency(schedule.fare)} × {passengerCount})
            </Text>
            <Text style={styles.fareRowValue}>{formatCurrency(totalFare)}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareRowLabel}>Reservation / Processing Fee</Text>
            <Text style={[styles.fareRowValue, { color: '#16A34A' }]}>FREE</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalFareRow}>
            <Text style={styles.totalFareLabel}>Total Amount Payable</Text>
            <Text style={styles.totalFareValue}>{formatCurrency(totalFare)}</Text>
          </View>
        </View>

        {/* Submit Booking Button */}
        <TouchableOpacity
          style={[styles.payButton, isPending && styles.payButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          activeOpacity={0.85}
        >
          {isPending ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
              <Text style={styles.payButtonText}>Processing Booking...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.payButtonText}>Pay {formatCurrency(totalFare)} & Book</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    paddingBottom: 36,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  badgeNumber: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  summaryRouteRow: {
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
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
    marginLeft: 4,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  paymentOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentOptionCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  paymentOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  paymentOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  paymentOptionTextSelected: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  checkIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  fareBreakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fareBreakdownTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fareRowLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  fareRowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  totalFareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalFareLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalFareValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4F46E5',
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: '#818CF8',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
});
