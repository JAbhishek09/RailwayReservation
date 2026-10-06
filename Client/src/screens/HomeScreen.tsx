import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StationSelector } from '../components/StationSelector';
import { DateSelector } from '../components/DateSelector';
import { toYYYYMMDD } from '../utils/date';
import { RootStackParamList } from '../navigation/AppNavigator';
import { TabParamList } from '../navigation/TabNavigator';

// Zod Validation Schema for Home Search
const searchSchema = z
  .object({
    from: z.string().min(1, { message: 'Origin station is required' }),
    to: z.string().min(1, { message: 'Destination station is required' }),
    date: z.string().min(1, { message: 'Travel date is required' }),
  })
  .refine((data) => data.from !== data.to, {
    message: 'Origin and destination stations cannot be the same',
    path: ['to'],
  });

type SearchFormData = z.infer<typeof searchSchema>;

export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const defaultDate = toYYYYMMDD(new Date());

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      from: 'INDB',
      to: 'NDLS',
      date: defaultDate,
    },
  });

  const handleSwapStations = () => {
    const currentFrom = getValues('from');
    const currentTo = getValues('to');
    setValue('from', currentTo, { shouldValidate: true });
    setValue('to', currentFrom, { shouldValidate: true });
  };

  const onSubmit = (data: SearchFormData) => {
    navigation.navigate('SearchResults', {
      from: data.from,
      to: data.to,
      date: data.date,
    });
  };

  const setPopularRoute = (fromCode: string, toCode: string) => {
    setValue('from', fromCode, { shouldValidate: true });
    setValue('to', toCode, { shouldValidate: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#3730A3" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="train" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Railway Express</Text>
              <Text style={styles.heroSubtitle}>Fast, seamless & instant train bookings</Text>
            </View>
          </View>
        </View>

        {/* Search Card Container */}
        <View style={styles.searchCard}>
          <Text style={styles.cardHeaderTitle}>Book Train Tickets</Text>

          {/* Origin Station */}
          <Controller
            control={control}
            name="from"
            render={({ field: { onChange, value } }) => (
              <StationSelector
                label="From Station"
                value={value}
                onSelectStation={(st) => onChange(st.code)}
                placeholder="Select Origin Station"
                error={errors.from?.message}
                iconName="location-outline"
              />
            )}
          />

          {/* Swap Button */}
          <View style={styles.swapContainer}>
            <View style={styles.swapLine} />
            <TouchableOpacity
              style={styles.swapBtn}
              onPress={handleSwapStations}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-vertical" size={20} color="#4F46E5" />
            </TouchableOpacity>
            <View style={styles.swapLine} />
          </View>

          {/* Destination Station */}
          <Controller
            control={control}
            name="to"
            render={({ field: { onChange, value } }) => (
              <StationSelector
                label="To Station"
                value={value}
                onSelectStation={(st) => onChange(st.code)}
                placeholder="Select Destination Station"
                error={errors.to?.message}
                iconName="navigate-outline"
              />
            )}
          />

          {/* Date Selector */}
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <DateSelector
                label="Journey Date"
                value={value}
                onChangeDate={onChange}
                error={errors.date?.message}
              />
            )}
          />

          {/* Search Button */}
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.85}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.searchBtnText}>Search Trains</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Routes Section */}
        <View style={styles.popularSection}>
          <Text style={styles.sectionTitle}>Popular Routes</Text>

          <TouchableOpacity
            style={styles.routeChipCard}
            onPress={() => setPopularRoute('INDB', 'NDLS')}
            activeOpacity={0.7}
          >
            <View style={styles.routeChipLeft}>
              <Ionicons name="location" size={18} color="#4F46E5" />
              <Text style={styles.routeChipText}>Indore (INDB) → New Delhi (NDLS)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.routeChipCard}
            onPress={() => setPopularRoute('INDB', 'BPL')}
            activeOpacity={0.7}
          >
            <View style={styles.routeChipLeft}>
              <Ionicons name="location" size={18} color="#4F46E5" />
              <Text style={styles.routeChipText}>Indore (INDB) → Bhopal (BPL)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.routeChipCard}
            onPress={() => setPopularRoute('BPL', 'NDLS')}
            activeOpacity={0.7}
          >
            <View style={styles.routeChipLeft}>
              <Ionicons name="location" size={18} color="#4F46E5" />
              <Text style={styles.routeChipText}>Bhopal (BPL) → New Delhi (NDLS)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Lab System Info Note */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#4338CA" style={{ marginRight: 8 }} />
          <Text style={styles.infoBannerText}>
            DBMS Lab Demo System: Connects to Express API & MySQL. Automatic waitlist & seat allocation enabled.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3730A3',
  },
  scrollContent: {
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
    paddingBottom: 32,
  },
  heroBanner: {
    backgroundColor: '#3730A3',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#C7D2FE',
    marginTop: 2,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -32,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  swapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -4,
    zIndex: 10,
  },
  swapLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  swapBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  searchBtn: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  popularSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  routeChipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  routeChipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 10,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#3730A3',
    lineHeight: 18,
    fontWeight: '500',
  },
});
