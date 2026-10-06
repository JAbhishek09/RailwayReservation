import React from 'react';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator, TabParamList } from './TabNavigator';
import { SearchResultsScreen } from '../screens/SearchResultsScreen';
import { PassengerBookingScreen } from '../screens/PassengerBookingScreen';
import { BookingConfirmationScreen } from '../screens/BookingConfirmationScreen';
import { TicketDetailsScreen } from '../screens/TicketDetailsScreen';
import { Schedule } from '../types/schedule';
import { Booking } from '../types/booking';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  SearchResults: {
    from: string;
    to: string;
    date: string;
  };
  PassengerBooking: {
    schedule: Schedule;
  };
  BookingConfirmation: {
    booking: Booking;
  };
  TicketDetails: {
    bookingId: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
        <Stack.Screen name="PassengerBooking" component={PassengerBookingScreen} />
        <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
        <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

