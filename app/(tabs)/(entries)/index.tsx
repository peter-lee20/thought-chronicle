import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Text, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TextInput, Image, Modal, ActivityIndicator } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../FirebaseConfig';
import { signOut, getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { format, subDays } from "date-fns"; // Ensure you have date-fns installed

import DateTimePicker from '@react-native-community/datetimepicker';


interface JournalEntry {
  [key: string]: string; // The key is a date (YYYY-MM-DD), and the value is the journal entry text
}

interface DailyResponse {
  [key: string]: string; // The key is a date (YYYY-MM-DD), and the value is the daily response text
}

export default function EntryPage() {
  const [showDropdown, setShowDropdown] = useState(false); // State for profile dropdown visibility
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected date
  const [journalEntries, setJournalEntries] = useState<JournalEntry>({});
  const [dailyResponses, setDailyResponses] = useState<DailyResponse>({});
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false); // State for date picker visibility
  const [currentPickerType, setCurrentPickerType] = useState(''); // State to track which picker is open (month, day, year)
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

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

  const getPreviousDates = (numDays = 7) => {
    return Array.from({ length: numDays }, (_, i) => {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() - i);
      return date;
    });
  };

  const fetchResponses = async () => {
    if (!currentUser?.uid) {
      console.error("User not logged in!");
      return;
    }

    setLoading(true); // Start loading
  
    // Generate an array of the last 7 days
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() - i);
      return date;
    });
  
    // Create an object to store responses for each date
    const responses: DailyResponse = {};
  
    try {
      // Loop through each of the last 7 days
      for (const date of past7Days) {
        // Format the date for Firestore query (e.g., "M/D/YYYY")
        const firestoreDate = date.toLocaleDateString();
        console.log("Querying Firestore for date:", firestoreDate);
  
        // Query Firestore for responses on this date
        const q = query(
          collection(FIRESTORE_DB, "daily-question-responses"),
          where("date", "==", firestoreDate),
          where("userId", "==", currentUser.uid)
        );
  
        const querySnapshot = await getDocs(q);
  
        // Format the date for state storage (e.g., "YYYY-MM-DD")
        const stateDateKey = format(date, "yyyy-MM-dd");
  
        if (querySnapshot.empty) {
          console.log("No data found for", firestoreDate);
          responses[stateDateKey] = ""; // Store empty response if none found
        } else {
          querySnapshot.forEach((doc) => {
            const docData = doc.data();
            const response = docData?.response || "";
            responses[stateDateKey] = response; // Store response for this date
          });
        }
      }
  
      // Update the state with all fetched responses
      setDailyResponses(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchResponses();
  }, [selectedDate]);

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

  // Function to display past responses

  const renderDateContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#706645" />
        </View>
      );
    }
  
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        nestedScrollEnabled={true} // Enable nested scrolling for Android
        keyboardShouldPersistTaps="handled" // Allow tapping to dismiss the keyboard
        showsVerticalScrollIndicator={true} // Always show the scroll indicator
        indicatorStyle="black" // For iOS: dark scrollbar
        scrollIndicatorInsets={{ right: 1 }} // Adjust scrollbar insets for better positioning
      >
        {getPreviousDates(7).map((date, index) => {
          const formattedDate = format(date, "yyyy-MM-dd");
          return (
            <View key={index} style={styles.dateEntryContainer}>
              <Text style={styles.dateText}>
                {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
              <View style={styles.entryContainer}>
                <Text style={styles.entryLabel}>DAILY QUESTION</Text>
                {dailyResponses[formattedDate] ? (
                  <Text style={styles.entryText}>{dailyResponses[formattedDate]}</Text>
                ) : (
                  <Text style={styles.noDataText}>No response available.</Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };
  

  // const renderDateContent = () => {
  //   if (loading) {
  //     return (
  //       <View style={styles.loadingContainer}>
  //         <ActivityIndicator size="large" color="#706645" />
  //       </View>
  //     );
  //   }
  
  //   return (
  //     <ScrollView
  //       contentContainerStyle={styles.scrollContent}
  //       style={styles.scrollView}
  //     >
  //       {getPreviousDates(7).map((date, index) => {
  //         const formattedDate = format(date, "yyyy-MM-dd");
  //         return (
  //           <View key={index} style={styles.dateEntryContainer}>
  //             <Text style={styles.dateText}>
  //               {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
  //             </Text>
  //             <View style={styles.entryContainer}>
  //               <Text style={styles.entryLabel}>DAILY QUESTION</Text>
  //               {dailyResponses[formattedDate] ? (
  //                 <Text style={styles.entryText}>{dailyResponses[formattedDate]}</Text>
  //               ) : (
  //                 <Text style={styles.noDataText}>No response available.</Text>
  //               )}
  //             </View>
  //           </View>
  //         );
  //       })}
  //     </ScrollView>
  //   );
  // };
  
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
          
          <View style={{ flex: 1 }}>
            <ScrollView>
              {renderDateContent()}
            </ScrollView>
          </View>

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
    paddingBottom: 100,
  },
  scrollContainer: {
    flex: 1, // Ensure the container takes up available space
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
  dateEntryContainer: {
    marginBottom: 20, // Add space between date entries
  },
  dateText: {
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 10,
    color: "#706645",
    fontFamily: "Poppins",
  },
  entryContainer: { 
    backgroundColor: '#EDE3C5', 
    padding: 10, 
    borderRadius: 10, 
    marginBottom: 10
  },
  entryLabel: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: "#4F4A36" 
  },
  entryText: { 
    fontSize: 16, 
    color: "#4F4A36" 
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
  scrollView: {
    flex: 1, // Ensure the ScrollView takes up available space
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
  responseContainer: { marginBottom: 20 },
  noDataText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#888",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});