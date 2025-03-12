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
} from "react-native";
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
import ShareModal from "./shareModal";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../FirebaseConfig";

// Maximum allowed characters for the response field. This limit is set to prevent excessively long entries.
const maxCharacters: number = 1500;

// Navigation functions to quickly switch views.
const navEntries = async (): Promise<void> => {
  router.replace("/(entries)/");
};

const navBoard = async (): Promise<void> => {
  router.replace("/(global-board)");
};

/**
 * HomePage component is the main screen for daily question responses.
 * It fetches the current daily question, allows the user to submit a response,
 * and lets the user adjust visibility settings on their response.
 *
 * @returns {JSX.Element} The rendered home page.
 */
export default function HomePage(): JSX.Element {
  // State variables used to store response text, user settings, and question data.
  const [response, setResponse] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [question, setQuestion] = useState<string>("");
  const [responded, setResponded] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const currentDate: Date = new Date();

  // Fetch the daily question on component mount.
  useEffect((): void => {
    /**
     * Fetches the latest daily question from Firestore.
     * We use the 'latest' document from the 'current-question' collection to ensure the question is current.
     */
    const fetchQuestion = async (): Promise<void> => {
      try {
        const docRef = doc(FIRESTORE_DB, "current-question", "latest");
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
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
   * Fetches and updates the user's streak based on whether they have answered today's question.
   * The logic here helps maintain user engagement by tracking daily participation.
   */
  const fetchUserStreak = async (): Promise<void> => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      try {
        const streakDocRef = doc(FIRESTORE_DB, "userStreaks", user.uid);
        const streakDocSnap = await getDoc(streakDocRef);
        const currDateString: string = currentDate.toLocaleDateString();

        // We query daily responses for today to know if the user answered.
        const currDailyQuestionDocs: QuerySnapshot<DocumentData> =
          await getDocs(
            query(
              collection(FIRESTORE_DB, "daily-question-responses"),
              where("userId", "==", user.uid),
              where("date", "==", currDateString)
            )
          );

        // If no streak record exists, initialize it.
        if (!streakDocSnap.exists()) {
          await setDoc(doc(FIRESTORE_DB, "userStreaks", user.uid), {
            currentStreak: 0,
            lastAnsweredDate: "N/A",
          });
        }

        if (streakDocSnap.exists()) {
          const currentStreak: number = streakDocSnap.data().currentStreak;
          // Increase streak only if there's a response for today.
          if (!currDailyQuestionDocs.empty) {
            setStreak(currentStreak + 1);
          } else {
            setStreak(currentStreak);
          }
        }
      } catch (error: any) {
        console.error("Error fetching user streak:", error);
      }
    }
  };

  // Run fetchUserStreak every time the responded flag changes.
  useEffect((): void => {
    fetchUserStreak();
  }, [responded]);

  /**
   * Calculates the start and end dates of the current week.
   * This is used to display week-related data in the calendar.
   *
   * @returns {{ start: string; end: string }} The start and end dates as strings.
   */
  const getWeekRange = (): { start: string; end: string } => {
    const startOfWeek = new Date(currentDate);
    const endOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    endOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
    return {
      start: startOfWeek.toLocaleDateString(),
      end: endOfWeek.toLocaleDateString(),
    };
  };

  /**
   * Checks if the user has already responded to the daily question today.
   * This prevents duplicate responses and helps enforce daily limits.
   *
   * @returns {Promise<void>}
   */
  const checkResponse = async (): Promise<void> => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const userId: string = user.uid;
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
      snapshot.docs.forEach((document) => {
        // We compare the stored date with the current date string to decide if a response exists.
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

  /**
   * Toggles the visibility of the dropdown menu.
   * We use this to allow users quick access to account actions (like sign out).
   *
   * @returns {void}
   */
  const toggleDropdown = (): void => {
    setShowDropdown((prev) => !prev);
  };

  /**
   * Opens the visibility modal for the response.
   * We first validate the response (if not just updating settings) to prevent invalid submissions.
   *
   * @returns {void}
   */
  const openVisiblityModal = (): void => {
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

  /**
   * Submits the user's response to the daily question.
   * We enforce content length and ensure the user is authenticated before submission.
   *
   * @param options - Sharing settings for the response.
   * @returns {Promise<void>}
   */
  const handleSubmitResponse = async (options: {
    globalFeed: boolean;
    anonymous: boolean;
    friends: boolean;
  }): Promise<void> => {
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
        const todayStr: string = currentDate.toLocaleDateString();
        // Update the streak even if the user is submitting a new response.
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
   * Called when the user wants to change the sharing settings after submitting a response.
   * It updates the Firestore document with the new visibility settings.
   *
   * @param options - The new sharing settings.
   * @returns {Promise<void>}
   */
  const handleEditSettings = async (options: {
    globalFeed: boolean;
    anonymous: boolean;
    friends: boolean;
  }): Promise<void> => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const todayStr: string = currentDate.toLocaleDateString();
        const responseQuery = query(
          collection(FIRESTORE_DB, "daily-question-responses"),
          where("userId", "==", user.uid),
          where("date", "==", todayStr)
        );
        const snapshot = await getDocs(responseQuery);
        if (snapshot.empty) {
          console.error("No response was found. Please enter a response first");
          Alert.alert("No response was found. Please enter a response first.");
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

  /**
   * Signs out the current user.
   * Signing out is critical for security, ensuring that sessions are properly closed.
   *
   * @returns {Promise<void>}
   */
  const handleSignOut = async (): Promise<void> => {
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
                >
                  {!responded ? (
                    <Text style={styles.buttonText}>Submit Response</Text>
                  ) : (
                    <Text style={styles.buttonText}>
                      Change Visibility Settings
                    </Text>
                  )}
                </TouchableOpacity>
                <ShareModal
                  isVisible={modalVisible}
                  isFirstSubmit={!responded}
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
      {/* Footer */}
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

const styles = StyleSheet.create({
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

  dailyQuestion: {
    marginBottom: 20,
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
    alignItems: "center",
    backgroundColor: "#F0ECE0",
    borderColor: "#706645CC",
    borderRadius: 20,
    borderWidth: 2,
    flexDirection: "row",
    paddingHorizontal: 9,
    paddingVertical: 3,
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
