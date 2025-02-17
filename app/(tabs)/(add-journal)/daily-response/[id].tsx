import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FIRESTORE_DB } from '../../../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

interface DailyQuestionEntry {
  question: string;
  response: string;
  timestamp: Date | null;
}

export default function DailyQuestionEntryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dailyEntry, setDailyEntry] = useState<DailyQuestionEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyEntry = async () => {
      if (!id) {
        console.error("No daily question entry ID provided.");
        return;
      }

      setLoading(true);
      try {
        const docRef = doc(FIRESTORE_DB, "daily-question-responses", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setDailyEntry({
            question: data.question || "",
            response: data.response || "",
            timestamp: data.timestamp ? data.timestamp.toDate() : null,
          });
        } else {
          console.log("No such document!");
          // Optionally, handle the error or navigate back
        }
      } catch (error) {
        console.error("Error fetching daily question entry:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyEntry();
  }, [id]);

  const goBack = () => {
    router.back();
  };

  const formatDateFull = (timestamp: Date | null) => {
    if (!timestamp) return '';
    const dayOfWeek = format(timestamp, "EEEE");
    const month = format(timestamp, "MMMM");
    const day = format(timestamp, "d");
    const year = format(timestamp, "yyyy");
    return (
      <Text style={styles.dateText}>
        <Text style={styles.boldDay}>{dayOfWeek}, </Text>
        {month} {day}, {year}
      </Text>
    );
  };

  const formatTime = (timestamp: Date | null) => {
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
        <Text style={styles.sectionResponse}>Your Response:</Text>
        <Text style={styles.entryText}>{dailyEntry.response}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0ECE0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 0,
    paddingHorizontal: 20,
    backgroundColor: '#F0ECE0',
  },
  backButton: {
    marginRight: 10,
  },
  backButtonImage: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  dateText: {
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 15,
    color: "#706645",
    fontFamily: "Poppins",
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  boldDay: {
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  entryLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#706645CC',
    fontFamily: 'Poppins',
  },
  timeText: {
    fontSize: 13,
    color: '#706645CC',
    fontFamily: 'Poppins',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 5,
    color: '#706645',
    fontFamily: 'Poppins',
  },
  sectionResponse: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 5,
    color: '#706645',
    fontFamily: 'Poppins',
  },
  entryText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
    color: '#706645CC',
    fontFamily: 'Poppins',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
