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
 * Interface representing a journal entry.
 */
interface JournalEntry {
  response: string;
  timestamp: Date | null;
}

/**
 * JournalEntryPage component fetches, displays, and allows editing or deletion of a journal entry.
 *
 * @returns {JSX.Element} The rendered journal entry page.
 */
export default function JournalEntryPage(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [contents, setContents] = useState<string>('');
  const wordCount: number = contents.trim() ? contents.trim().split(/\s+/).length : 0;
  const maxWords = 1500;

  useEffect((): void => {
    /**
     * Fetches the journal entry from Firestore based on the provided ID.
     *
     * @returns {Promise<void>}
     */
    const fetchJournalEntry = async (): Promise<void> => {
      if (!id) {
        console.error('No journal entry ID provided.');
        return;
      }
      setLoading(true);
      try {
        const docRef = doc(FIRESTORE_DB, 'journal-responses', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setJournalEntry({
            response: data.response || '',
            timestamp: data.timestamp ? data.timestamp.toDate() : null,
          });
        } else {
          console.log('No such document!');
          // Optionally, redirect or show an error message.
        }
      } catch (error) {
        console.error('Error fetching journal entry:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJournalEntry();
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
   * Enables editing mode and sets the current entry response as editable content.
   *
   * @param entry - The current entry response.
   * @returns {Promise<void>}
   */
  const enableEdit = async (entry: string): Promise<void> => {
    setEditing(true);
    setContents(entry);
  };

  /**
   * Handles editing the journal entry. Validates word count before updating Firestore.
   *
   * @returns {Promise<void>}
   */
  const handleEdit = async (): Promise<void> => {
    if (!id || !journalEntry) {
      console.error('No journal entry ID provided or entry not loaded.');
      return;
    }
    if (wordCount > maxWords) {
      Alert.alert(
        'Woah, slow your roll!',
        'Please enter an entry that is between 50 and 1500 words.'
      );
      return;
    }
    Alert.alert(
      'Edit Journal Entry',
      'Are you sure you want to edit this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async (): Promise<void> => {
            try {
              const docRef = doc(FIRESTORE_DB, 'journal-responses', id);
              await updateDoc(docRef, { response: contents });
              setEditing(false);
              setJournalEntry({
                response: contents,
                timestamp: journalEntry.timestamp,
              });
            } catch (error) {
              console.error('Error editing document: ', error);
            }
          },
        },
      ]
    );
  };

  /**
   * Handles deletion of the journal entry from Firestore.
   *
   * @returns {Promise<void>}
   */
  const handleDelete = async (): Promise<void> => {
    if (!id || !journalEntry) {
      console.error('No journal entry ID provided or entry not loaded.');
      return;
    }
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async (): Promise<void> => {
            try {
              const docRef = doc(FIRESTORE_DB, 'journal-responses', id);
              await deleteDoc(docRef);
              console.log('Document successfully deleted!');
              // Navigate back to the entries page for the same date.
              const entryDate = journalEntry.timestamp
                ? format(journalEntry.timestamp, 'yyyy-MM-dd')
                : format(new Date(), 'yyyy-MM-dd');
              router.replace(`/(entries)/entries?date=${entryDate}`);
            } catch (error) {
              console.error('Error removing document: ', error);
            }
          },
        },
      ]
    );
  };

  /**
   * Formats the given timestamp into a full date string.
   *
   * @param timestamp - The timestamp to format.
   * @returns {JSX.Element | string} The formatted date as a JSX element or an empty string.
   */
  const formatDateFull = (timestamp: Date | null): JSX.Element | string => {
    if (!timestamp) return '';
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
   * Formats the given timestamp into a short time string.
   *
   * @param timestamp - The timestamp to format.
   * @returns {string} The formatted time string.
   */
  const formatTime = (timestamp: Date | null): string => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading journal entry...</Text>
      </View>
    );
  }

  if (!journalEntry) {
    return (
      <View style={styles.container}>
        <Text>Journal entry not found.</Text>
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
            <TouchableOpacity onPress={() => enableEdit(journalEntry.response)}>
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
        {formatDateFull(journalEntry.timestamp)}

        {/* Journal Label and Time */}
        <View style={styles.journalInfoContainer}>
          <Text style={styles.journalLabel}>JOURNAL</Text>
          <Text style={styles.timeText}>{formatTime(journalEntry.timestamp)}</Text>
        </View>

        {/* Journal Entry */}
        <Text style={styles.sectionTitle}>Journal Entry:</Text>
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
              <View style={styles.wordCount}>
                <Text
                  style={[
                    styles.maxWordDisplay,
                    wordCount > maxWords ? { color: 'red' } : { color: '#706645' },
                  ]}
                >
                  {wordCount}/{maxWords} words
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.entryText}>{journalEntry.response}</Text>
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
  deleteImage: {
    height: 30,
    width: 30,
  },
  editImage: {
    height: 28,
    width: 28,
  },
  editText: {
    alignSelf: 'center',
    color: '#3C4444',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    height: 400,
    lineHeight: 24,
    paddingLeft: 9,
    textAlignVertical: 'top',
    width: 346,
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
    backgroundColor: '#F0ECE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 0,
  },
  journalInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  journalLabel: {
    color: '#706645CC',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '400',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  maxWordDisplay: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#706645',
  },
  timeText: {
    color: '#706645CC',
    fontFamily: 'Poppins',
    fontSize: 13,
  },
  wordCount: {
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 25,
    marginLeft: 27,
    marginRight: 27,
    marginTop: 25,
  },
  sectionTitle: {
    color: '#706645',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 5,
  },
});
