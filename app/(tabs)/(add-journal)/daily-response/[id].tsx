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
import { useLocalSearchParams, router} from 'expo-router';
import { FIRESTORE_DB } from '../../../../FirebaseConfig';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
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
  const [editing, setEditing] = useState(false);
  const [contents, setContents] = useState<string>("");
  const maxCharacters = 1500;

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

  const enableEdit = async (entry: string) => {
    setEditing(true);
    setContents(entry);
  }

  const handleEdit = async () => {
    if (!id || !dailyEntry) {
      console.error("No daily question entry ID provided or entry not loaded.");
      return;
    }

    // Enforce character limit
    if (contents.length > maxCharacters) {
      Alert.alert(
        `Response exceeds the maximum limit of ${maxCharacters} characters.`
      );

      return;
    }
    Alert.alert(
      "Edit Daily Question Response",
      "These edits will be visible to everyone who can see this response. Are you sure you want to edit this entry?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "OK", 
          onPress: async () => {
            try {
              const docRef = doc(FIRESTORE_DB, "daily-question-responses", id);
              await updateDoc(docRef, {
                response: contents,
              });

              setEditing(false);
              setDailyEntry({
                question: dailyEntry.question,
                response: contents,
                timestamp: dailyEntry.timestamp,
              });
            } catch (error) {
              console.error("Error editing document: ", error);
            }
          }
        }
      ]
    );
    
  }
  const handleDelete = async () => {
    if (!id || !dailyEntry) {
      console.error("No daily question entry ID provided or entry not loaded.");
      return;
    }
  
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "OK", 
          onPress: async () => {
            try {
              const docRef = doc(FIRESTORE_DB, "daily-question-responses", id);
              await deleteDoc(docRef);
              console.log("Document successfully deleted!");
              // Navigate back to the entries page for the same date
              const entryDate = dailyEntry.timestamp 
                ? format(dailyEntry.timestamp, "yyyy-MM-dd")
                : format(new Date(), "yyyy-MM-dd");
              router.replace(`/(entries)/entries?date=${entryDate}`);
            } catch (error) {
              console.error("Error removing document: ", error);
            }
          }
        }
      ]
    );
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
        <View style={styles.buttonContainer}>

          {editing ? <TouchableOpacity onPress={handleEdit}>
            <Image
              source={require('../../../../assets/images/journal-check.png')}
              resizeMode="contain"
              style={styles.editImage}
            />
          </TouchableOpacity> 

          : <TouchableOpacity onPress={() => enableEdit(dailyEntry.response)}>
            <Image
              source={require('../../../../assets/images/edit.png')}
              resizeMode="contain"
              style={styles.editImage}
            />
          </TouchableOpacity>}
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

        {editing ? <><TextInput
          style={styles.editText}
          value={contents}
          onChangeText={setContents}
          multiline
          scrollEnabled={false} />
          <View style={styles.footer}>
            <Text style={styles.characterCounter}>
              {contents.length}/{maxCharacters} characters
            </Text>
          </View></>

        : <Text style={styles.entryText}>{dailyEntry.response}</Text>}
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
    justifyContent: 'space-between',
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
  buttonContainer: {
    flexDirection: 'row', 
    gap: 10, 
  },
  characterCounter: {
    color: "#706645",
    flex: 1,
    fontFamily: "Poppins",
    fontSize: 14,
    marginTop: 25,
    marginLeft: 27,
    marginRight: 20,
    marginBottom: 25,
    textAlign: "right",
    justifyContent:  "flex-end",
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
  deleteImage: {
    height: 30,
    width: 30,
  },
  editImage: {
    height: 28,
    width: 28,
  },
  footer: {
    flex: 1,
    marginBottom: 15,
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

  wordCount: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent:  "flex-end",
    marginTop: 25,
    marginLeft: 27,
    marginRight: 27,
    marginBottom: 25,
},
  entryText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
    color: '#706645CC',
    fontFamily: 'Poppins',
  },
  editText: {
    alignSelf: "center",
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
    fontFamily: 'Poppins',
    color: "#3C4444",
    paddingLeft: 9,
    borderLeftColor: "#3C4444",
    borderLeftWidth: 2,
    width: 346,
    textAlignVertical: "top",
    height: 400,

  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
