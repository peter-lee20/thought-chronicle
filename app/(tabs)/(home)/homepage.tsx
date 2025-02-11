import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import WeekCalendar from './weekCalendar';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { FIRESTORE_DB } from '../../../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, setDoc, updateDoc, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Link, router } from 'expo-router';
import { ReactNativeAsyncStorage } from 'firebase/auth';

export default function HomePage() {
  const [response, setResponse] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState('');
  const [responded, setResponded] = useState<boolean>(false);
  const currentDate = new Date();
  const maxCharacters = 1500;

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const docRef = doc(FIRESTORE_DB, "current-question", "latest");
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setQuestion(snapshot.data().text);
        } else {
          console.log("No daily question found!");
        }
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    }
 
    fetchQuestion();
    checkResponse();
  }, []);

  useEffect(() => {
    const fetchUserStreak = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        try {
          const streakDocRef = doc(FIRESTORE_DB, 'userStreaks', user.uid);
          const streakDocSnap = await getDoc(streakDocRef);
          const todayStr = currentDate.toLocaleDateString();
          const yesterday = new Date(currentDate);
          yesterday.setDate(currentDate.getDate() - 1);
          const yesterdayStr = yesterday.toLocaleDateString();

          if (streakDocSnap.exists()) {
            const data = streakDocSnap.data();
            if (data.lastAnsweredDate === todayStr || data.lastAnsweredDate === yesterdayStr) {
              setStreak(data.currentStreak);
            } else {
              //Resets the streak to 0 if the user misses a day
              setStreak(0);
              await updateDoc(streakDocRef, { currentStreak: 0 });
            }
          } else {
            setStreak(0);
          }
        } catch (error) {
          console.error('Error fetching user streak:', error);
        }
      }
    };
    fetchUserStreak();
  }, []);

  const getWeekRange = () => {
    const startOfWeek = new Date(currentDate);
    const endOfWeek = new Date(currentDate);

    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    endOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay()));

    return {
      start: startOfWeek.toLocaleDateString(),
      end: endOfWeek.toLocaleDateString(),
    };
  };

  const weekRange = getWeekRange();

    // Check if user has already responded
  const checkResponse = async () => {

    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const userID = user.uid;
      const responses = collection(FIRESTORE_DB, "daily-question-responses");
      const snapshot = await getDocs(responses);

      if (snapshot.empty){
        return;
      }

      const documents = snapshot.docs;
      // Iterate through all documents, set responded to true if there exists a document with the user's ID and current date
      documents.forEach((document) => {
        if (document.data()["userId"] === userID && document.data()["date"] === currentDate.toLocaleDateString()) {
          setResponded(true);
          return;
        }
      })

    } else {
      console.log("User must be authenticated");
    }

  }

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  }

  const handleSubmitResponse = async () => {
    if (response.trim() === '') {
      Alert.alert("Please enter a response.");
      return;
    }

    if (response.length > maxCharacters) {
      Alert.alert(`Response exceeds the maximum limit of ${maxCharacters} characters.`);
      return;
    } 

    try {
      // Get the current user.
      const user = FIREBASE_AUTH.currentUser;

      if (user) {
        const todayStr = currentDate.toLocaleDateString();
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString();

        // Reference the user’s streak document.
        const streakDocRef = doc(FIRESTORE_DB, 'userStreaks', user.uid);
        const streakDocSnap = await getDoc(streakDocRef);
        let newStreak = 1; // Default streak if no previous record.

        if (streakDocSnap.exists()) {
          const data = streakDocSnap.data();
          // Check if the user already answered today.
          if (data.lastAnsweredDate === todayStr) {
            newStreak = data.currentStreak;
          } else if (data.lastAnsweredDate === yesterdayStr) {
            // Consecutive day: increment the streak.
            newStreak = data.currentStreak + 1;
          } else {
            // Missed one or more days: start over at 1.
            newStreak = 1;
          }
          await updateDoc(streakDocRef, {
            currentStreak: newStreak,
            lastAnsweredDate: todayStr,
          });
        } else {
          // If no streak document exists, create one.
          await setDoc(streakDocRef, {
            currentStreak: newStreak,
            lastAnsweredDate: todayStr,
          });
        }

        // Update local state so the UI shows the new streak.
        setStreak(newStreak);

        // Save the daily response.
        await addDoc(collection(FIRESTORE_DB, 'daily-question-responses'), {
          question: question,
          response: response,
          date: todayStr,
          timestamp: new Date(),
          userId: user.uid,
        });

        Alert.alert('Response submitted successfully!');
        setResponse(''); // Clear the input.
        setResponded(true);
      } else {
        Alert.alert('You need to be logged in to submit a response.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Failed to submit response. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      Alert.alert('Signed out successfully!');
      router.replace("/(setup)");
      // Redirect to login screen or handle accordingly
    } catch (error) {
      console.error(error);
      Alert.alert('Failed to sign out. Please try again.');
    }
  };

  const goToJournal = () => {
    router.replace("/(add-journal)/");
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.streakContainer}>
              <Image
                source={require('../../../assets/images/fire.png')}
                style={styles.fireImage}
                resizeMode="contain"
              />
              {/* Display the dynamic streak */}
              <Text style={styles.days}>{streak}</Text>
            </View>
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

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.date}>
              {currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            {/* Week Overview */}
            <View style={styles.weekDisplay}>
              <WeekCalendar />
            </View>

            {/* Daily Question */}
            <View style={styles.dailyQuestion}>
              <Text style={styles.subtitle}>TODAY'S DAILY QUESTION</Text>
              <Text style={styles.question}>{question}</Text>
              <TextInput
                style={styles.responseField}
                placeholder={responded === true ? "You've already responded! Come back tomorrow!" : "Type your response here..."}
                editable={!responded}
                placeholderTextColor="#70664550"
                multiline
                maxLength={maxCharacters}
                value={response}
                onChangeText={setResponse}
              />
              <Text style={styles.characterCounter}>
                {response.length}/{maxCharacters} characters
              </Text>
              <TouchableOpacity style={responded === true ? styles.grayButton : styles.respondButton} onPress={handleSubmitResponse} disabled={responded}>
                <Text style={styles.buttonText}>Submit Response</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity>
              <Image
                source={require('../../../assets/images/today.png')}
                style={styles.footerImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={require('../../../assets/images/entries.png')}
                style={styles.footerImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={goToJournal}>
              <Image
                source={require('../../../assets/images/circle.png')}
                style={styles.footerImage}
                resizeMode="contain"
              />
              <Text style={styles.plusSign}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={require('../../../assets/images/feed.png')}
                style={styles.footerImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={require('../../../assets/images/friends.png')}
                style={styles.footerImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0ECE0',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakCounter: {
    flexDirection: 'row', // Align image and number
    alignItems: 'center',
    borderColor: '#706645',
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
    backgroundColor: '#F9F9F9',
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: "#706645",
    fontFamily: "Poppins",
  },
  date: {
    fontSize: 16,
    marginBottom: 20,
    color: "#706645",
    fontFamily: "Poppins",
    fontWeight: '400',
  },
  weekDisplay: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 10,
    color: "#706645",
    fontFamily: "Poppins",
  },
  dailyQuestion: {
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    marginBottom: 10,
    color: "#706645",
    fontFamily: "Poppins",
  },
  responseField: {
    borderRadius: 10,
    padding: 10,
    height: 150,
    marginBottom: 10,
    backgroundColor: '#70664533',
    textAlignVertical: 'top',
  },
  characterCounter: {
    fontSize: 12,
    color: '#706645',
    marginBottom: 10,
    textAlign: 'right',
    fontFamily: "Poppins",
  },
  grayButton: {
    backgroundColor: '#808080',
    paddingVertical: 17.5,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: '30%',
  },
  respondButton: {
    backgroundColor: '#706645CC',
    paddingVertical: 17.5,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: '30%',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: "Poppins",
    fontSize: 14,
  },
  image: {
    width: 40,
    height: 40,
  },
  fireImage: {
    height: 20,
    padding: 0,
    marginRight: -15,
    marginLeft: -20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto', // Push footer to the bottom
    paddingVertical: 20,
    backgroundColor: '#F0ECE0',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Optional: aligns items vertically in the center
    borderColor: '#706645CC',
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: '#F0ECE0',
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  days: {
    fontSize: 24,
    fontWeight: '700',
    color: "#706645CC",
    fontFamily: "Poppins",
  },
  circleButton: {
    position: 'relative', // Make this container the reference for absolute positioning
    width: 50, // Adjust to match your circle image size
    height: 50, // Adjust to match your circle image size
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusSign: {
    marginLeft: 15.5,
    marginTop: 4,
    position: 'absolute',
    fontSize: 30, // Adjust size as needed
    color: 'white', // Adjust color as needed
    fontWeight: '400', // Make the plus sign bold if needed
  },
  footerImage: {
    width: 50,
    height: 50,
  }, 
  dropdownMenu: {
    position: 'absolute',
    top: 50, // Position below the profile image
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
});
