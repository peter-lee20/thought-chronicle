import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Text, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TextInput, Image, Modal } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../FirebaseConfig';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EntryPage() {
  const [showDropdown, setShowDropdown] = useState(false); // State for profile dropdown visibility
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected date
  const [journalEntries, setJournalEntries] = useState({}); // State for journal entries
  const [dailyResponses, setDailyResponses] = useState({}); // State for daily question responses
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false); // State for date picker visibility
  const [currentPickerType, setCurrentPickerType] = useState(''); // State to track which picker is open (month, day, year)

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      Alert.alert('Signed out successfully!');
      router.replace("/(setup)");
    } catch (error) {
      console.error(error);
      Alert.alert('Failed to sign out. Please try again.');
    }
  };
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
    setIsDatePickerVisible(false); // Close the picker after selection
  };

  const openDatePicker = (type: string) => {
    setCurrentPickerType(type);
    setIsDatePickerVisible(true);
  };
  // const handleDateChange = (type, value) => {
  //   const newDate = new Date(selectedDate);
  //   if (type === 'month') newDate.setMonth(value - 1);
  //   if (type === 'day') newDate.setDate(value);
  //   if (type === 'year') newDate.setFullYear(value);
  //   setSelectedDate(newDate);
  // };

  // const handleJournalEntryChange = (date, text) => {
  //   setJournalEntries((prev) => ({
  //     ...prev,
  //     [date.toDateString()]: text,
  //   }));
  // };

  // const handleDailyResponseChange = (date, text) => {
  //   setDailyResponses((prev) => ({
  //     ...prev,
  //     [date.toDateString()]: text,
  //   }));
  // };

  const getPreviousDates = (numDays = 7) => {
    const dates = [];
    for (let i = 0; i < numDays; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() - i);
      dates.push(date);
    }
    return dates; // Show dates in ascending order
  };

  

  const renderDateDropdowns = () => {
    return (
      <View style={styles.dateDropdownContainer}>
        {/* Month Dropdown */}
        <TouchableOpacity style={styles.dropdownButton} onPress={() => openDatePicker('month')}>
          <Text style = {styles.pickerText}>{selectedDate.toLocaleString('default', { month: 'long' })}</Text>
        </TouchableOpacity>

        {/* Day Dropdown */}
        <TouchableOpacity style={styles.dropdownButton} onPress={() => openDatePicker('day')}>
          <Text style = {styles.pickerText}>{selectedDate.getDate()}</Text>
        </TouchableOpacity>

        {/* Year Dropdown */}
        <TouchableOpacity style={styles.dropdownButton} onPress={() => openDatePicker('year')}>
          <Text style = {styles.pickerText}>{selectedDate.getFullYear()}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDateContent = () => {
    const dates = getPreviousDates(7); // Show the last 7 days

    return dates.map((date) => (
      <View key={date.toDateString()} style={styles.dateContainer}>
        <Text style={styles.dateText}>
        <Text style={styles.boldDateText}>
          {date.toLocaleDateString('en-US', { weekday: 'long' })}
        </Text>
        {`, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
      </Text>


        {/* Journal Entry Field */}
        <TextInput
          style={styles.textInput}
          placeholder="Write your journal entry here..."
          // value={journalEntries[date.toDateString()] || ''}
          value={''}
          // onChangeText={(text) => handleJournalEntryChange(date, text)}
          multiline
        />

        {/* Daily Question Response Field */}
        <TextInput
          style={styles.textInput}
          placeholder="Answer the daily question here..."
          // value={dailyResponses[date.toDateString()] || ''}
          value={''}
          // onChangeText={(text) => handleDailyResponseChange(date, text)}
          multiline
        />
      </View>
    ));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <TouchableOpacity onPress={toggleDropdown}>
                <Image
                  source={require('../../../assets/images/profile.png')}
                  style={styles.image}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {showDropdown && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity style={styles.dropdownItem} onPress={handleSignOut}>
                    <Text style={styles.dropdownText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Date Dropdowns */}
          {renderDateDropdowns()}

          {/* Date Picker */}
          {isDatePickerVisible && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              textColor='black'
            />
          )}

          {/* Scrollable Content */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Date Content */}
            {renderDateContent()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity>
              <Image source={require('../../../assets/images/today.png')} style={styles.footerImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../../assets/images/entries.png')} style={styles.footerImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../../assets/images/circle.png')} style={styles.footerImage} resizeMode="contain" />
              <Text style={styles.plusSign}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../../assets/images/feed.png')} style={styles.footerImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../../assets/images/friends.png')} style={styles.footerImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0ECE0',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'flex-end',
    padding: 20,
  },
  dateDropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F0ECE0',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    
    
  },
  dropdownButton: {
    padding: 15,
    backgroundColor: "#706645",
    borderRadius: 5,
  },
  dateContainer: {
    marginBottom: 20,
    
  },
  dateText: {
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 10,
    color: "#706645",
    fontFamily: "Poppins",
  },
  boldDateText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: "#706645",
    fontFamily: "Poppins",
  },
  textInput: {
    borderRadius: 10,
    padding: 10,
    height: 100,
    marginBottom: 10,
    backgroundColor: '#70664533',
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#F0ECE0',
    borderTopWidth: 1,
    borderTopColor: '#70664533',
  },
  footerImage: {
    width: 50,
    height: 50,
  },
  image: {
    width: 40,
    height: 40,
  },
  plusSign: {
    marginLeft: 15.5,
    marginTop: 4,
    position: 'absolute',
    fontSize: 30,
    color: 'white',
    fontWeight: '400',
  },
  pickerText: {
    color: '#FFF',
    fontWeight: '600',
    fontFamily: "Poppins",
    fontSize: 16,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 100,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dropdownText: {
    color: '#706645',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});