import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  GestureResponderEvent,
} from "react-native";
import {} from "react-native";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  QuerySnapshot,
  DocumentData,
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { router } from "expo-router";

import WeekCalendar from "./weekCalendar";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../FirebaseConfig";
import ShareModal from "./shareModal";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface StylesProps {
  [key: string]: any;
}

// Defines the maximum number of characters allowed in the response field.
const maxCharacters = 1500;

// Function to navigate to the entries page.
const navEntries = async () => {
  router.replace("/(entries)/");
};
const navBoard = async () => {
  router.replace("/(global-board)");
};

// Main component for the home page.
export default function HomePage() {
  // State variables:
  const [response, setResponse] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [question, setQuestion] = useState<string>("");
  const [responded, setResponded] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const currentDate = new Date();

  // useEffect hook to fetch the daily question on component mount.
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        // Reference to the 'latest' document in the 'current-question' collection.
        const docRef = doc(FIRESTORE_DB, "current-question", "latest");
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          // Set the question state with the text from the document.
          setQuestion(snapshot.data().text);
        } else {
          console.log("No daily question found!");
        }
      } catch (error: any) {
        console.error("Error fetching question:", error);
      }
    };

    fetchQuestion();
    checkResponse();
  }, []);

  /**
   * Function to set the current streak state to the correct value depending
   * on if the user has answered the daily question response or not.
   */
  const fetchUserStreak = async () => {
    const user = FIREBASE_AUTH.currentUser;

    if (user) {
      try {
        const todayStr = currentDate.toLocaleDateString();
        const streakDocRef = doc(FIRESTORE_DB, "userStreaks", user.uid);
        const streakDocSnap = await getDoc(streakDocRef);
        const currDateString = currentDate.toLocaleDateString();
        const prevDateString = new Date(
          currentDate.getDate() - 1
        ).toLocaleDateString();

        const currDailyQuestionDocs = await getDocs(
          query(
            collection(FIRESTORE_DB, "daily-question-responses"),
            where("userId", "==", user.uid),
            where("date", "==", currDateString)
          )
        );

        const prevDailyQuestionDocs = await getDocs(
          query(
            collection(FIRESTORE_DB, "daily-question-responses"),
            where("userId", "==", user.uid),
            where("date", "==", prevDateString)
          )
        );

        if (streakDocSnap.exists()) {
          const currentStreak = streakDocSnap.data().currentStreak;

          if (!currDailyQuestionDocs.empty) {
            setStreak(currentStreak + 1);
          } else {
            setStreak(currentStreak);
          }
        } else {
          setStreak(0);
        }
      } catch (error: any) {
        console.error("Error fetching user streak:", error);
      }
    }
  };

  /**
   * Effect that runs the fetchUserStreak function whenever 
   * the page renders
   */
  useEffect(() => {
    fetchUserStreak();
  }, [responded]);

  // Function to calculate the start and end dates of the current week.
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

  // Function to check if the user has already responded to the daily question today.
  const checkResponse = async () => {
    const user = FIREBASE_AUTH.currentUser;

    if (user) {
      const userId = user.uid;
      const responsesCollection = collection(
        FIRESTORE_DB,
        "daily-question-responses"
      );
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(
        responsesCollection
      );

      if (snapshot.empty) {
        return;
      }

      const documents = snapshot.docs;

      documents.forEach((document) => {
        if (
          document.data()["userId"] === userId &&
          document.data()["date"] === currentDate.toLocaleDateString()
        ) {
          setResponded(true);
          return;
        }
      });
    } else {
      console.log("User must be authenticated");
    }
  };

  // Function to toggle the visibility of the dropdown menu.
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const openVisiblityModal = () => {
    // don't want to check requirements for the response if the user is just
    // changing their settings
    if (!responded) {
      if (response.trim() === "") {
        Alert.alert("Please enter a response.");
        return;
      }

      if (response.length > maxCharacters) {
        Alert.alert(
          `Response exceeds the maximum limit of ${maxCharacters} characters.`
        );
        return;
      }
    }

    setModalVisible(true);
  };

  const handleSubmitResponse = async (options: {
    globalFeed: boolean;
    anonymous: boolean;
    friends: boolean;
  }) => {
    if (response.trim() === "") {
      Alert.alert("Please enter a response.");
      return;
    }

    if (response.length > maxCharacters) {
      Alert.alert(
        `Response exceeds the maximum limit of ${maxCharacters} characters.`
      );
      return;
    }

    try {
      const user = FIREBASE_AUTH.currentUser;

      if (user) {
        const todayStr = currentDate.toLocaleDateString();

        fetchUserStreak();

        await addDoc(collection(FIRESTORE_DB, "daily-question-responses"), {
          question: question,
          response: response,
          date: todayStr,
          timestamp: new Date(),
          sharedGlobally: options["globalFeed"],
          anonymous: options["anonymous"],
          sharedWithFriends: options["friends"],
          userId: user.uid,
        });

        Alert.alert("Response submitted successfully!");
        setResponse("");
        setResponded(true);
        setModalVisible(false);
      } else {
        Alert.alert("You need to be logged in to submit a response.");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Failed to submit response. Please try again.");
    }
  };

  /**
   * Function that is called when the user taps on "Change Visibility Settings"
   * button after they have responded to the daily question. This opens up the
   * sharing modal again so they can change their sharing settings.
   *
   * @param options The new sharing settings to update
   * @returns Updates the provided changes to the Firestore and on the feeds
   */
  const handleEditSettings = async (options: {
    globalFeed: boolean;
    anonymous: boolean;
    friends: boolean;
  }) => {
    try {
      const user = FIREBASE_AUTH.currentUser;

      if (user) {
        const todayStr = currentDate.toLocaleDateString();
        const responseQuery = query(
          collection(FIRESTORE_DB, "daily-question-responses"),
          where("userId", "==", user.uid),
          where("date", "==", todayStr)
        );
        const snapshot = await getDocs(responseQuery);

        if (snapshot.empty) {
          console.error("No response was found. Please enter a response first");
          Alert.alert("No reponse was found. Please enter a response first.");
          return;
        }

        const responseDoc = snapshot.docs[0];
        const docRef = doc(
          FIRESTORE_DB,
          "daily-question-responses",
          responseDoc.id
        );

        await updateDoc(docRef, {
          sharedGlobally: options["globalFeed"],
          anonymous: options["anonymous"],
          sharedWithFriends: options["friends"],
        });

        Alert.alert("Settings changed successfully!");
        setModalVisible(false);
      } else {
        Alert.alert("You need to be logged in to edit your response settings.");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Failed to edit settings. Please try again.");
    }
  };

  // Handles signing out the current user.
  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      Alert.alert("Signed out successfully!");
      router.replace("/(setup)");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Failed to sign out. Please try again.");
    }
    try {
      await signOut(FIREBASE_AUTH);
      Alert.alert("Signed out successfully!");
      router.replace("/(setup)");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View style={styles.header}>
              <View style={styles.streakContainer}>
                <Image
                  source={require("../../../assets/images/fire.png")}
                  style={styles.fireImage}
                  resizeMode="contain"
                />
                <Text style={styles.days}>{streak}</Text>
              </View>

              <View>
                <TouchableOpacity onPress={toggleDropdown}>
                  <Image
                    source={require("../../../assets/images/profile.png")}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {showDropdown && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={handleSignOut}
                    >
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
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>

              <View style={styles.weekDisplay}>
                <WeekCalendar />
              </View>

              <View style={styles.dailyQuestion}>
                <Text style={styles.subtitle}>TODAY'S DAILY QUESTION</Text>
                <Text style={styles.question}>{question}</Text>
                <TextInput
                  style={styles.responseField}
                  placeholder={
                    responded
                      ? "You've already responded! Come back tomorrow!"
                      : "Type your response here..."
                  }
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

                <TouchableOpacity
                  style={responded ? styles.grayButton : styles.respondButton}
                  onPress={openVisiblityModal}
                  // disabled={responded}
                >
                  {!responded ? (
                    <Text style={styles.buttonText}>Submit Response</Text>
                  ) : (
                    // text is different depending on whther user is submitting their response or changing their settings
                    <Text style={styles.buttonText}>
                      Change Visibility Settings
                    </Text>
                  )}
                </TouchableOpacity>

                <ShareModal
                  isVisible={modalVisible}
                  isFirstSubmit={!responded}
                  // indicates to the share modal whether the user is submitting their response or changing their settings
                  onClose={() => setModalVisible(false)}
                  onSubmit={
                    responded ? handleEditSettings : handleSubmitResponse
                  }
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Footer outside KeyboardAvoidingView */}
      <View style={styles.footer}>
        <TouchableOpacity>
          <Image
            source={require("../../../assets/images/today.png")}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.replace("/(entries)/");
          }}
        >
          <Image
            source={require("../../../assets/images/entries.png")}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.replace("/(add-journal)/");
          }}
        >
          <Image
            source={require("../../../assets/images/circle.png")}
            style={styles.footerImage}
            resizeMode="contain"
          />
          <Text style={styles.plusSign}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={navBoard}>
          <Image
            source={require("../../../assets/images/feed.png")}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.replace("/(friends)");
          }}
        >
          <Image
            source={require("../../../assets/images/friends.png")}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles: StylesProps = StyleSheet.create({
  buttonText: {
    color: "#FFF",
    fontFamily: "Poppins",
    fontSize: 14,
    fontWeight: "bold",
  },
  characterCounter: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "right",
  },
  circleButton: {
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    position: "relative",
    width: 50,
  },
  container: {
    backgroundColor: "#F0ECE0",
    flex: 1,
    padding: 20,
  },
  date: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 20,
  },
  days: {
    color: "#706645CC",
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "700",
  },
  dailyQuestion: {
    marginBottom: 20,
  },
  dropdownItem: {
    borderBottomColor: "#EEE",
    borderBottomWidth: 1,
    padding: 10,
  },
  dropdownMenu: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    elevation: 5,
    position: "absolute",
    right: 0,
    shadowColor: "#000",
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 50,
    width: 100,
    zIndex: 10,
  },
  dropdownText: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 16,
  },
  fireImage: {
    height: 20,
    marginLeft: -20,
    marginRight: -15,
    padding: 0,
  },
  footer: {
    backgroundColor: "#F0ECE0",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  footerImage: {
    height: 50,
    width: 50,
  },
  grayButton: {
    alignItems: "center",
    backgroundColor: "#808080",
    borderRadius: 15,
    marginBottom: "30%",
    paddingVertical: 17.5,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 25,
  },
  image: {
    height: 40,
    width: 40,
  },
  mainContent: {
    flex: 1,
  },
  plusSign: {
    color: "white",
    fontSize: 30,
    fontWeight: "400",
    marginLeft: 15.5,
    marginTop: 4,
    position: "absolute",
  },
  question: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 16,
    marginBottom: 10,
  },
  respondButton: {
    alignItems: "center",
    backgroundColor: "#706645CC",
    borderRadius: 15,
    marginBottom: "30%",
    paddingVertical: 17.5,
  },
  responseField: {
    backgroundColor: "#70664533",
    borderRadius: 10,
    height: 150,
    marginBottom: 10,
    padding: 10,
    textAlignVertical: "top",
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center", // Optional: aligns items vertically in the center
    borderColor: "#706645CC",
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: "#F0ECE0",
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  subtitle: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 10,
  },
  title: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  weekDisplay: {
    marginBottom: 20,
  },
});
