import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { format } from "date-fns";

import DateTimePicker from '@react-native-community/datetimepicker';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../FirebaseConfig';

interface StylesProps {
  [key: string]: any;
}

interface JournalEntry {
  id: string;
  response: string;
  timestamp: Date | null;
}

// Updated DailyResponse to include an "id" for navigation
interface DailyResponse {
  id: string;
  response: string;
  timestamp: Date | null;
}

// Entries page component displaying daily question and journal entries
export default function EntryPage() {
  // Access the date parameter from the route
  const { date } = useLocalSearchParams();
  // Format date string to PST
  const pstDateString = `${date}T00:00:00-08:00`;

  // State variables
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(pstDateString));
  const [dailyResponse, setDailyResponse] = useState<DailyResponse | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [currentPickerType, setCurrentPickerType] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Function to toggle the dropdown menu visibility
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  // Function to handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      Alert.alert('Signed out successfully!');
      router.replace("/(setup)");
    } catch (error: any) {
      console.error(error);
      Alert.alert('Failed to sign out. Please try again.');
    }
  };

  // Function to handle date changes from the date picker
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
    setIsDatePickerVisible(false);
  };

  // Function to format date for Firestore queries
  const formatDateForFirestore = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  // Function to format date for state updates (YYYY-MM-DD)
  const formatDateForState = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  // Function to fetch daily question response and journal entries from Firestore
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
        const docSnap = dailyQuestionSnapshot.docs[0]; // Assuming only one response per day
        const docData = docSnap.data();
        setDailyResponse({
          id: docSnap.id,
          response: docData.response || "",
          timestamp: docData.timestamp ? docData.timestamp.toDate() : null,
        });
      } else {
        setDailyResponse(null);
      }

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
          id: doc.id, // Store the document ID
          response: docData.response || "",
          timestamp: docData.timestamp ? docData.timestamp.toDate() : null,
        });
      });
      setJournalEntries(journalEntriesData);

    } catch (error: any) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [selectedDate]);

  // Function to format the time from a timestamp
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
                    router.push(`../(add-journal)/daily-response/${dailyResponse.id}`);
                  }}
                >
                  <Image
                    source={require('../../../assets/images/question_mark.png')}
                    style={styles.entryImage}
                    resizeMode="contain"
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
                    router.push(`../(add-journal)/journal-entry/${entry.id}`);
                    console.log("pressed journal entry");
                  }}
                >
                  <Image
                    source={require('../../../assets/images/journal.png')}
                    style={styles.entryImage}
                    resizeMode="contain"
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
            {/* Back Arrow */}
            <TouchableOpacity onPress={() => {
              router.push({
                pathname: "/(entries)",
                params: {},
              });
            }} style={styles.backButton}>
              <Image
                source={require('../../../assets/images/back_arrow.png')}
                style={styles.backButtonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
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
            <TouchableOpacity onPress={() => { router.replace('/(home)/homepage') }}>
              <Image source={require('../../../assets/images/today.png')} style={styles.footerImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../../assets/images/entries.png')} style={styles.footerImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { router.replace('/(add-journal)/') }}>
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

const styles: StylesProps = StyleSheet.create({
  backButton: {
    borderRadius: 20,
    padding: 10,
  },
  backButtonImage: {
    height: 30,
    width: 30,
  },
  boldDay: {
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#F0ECE0',
    flex: 1,
  },
  dateEntryContainer: {
    marginBottom: 10,
  },
  dateText: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 10,
  },
  dropdownItem: {
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
    padding: 10,
  },
  dropdownMenu: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 5,
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 50,
    width: 100,
    zIndex: 10,
  },
  dropdownText: {
    color: '#706645',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
  entryContainer: {
    alignItems: 'flex-start',
    backgroundColor: '#FDFCF3',
    borderRadius: 15,
    flexDirection: 'row',
    marginBottom: 10,
    minHeight: 130,
    overflow: 'hidden',
    padding: 10,
  },
  entryImage: {
    height: 30,
    marginLeft: 10,
    marginRight: 20,
    marginTop: 40,
    width: 30,
  },
  entryLabel: {
    color: "#706645CC",
    fontSize: 13,
    fontWeight: '400',
    marginTop: 10,
  },
  entryText: {
    color: "#706645CC",
    fontSize: 12,
    fontWeight: '600',
    marginRight: 25,
    marginTop: 10,
  },
  footer: {
    backgroundColor: '#F0ECE0',
    borderTopColor: '#70664533',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  footerImage: {
    height: 50,
    width: 50,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  image: {
    height: 40,
    width: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  noContentContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 50,
  },
  noContentText: {
    color: '#706645',
    fontSize: 16,
    fontStyle: 'italic',
  },
  noDataText: {
    color: "#888",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 10,
  },
  plusSign: {
    color: 'white',
    fontSize: 30,
    fontWeight: '400',
    marginLeft: 15.5,
    marginTop: 4,
    position: 'absolute',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  scrollView: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  timestampText: {
    color: '#706645CC',
    fontFamily: "Poppins",
    fontSize: 13,
    position: 'absolute',
    right: 20,
    top: 10,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
});
