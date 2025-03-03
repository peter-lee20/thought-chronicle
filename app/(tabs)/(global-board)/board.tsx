import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../FirebaseConfig';
import { useRouter } from 'expo-router';
import { Stack } from "expo-router";

interface Entry {
  id: string;
  response: string;
  timestamp: Date | null;
  type: 'daily-question' | 'journal';
  anonymous: boolean;
  userId: string;
  displayName: string; // full name (first and last)
  username: string; // actual username from Firestore
}


export default function Board() {
  const [question, setQuestion] = useState('');
  const [activeTab, setActiveTab] = useState('global');
  const [showDropdown, setShowDropdown] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const currentUser = FIREBASE_AUTH.currentUser;
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };
  const navEntries = async () => {
    router.replace('/(entries)/');
   };

  const fetchQuestion = async () => {
    try {
      const docRef = doc(FIRESTORE_DB, 'current-question', 'latest');
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setQuestion(snapshot.data().text);
      } else {
        console.log('No daily question found!');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  // Helper function to fetch a user's name document
  // Helper function to fetch a user's first and last name from the "users" collection
  interface UserData {
    fullName: string;
    username: string;
  }
  
  const fetchUserDataByUserId = async (userId: string): Promise<UserData | null> => {
    try {
      const usersQuery = query(
        collection(FIRESTORE_DB, 'users'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(usersQuery);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        const { firstname, lastname, username } = docData;
        return { fullName: `${firstname} ${lastname}`, username };
      }
    } catch (error) {
      console.error('Error fetching user data for userId:', userId, error);
    }
    return null;
  };
  

  
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const dailyQuestionQuery = query(
        collection(FIRESTORE_DB, 'daily-question-responses'),
        where('sharedGlobally', '==', true)
      );
      const dailyQuestionSnapshot = await getDocs(dailyQuestionQuery);
      const fetchedEntries: Entry[] = dailyQuestionSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          response: doc.data().response || '',
          timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null,
          type: 'daily-question' as const,
          anonymous: doc.data().anonymous || false,
          userId: doc.data().userId || '',
          displayName: '', // placeholder
          username: '',    // placeholder
        }))
        .filter((entry) => {
          // Optionally filter by date or remove filter for debugging:
          if (!entry.timestamp) return false;
          const entryDate = new Date(entry.timestamp);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === today.getTime();
        })
        // Sort in ascending order by time (earlier posts first)
        .sort(
          (a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0)
        );
  
      const entriesWithUserData = await Promise.all(
        fetchedEntries.map(async (entry) => {
          if (entry.anonymous) {
            return {
              ...entry,
              displayName: 'ANONYMOUS',
              username: 'ANONYMOUS',
            };
          }
          const userData = await fetchUserDataByUserId(entry.userId);
          if (!userData) {
            // Skip the entry if no matching user document is found
            return null;
          }
          return { ...entry, displayName: userData.fullName, username: userData.username };
        })
      );
  
      // Filter out any entries that returned null
      const filteredEntries = entriesWithUserData.filter(
        (entry): entry is Entry => entry !== null
      );
  
      setEntries(filteredEntries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };
  

  
  const formatTime = (timestamp: Date | null): string => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEntry = ({ item }: { item: Entry }) => (
    <TouchableOpacity
      style={styles.entryContainer}
      onPress={() => router.push(`../global-daily-response/${item.id}`)}
    >
      <View style={styles.textContainer}>
        {/* Header row: profile icon and name */}
        <View style={styles.nameContainer}>
          <Image
            source={require('../../../assets/images/profile.png')}
            style={styles.profileIcon}
            resizeMode="contain"
          />
          <Text style={styles.entryLabel}>
            {item.displayName} @{item.username}
          </Text>
          {item.timestamp && (
            <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
          )}
        </View>
        {/* Post text starts with an indent so it's aligned with the name (after the icon) */}
        <View style={styles.entryTextContainer}>
          <Text style={styles.entryText} numberOfLines={3} ellipsizeMode="tail">
            {item.response}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  
  

  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      Alert.alert('Signed out successfully!');
      router.replace('/(setup)');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Failed to sign out. Please try again.');
    }
  };

  useEffect(() => {
    fetchQuestion();
    fetchEntries();
  }, []);

  return (
    <SafeAreaView style = {{ flex:1, backgroundColor: '#F0ECE0' }}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Today</Text>
          <Text style={styles.headerDate}>{getCurrentDate()}</Text>
        </View>
        <TouchableOpacity onPress={toggleDropdown}>
          <Image
            source={require('../../../assets/images/profile.png')}
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
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('global')}
        >
          <Text style={styles.tabText}>     </Text>
          <Image
            source={require('../../../assets/images/global-icon.png')}
            style={styles.tabIcon}
            resizeMode="contain"
          />
          <Text style={styles.tabText}>Global       </Text>
          {activeTab === 'global' && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={styles.tabText}>     </Text>
          <Image
            source={require('../../../assets/images/friends-icon.png')}
            style={styles.tabIcon}
            resizeMode="contain"
          />
          <Text style={styles.tabText}>Friends       </Text>
          {activeTab === 'friends' && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
      </View>
      {/* Daily Question Section */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionLabel}>TODAY'S QUESTION</Text>
        <Text style={styles.questionText}>{question}</Text>
      </View>

      {/* Content */}
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
        />
      ) : (
        <View style={styles.noContentContainer}>
          <Text style={styles.noContentText}>No entries found.</Text>
        </View>
      )}
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => {
            router.replace('/(home)/homepage');
          }}
        >
          <Image
            source={require('../../../assets/images/today.png')}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={navEntries}>
          <Image
           source={require('../../../assets/images/entries.png')}
           style={styles.footerImage}
           resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.replace('/(add-journal)/');
          }}
          style={{ alignItems: 'center' }}
        >
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
        <TouchableOpacity onPress={() => {
            router.replace('/(friends)/');
          }}>
          <Image
            source={require('../../../assets/images/friends.png')}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
   </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (your styles remain unchanged)
  container: {
    backgroundColor: '#F0ECE0',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#706645',
    fontFamily: 'Poppins',
  },
  headerDate: {
    fontSize: 18,
    color: '#706645',
    fontFamily: 'Poppins',
    fontWeight: '400',
    marginTop: 4,
  },
  image: {
    height: 40,
    width: 40,
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
  dropdownItem: {
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
    padding: 10,
  },
  dropdownText: {
    color: '#706645',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  tabIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  tabText: {
    color: '#706645',
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: 'bold',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#706645',
    borderRadius: 1,
  },
  questionContainer: {
    backgroundColor: '#FDFCF3',
    margin: 20,
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  questionLabel: {
    color: '#706645',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  questionText: {
    color: '#706645',
    fontSize: 16,
    fontFamily: 'Poppins',
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
  entryContainer: {
    alignItems: 'flex-start',
    backgroundColor: '#FDFCF3',
    borderRadius: 15,
    flexDirection: 'row',
    marginHorizontal: 20,
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
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 35,
    height: 35,
    marginRight: 8,
    marginTop: 2,
  },
  entryLabel: {
    color: "#706645CC",
    fontSize: 13,
    fontWeight: '400',
    marginTop: 0, // removed top margin since profile is now alongside
    fontFamily: 'Poppins',
  },
  entryText: {
    color: '#706645CC',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 25,
    marginTop: 10,
    fontFamily: 'Poppins',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 13,
    color: '#706645CC',
    fontFamily: 'Poppins',
    position: 'absolute',
    right: 20,
    top: 10,
  },
  listContainer: {
    paddingBottom: 20,
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
  plusSign: {
    color: 'white',
    fontSize: 30,
    fontWeight: '400',
    marginLeft: 15.5,
    marginTop: 4,
    position: 'absolute',
  },
  entryTextContainer: {
    marginLeft: 42, // Adjust this value to match the profileIcon width + marginRight (30 + 8 = 38)
    marginTop: -10,
  },
});
