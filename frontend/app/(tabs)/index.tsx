import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import CalendarEvents from '@/components/CalendarEvents';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CalendarEvents />
    </SafeAreaView>
  );
}

