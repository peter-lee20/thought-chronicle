import React, { useState } from 'react';
import { StyleSheet, Alert, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Image } from 'react-native';
import WeekCalendar from './weekCalendar';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { FIRESTORE_DB } from '../../../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, getDocs, collection } from 'firebase/firestore';

export default function HomePage() {
  const [response, setResponse] = useState(''); // State for the text input
  const streak = 5;
  let dailyQuestion = "What is your pet peeve?"; // I don't know what to do with this yet

  const currentDate = new Date();
  const maxCharacters = 1500;

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

  const clickedProfile = () => {
    Alert.alert("Profile Clicked");
    return;
  };

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
      // Get the current user's UID from Firebase Auth
      const user = FIREBASE_AUTH.currentUser;

      if (user) {
        // Save to Firestore
        await addDoc(collection(FIRESTORE_DB, 'daily-question-responses'), {
          question: dailyQuestion,
          response: response,
          date: currentDate.toLocaleDateString(),
          timestamp: new Date(),
          userId: user.uid, // Track the user who submitted the response
        });

        Alert.alert("Response submitted successfully!");
        setResponse(''); // Clear input after submission
      } else {
        Alert.alert("You need to be logged in to submit a response.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to submit response. Please try again.");
    }
  };

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long", // "long", "short", or "narrow"
    year: "numeric", // "numeric" or "2-digit"
    month: "long", // "numeric", "2-digit", "long", "short", or "narrow"
    day: "numeric", // "numeric" or "2-digit"
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.streakContainer}>
              <Image source={require('../../../assets/images/fire.png')} style={styles.fireImage} resizeMode="contain"/>
              <Text style={styles.days}>
                {streak}
              </Text>
            </View>
            <TouchableOpacity onPress={clickedProfile}>
              <Image source={require('../../../assets/images/profile.png')} style={styles.image} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.date}>{currentDate.toLocaleDateString(undefined, options)}</Text>

            {/* Week Overview */}
            <View style={styles.weekDisplay}>
              <WeekCalendar />
            </View>

            {/* Daily Question */}
            <View style={styles.dailyQuestion}>
              <Text style={styles.subtitle}>TODAY'S DAILY QUESTION</Text>
              <Text style={styles.question}>{dailyQuestion}</Text>
              <TextInput
                style={styles.responseField}
                placeholder="Type your response here..."
                placeholderTextColor="#70664550"
                multiline
                maxLength = {maxCharacters}
                value={response} // Bind the value to the state
                onChangeText={setResponse} // Update state on text change
              />
              {/* Character Counter */}
              <Text style={styles.characterCounter}>
                {response.length}/{maxCharacters} characters
              </Text>
              <TouchableOpacity style={styles.respondButton} onPress={handleSubmitResponse}>
                <Text style={styles.buttonText}>Submit Response</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity>
              <Image source={require('../../../assets/images/today.png')} style={styles.footerImage}resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../../assets/images/entries.png')} style={styles.footerImage} resizeMode="contain"/>
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../../assets/images/circle.png')} style={styles.footerImage} resizeMode="contain"/>
              <Text style = {styles.plusSign}>
                +
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../../assets/images/feed.png')} style={styles.footerImage} resizeMode="contain"/>
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../../assets/images/friends.png')} style={styles.footerImage} resizeMode="contain" />
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
  },
  characterCounter: {
    fontSize: 12,
    color: '#706645',
    marginBottom: 10,
    textAlign: 'right',
    fontFamily: "Poppins",
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
  }
});
