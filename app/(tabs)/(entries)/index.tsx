import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Text, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TextInput, Image, Modal } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../FirebaseConfig';
import { signOut, getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { format } from "date-fns"; // Ensure you have date-fns installed

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
    return Array.from({ length: numDays }, (_, i) => {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() - i);
      return date;
    });
  };

  // // Function to fetch responses from Firestore
  // const fetchEntries = async () => {
  //   const dateKey = selectedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
  //   try {
  //     const docRef = doc(FIRESTORE_DB, 'journalEntries', dateKey);
  //     const docSnap = await getDoc(docRef);
  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       setJournalEntries(data.journal || {}); 
  //       setDailyResponses(data.responses || {}); 
  //     } else {
  //       setJournalEntries({});
  //       setDailyResponses({});
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };



  // // Fetch responses whenever the selected date changes
  // useEffect(() => {
  //   fetchEntries();
  // }, [selectedDate]);

  // const fetchResponses = async () => {
  //   // const dateKey = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  //   const dateKey = new Date(selectedDate).toLocaleDateString("en-US"); 
  //   console.log("Selected Date:", selectedDate);
  //   console.log("Formatted Date:", new Date(selectedDate).toLocaleDateString("en-US"));

  //   try {
  //     // Fetch from `daily-question-responses` collection
  //     const docRef = doc(FIRESTORE_DB, 'daily-question-responses', dateKey);
  //     const docSnap = await getDoc(docRef);

  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       console.log("Fetched data:", data); // Debugging log
  //       setDailyResponses({ [dateKey]: data.response || "" }); // Ensure that responses exist
  //     } else {
  //       console.log("No data found for date:", dateKey); // Debugging log
  //       setDailyResponses({});
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // const fetchResponses = async () => {
  //   const dateKey = new Date(selectedDate).toLocaleDateString("en-US");
  //   console.log("Querying Firestore with date:", dateKey);
  
  //   const docRef = doc(FIRESTORE_DB, 'daily-question-responses', dateKey);
  //   const docSnap = await getDoc(docRef);
  
  //   if (docSnap.exists()) {
  //     console.log("Data found:", docSnap.data());
  //   } else {
  //     console.log("No data found for date:", dateKey);
  //     console.log("Available documents in collection:");
      
  //     const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'daily-question-responses'));
  //     querySnapshot.forEach(doc => {
  //       console.log("Document ID:", doc.id);
  //     });
  //   }
  // };

  // const fetchResponses = async () => {
  //   const formattedDate = new Date(selectedDate).toLocaleDateString("en-US");
  //   console.log("Querying Firestore with date:", formattedDate);
  
  //   const q = query(
  //     collection(FIRESTORE_DB, "daily-question-responses"),
  //     where("date", "==", formattedDate) // Adjust field name if needed
  //   );
  
  //   const querySnapshot = await getDocs(q);
  
  //   if (!querySnapshot.empty) {
  //     querySnapshot.forEach(doc => {
  //       console.log("Data found:", doc.id, doc.data());
  //     });
  //   } else {
  //     console.log("No data found for date:", formattedDate);
  //   }
  // };

  // const fetchResponses = async () => {
  //   if (!currentUser?.uid) {
  //     console.error("User not logged in!");
  //     return;
  //   }
  
  //   const formattedDate = selectedDate.toLocaleDateString(); // Matches Firestore format: "M/D/YYYY"
  //   console.log("Querying Firestore with date:", formattedDate);
  
  //   const q = query(
  //     collection(FIRESTORE_DB, "daily-question-responses"),
  //     where("date", "==", formattedDate),  // Ensure same format
  //     where("userId", "==", currentUser.uid)  // Only fetch current user's response
  //   );
  
  //   try {
  //     const querySnapshot = await getDocs(q);
  
  //     if (querySnapshot.empty) {
  //       console.log("No data found for", formattedDate);
  //       setDailyResponses(prev => ({
  //         ...prev,
  //         [formattedDate]: "",
  //       }));
  //     } else {
  //       querySnapshot.forEach(doc => {
  //         console.log("Found document:", doc.id, doc.data());
  //         setDailyResponses(prev => ({
  //           ...prev,
  //           [formattedDate]: doc.data().response || "",
  //         }));
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching responses:", error);
  //   }
  // };

  // const fetchResponses = async () => {
  //   if (!currentUser?.uid) {
  //     console.error("User not logged in!");
  //     return;
  //   }
  
  //   const formattedDate = selectedDate.toLocaleDateString(); // Matches Firestore format: "M/D/YYYY"
  //   console.log("Querying Firestore with date:", formattedDate);
  // // const formattedDate = format(selectedDate, "yyyy-MM-dd");
  // // console.log("Querying Firestore with date:", formattedDate);
  
  //   // Query Firestore to find documents where the 'date' field matches the selected date
  //   // and the 'userId' matches the current user
  //   const q = query(
  //     collection(FIRESTORE_DB, "daily-question-responses"),
  //     where("date", "==", formattedDate),  // Ensure same format
  //     where("userId", "==", currentUser.uid)  // Only fetch current user's response
  //   );
  
  //   try {
  //     const querySnapshot = await getDocs(q);
  
  //     if (querySnapshot.empty) {
  //       console.log("No data found for", formattedDate);
  //       setDailyResponses(prev => ({
  //         ...prev,
  //         [format(selectedDate, "yyyy-MM-dd")]: "",  // If no response found, set it as an empty string
  //       }));
  //     } else {
  //       // Loop through the querySnapshot to handle multiple documents (if any)
  //       querySnapshot.forEach(doc => {
  //         const docData = doc.data();
  //         const response = docData?.response || ""; // Strip the response value, defaulting to empty string
  //         console.log(response)
  //         console.log(formattedDate)
  
  //         console.log("Found document:", doc.id, docData);
  //         setDailyResponses(prev => ({
  //           ...prev,
  //           [format(selectedDate, "yyyy-MM-dd")]: response,  // Update the dailyResponses state with the fetched response
  //         }));
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching responses:", error);
  //   }
  // };

const fetchResponses = async () => {
  if (!currentUser?.uid) {
    console.error("User not logged in!");
    return;
  }

  // Firestore expects "M/D/YYYY"
  const firestoreDate = selectedDate.toLocaleDateString(); 
  console.log("Querying Firestore with date:", firestoreDate);

  // Format for state storage as "YYYY-MM-DD"
  const stateDateKey = format(selectedDate, "yyyy-MM-dd");

  const q = query(
    collection(FIRESTORE_DB, "daily-question-responses"),
    where("date", "==", firestoreDate),
    where("userId", "==", currentUser.uid)
  );

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No data found for", firestoreDate);
      setDailyResponses(prev => ({
        ...prev,
        [stateDateKey]: "", // Store empty response if none found
      }));
    } else {
      querySnapshot.forEach(doc => {
        const docData = doc.data();
        const response = docData?.response || "";

        console.log("Found document:", doc.id, docData);
        setDailyResponses(prev => ({
          ...prev,
          [stateDateKey]: response, // Store response using "YYYY-MM-DD" key
        }));
      });
    }
  } catch (error) {
    console.error("Error fetching responses:", error);
  }
};

  
  

  // const fetchResponses = async () => {
  //   const formattedDate = new Date(selectedDate).toISOString().split('T')[0]; // Ensure YYYY-MM-DD format
  //   console.log("Querying Firestore with date:", formattedDate);
  
  //   const q = query(
  //     collection(FIRESTORE_DB, "daily-question-responses"),
  //     where("date", "==", formattedDate) // Ensure this matches Firestore field type
  //   );
  
  //   try {
  //     const querySnapshot = await getDocs(q);
  
  //     if (querySnapshot.empty) {
  //       console.log("No data found for", formattedDate);
  //       setDailyResponses(prev => ({
  //         ...prev,
  //         [formattedDate]: "",
  //       }));
  //     } else {
  //       querySnapshot.forEach(doc => {
  //         console.log("Found document:", doc.id, doc.data());
  //         setDailyResponses(prev => ({
  //           ...prev,
  //           [formattedDate]: doc.data().response || "",
  //         }));
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching responses:", error);
  //   }
  // };
  
  
  

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
    // Ensure we use the same "YYYY-MM-DD" format to retrieve from state
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
    return (
      <View style={styles.responseContainer}>
        <Text style={styles.dateText}>
          {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
  
        {dailyResponses[formattedDate] ? (
          <View style={styles.entryContainer}>
            <Text style={styles.entryLabel}>Daily Response:</Text>
            <Text style={styles.entryText}>{dailyResponses[formattedDate]}</Text>
          </View>
        ) : (
          <Text style={styles.noDataText}>No response available for this date.</Text>
        )}
      </View>
    );
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
});