import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../config/api';

export default function CallScreen() {
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savedCountryCode, setSavedCountryCode] = useState('');
  const [savedNumber, setSavedNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  
  const countryCodeRef = useRef<TextInput>(null);
  const phoneNumberRef = useRef<TextInput>(null);

  // Load saved phone number on component mount
  useEffect(() => {
    loadSavedPhoneNumber();
  }, []);

  const loadSavedPhoneNumber = async () => {
    try {
      const savedCode = await AsyncStorage.getItem('userCountryCode');
      const savedNumber = await AsyncStorage.getItem('userPhoneNumber');
      
      if (savedCode) {
        setSavedCountryCode(savedCode);
        setCountryCode(savedCode);
      }
      
      if (savedNumber) {
        setSavedNumber(savedNumber);
        setPhoneNumber(savedNumber);
      }
    } catch (error) {
      console.error('Error loading phone number:', error);
    }
  };

  const savePhoneNumber = async () => {
    // Validation
    if (!countryCode.trim()) {
      Alert.alert('Error', 'Please enter a country code');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    // Country code validation (should start with + and be 1-4 digits)
    const countryCodeRegex = /^\+[1-9]\d{0,3}$/;
    if (!countryCodeRegex.test(countryCode.trim())) {
      Alert.alert('Error', 'Please enter a valid country code (e.g., +1, +44, +91)');
      return;
    }

    // Phone number validation (should be 7-15 digits)
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      Alert.alert('Error', 'Please enter a valid phone number (7-15 digits)');
      return;
    }

    try {
      await AsyncStorage.setItem('userCountryCode', countryCode.trim());
      await AsyncStorage.setItem('userPhoneNumber', phoneNumber.trim());
      setSavedCountryCode(countryCode.trim());
      setSavedNumber(phoneNumber.trim());
      
      // Dismiss keyboard and blur inputs
      Keyboard.dismiss();
      countryCodeRef.current?.blur();
      phoneNumberRef.current?.blur();
      
      Alert.alert('Success', 'Phone number saved successfully!');
    } catch (error) {
      console.error('Error saving phone number:', error);
      Alert.alert('Error', 'Failed to save phone number');
    }
  };

  const clearPhoneNumber = async () => {
    try {
      await AsyncStorage.removeItem('userCountryCode');
      await AsyncStorage.removeItem('userPhoneNumber');
      setSavedCountryCode('');
      setSavedNumber('');
      setCountryCode('');
      setPhoneNumber('');
      
      // Dismiss keyboard and blur inputs
      Keyboard.dismiss();
      countryCodeRef.current?.blur();
      phoneNumberRef.current?.blur();
      
      Alert.alert('Success', 'Phone number cleared');
    } catch (error) {
      console.error('Error clearing phone number:', error);
      Alert.alert('Error', 'Failed to clear phone number');
    }
  };

  const triggerCall = async () => {
    if (!savedCountryCode || !savedNumber) {
      Alert.alert('Error', 'Please save a phone number first');
      return;
    }

    setIsCalling(true);
    
    try {
      // Get tomorrow's events from local storage
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowKey = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      let tomorrowEvents = [];
      try {
        const storedEvents = await AsyncStorage.getItem(`calendar_events_${tomorrowKey}`);
        if (storedEvents) {
          tomorrowEvents = JSON.parse(storedEvents);
        }
      } catch (error) {
        console.log('No events found for tomorrow:', error);
      }

      const response = await fetch(getApiUrl.calls.trigger(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryCode: savedCountryCode,
          phoneNumber: savedNumber,
          conversation_initiation_client_data: {
            dynamic_variables: {
              date: tomorrowKey,
              events: tomorrowEvents,
              message: `Here are my events for tomorrow (${tomorrowKey}): ${
                tomorrowEvents.length > 0
                  ? tomorrowEvents.map((e: any) => `${e.summary} at ${e.start?.dateTime || e.start?.date}`).join(', ')
                  : 'No events scheduled'
              }`
            }
          }
        }),
      });
      

      const result = await response.json();

      if (result.success) {
        const eventCount = result.conversationData?.eventCount || tomorrowEvents.length;
        const message = eventCount > 0 
          ? `Call triggered to ${savedCountryCode} ${savedNumber}\n\nAI will be informed about your ${eventCount} event${eventCount > 1 ? 's' : ''} for tomorrow.`
          : `Call triggered to ${savedCountryCode} ${savedNumber}\n\nAI will be informed that you have no events scheduled for tomorrow.`;
        
        Alert.alert('Success', message);
      } else {
        Alert.alert('Error', result.error || 'Failed to trigger call');
      }
    } catch (error) {
      console.error('Error triggering call:', error);
      Alert.alert('Error', 'Failed to trigger call. Please check your connection.');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 px-5 py-6">
         <Text className="text-3xl font-bold text-gray-800 text-center mb-8">
           🧘‍♀️ AI Counselling Support
         </Text>
        
        {/* Phone Number Form */}
        <View className="bg-white rounded-lg p-6 shadow-sm">
          <Text className="text-xl font-semibold text-gray-800 mb-4">
            Save Your Phone Number
          </Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </Text>
            <View className="flex-row space-x-3">
              <View className="w-24">
                <TextInput
                  ref={countryCodeRef}
                  className="border border-gray-300 rounded-lg px-3 py-3 text-lg text-center"
                  placeholder="+1"
                  value={countryCode}
                  onChangeText={setCountryCode}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  ref={phoneNumberRef}
                  className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-blue-500 rounded-lg py-3"
              onPress={savePhoneNumber}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Save Number
              </Text>
            </TouchableOpacity>
            
            {savedNumber && (
              <TouchableOpacity
                className="flex-1 bg-red-500 rounded-lg py-3"
                onPress={clearPhoneNumber}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Saved Number Display */}
        {(savedCountryCode || savedNumber) && (
          <View className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <Text className="text-green-800 font-medium mb-2">
              ✅ Saved Phone Number:
            </Text>
            <Text className="text-green-700 text-lg mb-4">
              {savedCountryCode} {savedNumber}
            </Text>
            
            {/* Trigger Call Button */}
            <TouchableOpacity
              className={`rounded-lg py-3 px-4 ${
                isCalling 
                  ? 'bg-gray-400' 
                  : 'bg-green-500'
              }`}
              onPress={triggerCall}
              disabled={isCalling}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {isCalling ? 'Calling...' : '📞 Trigger Call'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        <View className="mt-8">
          <Text className="text-gray-600 text-center text-sm leading-5">
            Enter your country code (e.g., +1 for US, +44 for UK) and phone number 
            to save it locally on your device. Once saved, you can trigger an AI call to this number.
          </Text>
        </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
