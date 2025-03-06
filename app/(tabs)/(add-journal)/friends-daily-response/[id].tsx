import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FIRESTORE_DB } from '../../../../FirebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';

/**
 * Interface for a daily question entry.
 */
interface DailyQuestionEntry {
  question: string;
  response: string;
  timestamp: Date | null;
  anonymous: boolean;
  displayName: string;
  username: string;
}

/**
 * Interface for user data containing full name and username.
 */
interface UserData {
  fullName: string;
  username: string;
}

/**
 * Functional component for displaying a global daily question entry.
 * Fetches and renders the daily question, user response, and associated details.
 *
 * @returns {JSX.Element} The rendered component.
 */
export default function GlobalDailyQuestionEntryPage(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dailyEntry, setDailyEntry] = useState<DailyQuestionEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetches user data (full name and username) from Firestore based on the user ID.
   *
   * @param {string} userId - The ID of the user to fetch data for.
   * @returns {Promise<UserData | null>} A promise that resolves with the user data or null if not found.
   */
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
    } catch (error: unknown) {
      console.error('Error fetching user data for userId:', userId, error);
    }
    return null;
  };

  useEffect(() => {
    /**
     * Fetches the daily entry data from Firestore based on the provided ID.
     */
    const fetchDailyEntry = async (): Promise<void> => {
      if (!id) {
        console.error('No daily question entry ID provided.');
        return;
      }

      setLoading(true);
      try {
        const docRef = doc(FIRESTORE_DB, 'daily-question-responses', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const userData = await fetchUserDataByUserId(data.userId);
          const displayName = userData ? userData.fullName : 'Unknown User';
          const username = userData ? userData.username : 'unknown';

          setDailyEntry({
            question: data.question || '',
            response: data.response || '',
            timestamp: data.timestamp ? data.timestamp.toDate() : null,
            anonymous: data.anonymous,
            displayName,
            username,
          });
        } else {
          console.log('No such document!');
          // Optionally, handle the error or navigate back
        }
      } catch (error: unknown) {
        console.error('Error fetching daily question entry:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyEntry();
  }, [id]);

  /**
   * Navigates the user back to the previous screen.
   */
  const goBack = (): void => {
    router.back();
  };

  /**
   * Formats the timestamp to display the full date, including day of the week.
   *
   * @param {Date | null} timestamp - The timestamp to format.
   * @returns {JSX.Element} The formatted date as a JSX Text element.
   */
  const formatDateFull = (timestamp: Date | null): JSX.Element => {
    if (!timestamp) return <Text></Text>;
    const dayOfWeek = format(timestamp, 'EEEE');
    const month = format(timestamp, 'MMMM');
    const day = format(timestamp, 'd');
    const year = format(timestamp, 'yyyy');
    return (
      <Text style={styles.dateText}>
        <Text style={styles.boldDay}>{dayOfWeek}, </Text>
        {month} {day}, {year}
      </Text>
    );
  };

  /**
   * Formats the timestamp to display the time in HH:MM format.
   *
   * @param {Date | null} timestamp - The timestamp to format.
   * @returns {string} The formatted time as a string.
   */
  const formatTime = (timestamp: Date | null): string => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading daily question...</Text>
      </View>
    );
  }

  if (!dailyEntry) {
    return (
      <View style={styles.container}>
        <Text>Daily question entry not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Image
            source={require('../../../../assets/images/back_arrow.png')}
            style={styles.backButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Date */}
        {formatDateFull(dailyEntry.timestamp)}

        {/* Daily Question Label and Time */}
        <View style={styles.infoContainer}>
          <Text style={styles.entryLabel}>DAILY QUESTION</Text>
          <Text style={styles.timeText}>{formatTime(dailyEntry.timestamp)}</Text>
        </View>

        {/* Display the Question */}
        <Text style={styles.sectionTitle}>Question:</Text>
        <Text style={styles.entryText}>{dailyEntry.question}</Text>

        {/* Display the Response */}
        <Text style={styles.sectionResponse}>@{dailyEntry.username}'s Response:</Text>
        <Text style={styles.entryText}>{dailyEntry.response}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginRight: 10,
  },
  backButtonImage: {
    height: 24,
    width: 24,
  },
  boldDay: {
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#F0ECE0',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  dateText: {
    alignItems: 'flex-start',
    color: '#706645',
    flexDirection: 'row',
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 15,
  },
  entryLabel: {
    color: '#706645CC',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '400',
  },
  entryText: {
    color: '#706645CC',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#F0ECE0',
    flexDirection: 'row',
    paddingBottom: 0,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  infoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  questionContainer: {
    backgroundColor: '#FDFCF3',
    borderRadius: 15,
    margin: 20,
    marginBottom: 20,
    marginTop: 10,
    padding: 15,
  },
  questionLabel: {
    color: '#706645',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionText: {
    color: '#706645',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
  sectionResponse: {
    color: '#706645',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 18,
  },
  sectionTitle: {
    color: '#706645',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 5,
  },
  timeText: {
    color: '#706645CC',
    fontFamily: 'Poppins',
    fontSize: 13,
  },
});
