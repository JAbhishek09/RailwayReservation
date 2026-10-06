import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Station } from '../types/station';
import { useStations } from '../hooks/useStations';

interface StationSelectorProps {
  label: string;
  value: string; // Station code
  onSelectStation: (station: Station) => void;
  placeholder?: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  label,
  value,
  onSelectStation,
  placeholder = 'Select Station',
  error,
  iconName = 'location-outline',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: stations, isLoading, isError, refetch } = useStations();

  const selectedStation = stations?.find((s) => s.code === value);

  const filteredStations = (stations || []).filter((station) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      station.name.toLowerCase().includes(q) ||
      station.code.toLowerCase().includes(q) ||
      station.city.toLowerCase().includes(q)
    );
  });

  const handleSelect = (station: Station) => {
    onSelectStation(station);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectorButton, Boolean(error) && styles.errorBorder]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorLeft}>
          <Ionicons name={iconName} size={20} color="#4F46E5" style={styles.inputIcon} />
          {selectedStation ? (
            <View style={styles.selectedContainer}>
              <Text style={styles.stationNameText}>{selectedStation.name}</Text>
              <Text style={styles.stationSubText}>
                {selectedStation.city} • <Text style={styles.codeText}>{selectedStation.code}</Text>
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          )}
        </View>
        <Ionicons name="chevron-down-outline" size={18} color="#64748B" />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by city, station name, or code..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          {/* List of Stations */}
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading stations...</Text>
            </View>
          ) : isError ? (
            <View style={styles.centerContainer}>
              <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
              <Text style={styles.errorTextModal}>Failed to fetch stations</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredStations}
              keyExtractor={(item) => String(item.station_id)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = item.code === value;
                return (
                  <TouchableOpacity
                    style={[styles.stationCard, isSelected && styles.selectedCard]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.stationCardLeft}>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeBadgeText}>{item.code}</Text>
                      </View>
                      <View style={styles.stationCardTextInfo}>
                        <Text style={styles.stationItemName}>{item.name}</Text>
                        <Text style={styles.stationItemCity}>{item.city}</Text>
                      </View>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.centerContainer}>
                  <Ionicons name="location-outline" size={40} color="#94A3B8" />
                  <Text style={styles.emptyTextModal}>No matching stations found</Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
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
    paddingVertical: 12,
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
  inputIcon: {
    marginRight: 10,
  },
  selectedContainer: {
    flex: 1,
  },
  stationNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  stationSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  codeText: {
    fontWeight: '700',
    color: '#4F46E5',
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
  closeButton: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
  },
  stationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCard: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  stationCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  codeBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  codeBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  stationCardTextInfo: {
    flex: 1,
  },
  stationItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  stationItemCity: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorTextModal: {
    marginTop: 8,
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600',
  },
  emptyTextModal: {
    marginTop: 8,
    fontSize: 15,
    color: '#64748B',
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

