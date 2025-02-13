import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Text, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TextInput, Image, Modal, ActivityIndicator } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../FirebaseConfig';
import { signOut, getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { format } from "date-fns";
import { useLocalSearchParams } from 'expo-router';

import DateTimePicker from '@react-native-community/datetimepicker';

interface JournalEntry {
  id: string;
  response: string;
  timestamp: Date | null;
}

interface DailyResponse {
  response: string;
  timestamp: Date | null;
}

export default function EntryPage() {
  const { date } = useLocalSearchParams();
  const pstDateString = `${date}T00:00:00-08:00`; 

  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(pstDateString));
  const [dailyResponse, setDailyResponse] = useState<DailyResponse | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [currentPickerType, setCurrentPickerType] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const goToJournal = () => {
    router.replace("/(add-journal)/");
  }

  const goHome = () => {
    router.replace("/(tabs)/(home)/homepage");
  }

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
    setIsDatePickerVisible(false);
  };

  // const openDatePicker = (type: string) => {
  //   setCurrentPickerType(type);
  //   setIsDatePickerVisible(true);
  // };

  const formatDateForFirestore = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  const formatDateForState = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  const fetchResponses = async () => {
    if (!currentUser?.uid) {
      console.error("User not logged in!");
      return;
    }

    setLoading(true);
    const firestoreDate = formatDateForFirestore(selectedDate);

    try {
      // Fetch Daily Question Response
      const dailyQuestionQuery = query(
        collection(FIRESTORE_DB, "daily-question-responses"),
        where("date", "==", firestoreDate),
        where("userId", "==", currentUser.uid)
      );

      const dailyQuestionSnapshot = await getDocs(dailyQuestionQuery);
      if (dailyQuestionSnapshot.docs.length > 0) {
        const doc = dailyQuestionSnapshot.docs[0]; // Assuming only one response per day
        const docData = doc.data();
        setDailyResponse({
          response: docData.response || "",
          timestamp: docData.timestamp ? docData.timestamp.toDate() : null,
        });
      } else {
        setDailyResponse(null);
      }

      // Fetch Journal Entries
      // Fetch Journal Entries
      const journalQuery = query(
        collection(FIRESTORE_DB, "journal-responses"),
        where("date", "==", firestoreDate),
        where("userId", "==", currentUser.uid)
      );

      const journalSnapshot = await getDocs(journalQuery);
      const journalEntriesData: JournalEntry[] = [];
      journalSnapshot.forEach((doc) => {
        const docData = doc.data();
        journalEntriesData.push({
            id: doc.id, // Add this line to store the document ID
            response: docData.response || "",
            timestamp: docData.timestamp ? docData.timestamp.toDate() : null,
        });
      });
      setJournalEntries(journalEntriesData);


    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [selectedDate]);

  // const renderDateDropdowns = () => {
  //   return (
  //     <View style={styles.dateDropdownContainer}>
  //       <TouchableOpacity style={styles.dropdownButton} onPress={() => openDatePicker('month')}>
  //         <Text style={styles.pickerText}>{selectedDate.toLocaleString('default', { month: 'long' })}</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.dropdownButton} onPress={() => openDatePicker('day')}>
  //         <Text style={styles.pickerText}>{selectedDate.getDate()}</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.dropdownButton} onPress={() => openDatePicker('year')}>
  //         <Text style={styles.pickerText}>{selectedDate.getFullYear()}</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };

  const formatTime = (timestamp: Date | null) => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderDateContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#706645" />
        </View>
      );
    }

    const hasContent = dailyResponse || journalEntries.length > 0;

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
        scrollIndicatorInsets={{ right: 1 }}
      >
        <Text style={styles.dateText}>
          <Text style={styles.boldDay}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })},
          </Text>{' '}
          {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>

        {hasContent ? (
          <>
            {/* Daily Question Response */}
            {dailyResponse && (
              <View style={styles.dateEntryContainer}>
                <TouchableOpacity 
                  style={styles.entryContainer}
                  onPress={() => {
                    // Handle press event
                    console.log("Daily Question Pressed!");
                  }}
                >
                  <Image
                    source={require('../../../assets/images/question_mark.png')}
                    style={styles.entryImage}
                    resizeMode='contain'
                  />
                  <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.entryLabel}>DAILY QUESTION</Text>
                      {dailyResponse.timestamp && (
                        <Text style={styles.timestampText}>
                          {formatTime(dailyResponse.timestamp)}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.entryText} numberOfLines={3} ellipsizeMode="tail">
                      {dailyResponse.response}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Journal Entries */}
            {journalEntries.map((entry, index) => (
              <View style={styles.dateEntryContainer} key={index}>
                <TouchableOpacity
                  style={styles.entryContainer}
                  onPress={() => {
                    router.push(`/(add-journal)/journal-entry/${entry.id}`); // Navigate to the new page
                    console.log("pressed journal entry")
                }}
                >
                  <Image
                    source={require('../../../assets/images/journal.png')}
                    style={styles.entryImage}
                    resizeMode='contain'
                  />
                  <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.entryLabel}>JOURNAL</Text>
                      {entry.timestamp && (
                        <Text style={styles.timestampText}>
                          {formatTime(entry.timestamp)}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.entryText} numberOfLines={3} ellipsizeMode="tail">
                      {entry.response}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.noContentContainer}>
            <Text style={styles.noContentText}>No responses or journal entries for this day.</Text>
          </View>
        )}
      </ScrollView>
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
          {/* {renderDateDropdowns()} */}

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
              <TouchableOpacity onPress={() => {router.replace('/(home)/homepage')}}>
                <Image source={require('../../../assets/images/today.png')} style={styles.footerImage}resizeMode="contain" />
              </TouchableOpacity>
                  
              <TouchableOpacity>
                <Image source={require('../../../assets/images/entries.png')} style={styles.footerImage} resizeMode="contain"/>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {router.replace('/(add-journal)/')}}>
                <Image source={require('../../../assets/images/circle.png')} style={styles.footerImage} resizeMode="contain"/>
                <Text style = {styles.plusSign}>+</Text>
              </TouchableOpacity>
                  
              <TouchableOpacity>
                <Image source={require('../../../assets/images/feed.png')} style={styles.footerImage} resizeMode="contain"/>
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
  header: {
    flexDirection: 'row',
    //marginBottom: 20,
    justifyContent: 'flex-end',
    padding: 20,
  },
  // dateDropdownContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   backgroundColor: '#F0ECE0',
  //   borderRadius: 10,
  //   marginHorizontal: 20,
  //   marginBottom: 10,


  // },
  // dropdownButton: {
  //   padding: 15,
  //   backgroundColor: "#706645",
  //   borderRadius: 5,
  // },
  // dateContainer: {
  //   marginBottom: 20,

  // },
  dateEntryContainer: {
    marginBottom: 10, // Add space between date entries
  },
  dateText: {
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 10,
    color: "#706645",
    fontFamily: "Poppins",
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
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FDFCF3',
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    minHeight: 130,
    overflow: 'hidden',
  },
  entryLabel: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '400',
    color: "#706645CC"
  },
  entryText: {
    marginTop: 10,
    fontSize: 12,
    color: "#706645CC",
    fontWeight: '600',
    marginRight: 25,
  },
  entryImage: {
    width: 30,
    height: 30,
    marginRight: 20,
    marginTop: 40, // Added to align with the text
    marginLeft: 10,
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
  // pickerText: {
  //   color: '#FFF',
  //   fontWeight: '600',
  //   fontFamily: "Poppins",
  //   fontSize: 16,
  // },
  scrollView: {
    flex: 1, // Ensure the ScrollView takes up available space
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5, // Added space between title and content
  },
  timestampText: {
    position: 'absolute',
    top: 10,
    right: 20,
    fontSize: 13,
    color: '#706645CC',
    fontFamily: "Poppins",
  },
  noDataText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#888",
    marginTop: 10,
  },
    noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noContentText: {
    fontSize: 16,
    color: '#706645',
    fontStyle: 'italic',
  },
  plusSign: {
    marginLeft: 15.5,
    marginTop: 4,
    position: 'absolute',
    fontSize: 30,
    color: 'white',
    fontWeight: '400',
  },
  boldDay: {
    fontWeight: 'bold',
  }
});
