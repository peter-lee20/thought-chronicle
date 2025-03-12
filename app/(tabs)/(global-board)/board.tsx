import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../FirebaseConfig";
import { useRouter } from "expo-router";

/**
 * Interface representing an entry.
 */
interface Entry {
  id: string;
  response: string;
  timestamp: Date | null;
  type: "daily-question" | "journal";
  anonymous: boolean;
  userId: string;
  displayName: string;
  username: string;
}

/**
 * Interface representing user data.
 */
interface UserData {
  fullName: string;
  username: string;
}

/**
 * Board component: Displays daily questions and entries.
 *
 * @returns {JSX.Element} The board component.
 */
export default function Board(): JSX.Element {
  const [question, setQuestion] = useState<string>("");
  // activeTab controls which feed is shown: 'global' or 'friends'
  const [activeTab, setActiveTab] = useState<"global" | "friends">("global");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  /**
   * Toggle the visibility of the dropdown menu.
   */
  const toggleDropdown = (): void => {
    setShowDropdown((prevState) => !prevState);
  };

  /**
   * Get the current date formatted as "weekday, month day".
   *
   * @returns {string} The formatted date string.
   */
  const getCurrentDate = (): string => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  /**
   * Navigate to the entries screen.
   */
  const navigateToEntries = async (): Promise<void> => {
    router.replace("/(entries)/");
  };

  /**
   * Fetch the current daily question from Firestore.
   *
   * @returns {Promise<void>}
   */
  const fetchQuestion = async (): Promise<void> => {
    try {
      const questionDocRef = doc(FIRESTORE_DB, "current-question", "latest");
      const snapshot = await getDoc(questionDocRef);
      if (snapshot.exists()) {
        setQuestion(snapshot.data().text);
      } else {
        console.log("No daily question found!");
      }
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  /**
   * Fetch user data from the "users" collection by userId.
   *
   * @param {string} userId - The user ID to fetch data for.
   * @returns {Promise<UserData | null>} The fetched user data or null if not found.
   */
  const fetchUserDataByUserId = async (
    userId: string
  ): Promise<UserData | null> => {
    try {
      const usersQuery = query(
        collection(FIRESTORE_DB, "users"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(usersQuery);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        const { firstname, lastname, username } = docData;
        return { fullName: ``, username };
      }
    } catch (error) {
      console.error("Error fetching user data for userId:", userId, error);
    }
    return null;
  };

  /**
   * Fetch global entries for the daily question that are shared globally.
   *
   * @returns {Promise<void>}
   */
  const fetchGlobalEntries = async (): Promise<void> => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const globalEntriesQuery = query(
        collection(FIRESTORE_DB, "daily-question-responses"),
        where("sharedGlobally", "==", true)
      );
      const globalSnapshot = await getDocs(globalEntriesQuery);
      const fetchedEntries: Entry[] = globalSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          response: doc.data().response || "",
          timestamp: doc.data().timestamp
            ? doc.data().timestamp.toDate()
            : null,
          type: "daily-question" as "daily-question", // Explicit literal cast
          anonymous: doc.data().anonymous || false,
          userId: doc.data().userId || "",
          displayName: "", // placeholder
          username: "", // placeholder
        }))
        .filter((entry) => {
          if (!entry.timestamp) return false;
          const entryDate = new Date(entry.timestamp);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === today.getTime();
        })
        .sort(
          (a, b) =>
            (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0)
        );

      const entriesWithUserData = await Promise.all(
        fetchedEntries.map(async (entry) => {
          if (entry.anonymous) {
            // For global entries, anonymous entries will show as "ANONYMOUS"
            return { ...entry, displayName: "", username: "ANONYMOUS" };
          }
          const userData = await fetchUserDataByUserId(entry.userId);
          if (!userData) return null;
          return {
            ...entry,
            displayName: userData.fullName,
            username: userData.username,
          };
        })
      );
      const filteredEntries = entriesWithUserData.filter(
        (entry): entry is Entry => entry !== null
      );
      setEntries(filteredEntries);
    } catch (error) {
      console.error("Error fetching global entries:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch friends' entries by retrieving the current user's friends list and fetching their entries.
   *
   * @returns {Promise<void>}
   */
  const fetchFriendsEntries = async (): Promise<void> => {
    try {
      setLoading(true);
      const currentUserId = FIREBASE_AUTH.currentUser?.uid;
      if (!currentUserId) {
        console.error("No user logged in.");
        return;
      }
      // Retrieve current user's document to get friends list.
      const currentUserQuery = query(
        collection(FIRESTORE_DB, "users"),
        where("userId", "==", currentUserId)
      );
      const currentUserSnapshot = await getDocs(currentUserQuery);
      if (currentUserSnapshot.empty) {
        console.error("Current user document not found");
        return;
      }
      const currentUserDoc = currentUserSnapshot.docs[0].data();
      const friendsUsernames: string[] = currentUserDoc.friends || [];

      let allFriendEntries: Entry[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Iterate over each friend's username to fetch their entries.
      for (const friendUsername of friendsUsernames) {
        // Find friend's document by matching username.
        const friendUserQuery = query(
          collection(FIRESTORE_DB, "users"),
          where("username", "==", friendUsername)
        );
        const friendUserSnapshot = await getDocs(friendUserQuery);
        if (friendUserSnapshot.empty) {
          console.warn(
            "Friend document not found for username",
            friendUsername
          );
          continue;
        }
        const friendDoc = friendUserSnapshot.docs[0].data();
        const friendUserId = friendDoc.userId;
        // Query for entries that belong to the friend where sharedWithFriends is true.
        const friendEntriesQuery = query(
          collection(FIRESTORE_DB, "daily-question-responses"),
          where("userId", "==", friendUserId),
          where("sharedWithFriends", "==", true)
        );
        const friendEntriesSnapshot = await getDocs(friendEntriesQuery);
        const friendEntries: Entry[] = friendEntriesSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              response: data.response || "",
              timestamp: data.timestamp ? data.timestamp.toDate() : null,
              type: "daily-question" as "daily-question", // Explicit literal cast
              anonymous: data.anonymous || false,
              userId: data.userId || "",
              displayName:
                friendDoc.firstname && friendDoc.lastname
                  ? `${friendDoc.firstname} ${friendDoc.lastname}`
                  : friendDoc.username,
              username: friendDoc.username,
            };
          })
          .filter((entry) => {
            if (!entry.timestamp) return false;
            const entryDate = new Date(entry.timestamp);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
          });
        allFriendEntries = allFriendEntries.concat(friendEntries);
      }
      // Sort entries by time (earlier posts first)
      allFriendEntries.sort(
        (a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0)
      );
      setEntries(allFriendEntries);
    } catch (error) {
      console.error("Error fetching friends entries:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render an individual entry.
   *
   * @param {Object} param0 - The props containing the entry item.
   * @param {Entry} param0.item - The entry item to render.
   * @returns {JSX.Element} The rendered entry component.
   */
  const renderEntry = ({ item }: { item: Entry }): JSX.Element => {
    let displayName = item.displayName;
    let username = item.username;

    // If the entry is anonymous in the global tab, show "ANONYMOUS"
    if (activeTab === "global" && item.anonymous) {
      displayName = "";
      username = "ANONYMOUS";
    }

    return (
      <TouchableOpacity
        style={styles.entryContainer}
        onPress={() => {
          const route =
            activeTab === "friends"
              ? (`../friends-daily-response/${item.id}` as const)
              : (`../global-daily-response/${item.id}` as const);

          router.push(route);
        }}
      >
        <View style={styles.textContainer}>
          <View style={styles.nameContainer}>
            <Image
              source={require("../../../assets/images/profile.png")}
              style={styles.profileIcon}
              resizeMode="contain"
            />
            <Text style={styles.entryLabel}>
              {displayName} @{username}
            </Text>
            {item.timestamp && (
              <Text style={styles.timeText}>
                {item.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </View>
          <View style={styles.entryTextContainer}>
            <Text
              style={styles.entryText}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {item.response}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Sign out the current user.
   *
   * @returns {Promise<void>}
   */
  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut(FIREBASE_AUTH);
      Alert.alert("Signed out successfully!");
      router.replace("/(setup)");
    } catch (error: unknown) {
      console.error(error);
      Alert.alert("Failed to sign out. Please try again.");
    }
  };

  // Fetch the daily question once on component mount.
  useEffect(() => {
    fetchQuestion();
  }, []);

  // Fetch the appropriate entries whenever the active tab changes.
  useEffect(() => {
    if (activeTab === "global") {
      fetchGlobalEntries();
    } else if (activeTab === "friends") {
      fetchFriendsEntries();
    }
  }, [activeTab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0ECE0" }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Today</Text>
            <Text style={styles.headerDate}>{getCurrentDate()}</Text>
          </View>
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

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("global")}
          >
            <Image
              source={require("../../../assets/images/global-icon.png")}
              style={styles.tabIcon}
              resizeMode="contain"
            />
            <Text style={styles.tabText}>Global</Text>
            {activeTab === "global" && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("friends")}
          >
            <Image
              source={require("../../../assets/images/friends-icon.png")}
              style={styles.tabIcon}
              resizeMode="contain"
            />
            <Text style={styles.tabText}>Friends</Text>
            {activeTab === "friends" && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
        </View>

        {/* Daily Question Section */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>TODAY'S QUESTION</Text>
          <Text style={styles.questionText}>{question}</Text>
        </View>

        {/* Entries List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#706645" />
          </View>
        ) : entries.length > 0 ? (
          <FlatList
            data={entries}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: 50 }} />}
          />
        ) : (
          <View style={styles.noContentContainer}>
            <Text style={styles.noContentText}>No entries found.</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.replace("/(home)/homepage")}>
            <Image
              source={require("../../../assets/images/today.png")}
              style={styles.footerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToEntries}>
            <Image
              source={require("../../../assets/images/entries.png")}
              style={styles.footerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/(add-journal)/")}
            style={{ alignItems: "center" }}
          >
            <Image
              source={require("../../../assets/images/circle.png")}
              style={styles.footerImage}
              resizeMode="contain"
            />
            <Text style={styles.plusSign}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../../../assets/images/feed.png")}
              style={styles.footerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/(friends)/")}>
            <Image
              source={require("../../../assets/images/friends.png")}
              style={styles.footerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Sorted stylesheet classes alphabetically
const styles = StyleSheet.create({
  activeTabIndicator: {
    backgroundColor: "#706645",
    borderRadius: 1,
    bottom: -5,
    height: 2,
    left: 22,
    position: "absolute",
    right: 22,
  },

  container: {
    backgroundColor: "#F0ECE0",
    flex: 1,
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
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 75,
    width: 100,
    zIndex: 10,
  },

  dropdownText: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 16,
  },

  entryContainer: {
    alignItems: "flex-start",
    backgroundColor: "#FDFCF3",
    borderRadius: 15,
    flexDirection: "row",
    marginBottom: 10,
    marginHorizontal: 20,
    minHeight: 130,
    overflow: "hidden",
    padding: 10,
  },

  entryLabel: {
    color: "#706645CC",
    fontFamily: "Poppins",
    fontSize: 13,
    fontWeight: "400",
  },

  entryText: {
    color: "#706645CC",
    fontFamily: "Poppins",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 25,
    marginTop: 10,
  },

  entryTextContainer: {
    marginLeft: 42,
    marginTop: -10,
  },

  footer: {
    backgroundColor: "#F0ECE0",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    position: "absolute",
    bottom: -34,
    left: 0,
    right: 0,
  },

  footerImage: {
    height: 50,
    width: 50,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -29,
    padding: 20,
  },

  headerDate: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "400",
    marginTop: 4,
  },

  headerTitle: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "bold",
  },

  image: {
    height: 40,
    width: 40,
  },

  listContainer: {
    paddingBottom: 20,
  },

  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  nameContainer: {
    alignItems: "center",
    flexDirection: "row",
  },

  noContentContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginTop: 50,
  },

  noContentText: {
    color: "#706645",
    fontSize: 16,
    fontStyle: "italic",
  },

  plusSign: {
    color: "white",
    fontSize: 30,
    fontWeight: "400",
    marginLeft: 15.5,
    marginTop: 4,
    position: "absolute",
  },

  profileIcon: {
    height: 35,
    marginRight: 8,
    marginTop: 2,
    width: 35,
  },

  questionContainer: {
    backgroundColor: "#FDFCF3",
    borderRadius: 15,
    margin: 20,
    marginBottom: 20,
    marginTop: 10,
    padding: 15,
  },

  questionLabel: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },

  questionText: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 16,
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 10,
  },

  tabIcon: {
    height: 20,
    marginRight: 5,
    width: 20,
  },

  tabItem: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    position: "relative",
  },

  tabText: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "bold",
  },

  textContainer: {
    flex: 1,
  },

  timeText: {
    color: "#706645CC",
    fontFamily: "Poppins",
    fontSize: 13,
    position: "absolute",
    right: 20,
    top: 10,
  },
});
