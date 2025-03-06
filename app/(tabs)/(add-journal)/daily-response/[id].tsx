import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FIRESTORE_DB } from '../../../../FirebaseConfig';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';

/**
 * Interface representing a daily question entry.
 */
interface DailyQuestionEntry {
  question: string;
  response: string;
  timestamp: Date | null;
}

/**
 * DailyQuestionEntryPage component fetches, displays, and allows editing or deleting a daily question entry.
 *
 * @returns {JSX.Element} The rendered daily question entry page.
 */
export default function DailyQuestionEntryPage(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dailyEntry, setDailyEntry] = useState<DailyQuestionEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [contents, setContents] = useState<string>("");
  const maxCharacters = 1500;

  useEffect(() => {
    /**
     * Fetches the daily entry data from Firestore based on the provided ID.
     *
     * @returns {Promise<void>}
     */
    const fetchDailyEntry = async (): Promise<void> => {
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
          // Optionally, handle the error or navigate back.
        }
      } catch (error) {
        console.error("Error fetching daily question entry:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyEntry();
  }, [id]);

  /**
   * Navigates back to the previous screen.
   *
   * @returns {void}
   */
  const goBack = (): void => {
    router.back();
  };

  /**
   * Enables editing mode and sets the current response as the content to edit.
   *
   * @param entry - The current entry response string.
   * @returns {Promise<void>}
   */
  const enableEdit = async (entry: string): Promise<void> => {
    setEditing(true);
    setContents(entry);
  };

  /**
   * Handles updating the entry in Firestore after editing.
   *
   * @returns {Promise<void>}
   */
  const handleEdit = async (): Promise<void> => {
    if (!id || !dailyEntry) {
      console.error("No daily question entry ID provided or entry not loaded.");
      return;
    }

    // Enforce character limit
    if (contents.length > maxCharacters) {
      Alert.alert(`Response exceeds the maximum limit of ${maxCharacters} characters.`);
      return;
    }
    Alert.alert(
      "Edit Daily Question Response",
      "These edits will be visible to everyone who can see this response. Are you sure you want to edit this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async (): Promise<void> => {
            try {
              const docRef = doc(FIRESTORE_DB, "daily-question-responses", id);
              await updateDoc(docRef, { response: contents });
              setEditing(false);
              setDailyEntry({
                question: dailyEntry.question,
                response: contents,
                timestamp: dailyEntry.timestamp,
              });
            } catch (error) {
              console.error("Error editing document:", error);
            }
          },
        },
      ]
    );
  };

  /**
   * Handles deleting the entry from Firestore.
   *
   * @returns {Promise<void>}
   */
  const handleDelete = async (): Promise<void> => {
    if (!id || !dailyEntry) {
      console.error("No daily question entry ID provided or entry not loaded.");
      return;
    }

    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async (): Promise<void> => {
            try {
              const docRef = doc(FIRESTORE_DB, "daily-question-responses", id);
              await deleteDoc(docRef);
              console.log("Document successfully deleted!");
              // Navigate back to the entries page for the same date.
              const entryDate = dailyEntry.timestamp
                ? format(dailyEntry.timestamp, "yyyy-MM-dd")
                : format(new Date(), "yyyy-MM-dd");
              router.replace(`/(entries)/entries?date=${entryDate}`);
            } catch (error) {
              console.error("Error removing document:", error);
            }
          },
        },
      ]
    );
  };

  /**
   * Formats the timestamp into a full date string.
   *
   * @param timestamp - The timestamp to format.
   * @returns {JSX.Element} The formatted date as a JSX element.
   */
  const formatDateFull = (timestamp: Date | null): JSX.Element | string => {
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

  /**
   * Formats the timestamp into a short time string.
   *
   * @param timestamp - The timestamp to format.
   * @returns {string} The formatted time.
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
      {/* Header with Back Button and Action Buttons */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Image
            source={require('../../../../assets/images/back_arrow.png')}
            style={styles.backButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          {editing ? (
            <TouchableOpacity onPress={handleEdit}>
              <Image
                source={require('../../../../assets/images/journal-check.png')}
                resizeMode="contain"
                style={styles.editImage}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => enableEdit(dailyEntry.response)}>
              <Image
                source={require('../../../../assets/images/edit.png')}
                resizeMode="contain"
                style={styles.editImage}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDelete}>
            <Image
              source={require('../../../../assets/images/delete.png')}
              resizeMode="contain"
              style={styles.deleteImage}
            />
          </TouchableOpacity>
        </View>
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
        {editing ? (
          <>
            <TextInput
              style={styles.editText}
              value={contents}
              onChangeText={setContents}
              multiline
              scrollEnabled={false}
            />
            <View style={styles.footer}>
              <Text style={styles.characterCounter}>
                {contents.length}/{maxCharacters} characters
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.entryText}>{dailyEntry.response}</Text>
        )}
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  characterCounter: {
    color: "#706645",
    flex: 1,
    fontFamily: "Poppins",
    fontSize: 14,
    marginBottom: 25,
    marginLeft: 27,
    marginRight: 20,
    marginTop: 25,
    textAlign: "right",
    justifyContent: "flex-end",
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
    color: "#706645",
    flexDirection: 'row',
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 15,
  },
  deleteImage: {
    height: 30,
    width: 30,
  },
  editImage: {
    height: 28,
    width: 28,
  },
  editText: {
    alignSelf: "center",
    color: "#3C4444",
    fontFamily: "Poppins",
    fontSize: 14,
    fontWeight: '600',
    height: 400,
    lineHeight: 24,
    paddingLeft: 9,
    textAlignVertical: "top",
    width: 346,
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
  footer: {
    flex: 1,
    marginBottom: 15,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#F0ECE0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 0,
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
