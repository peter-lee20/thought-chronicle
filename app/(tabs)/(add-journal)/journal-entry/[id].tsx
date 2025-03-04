// app/(add-journal)/journal-entry/[id].tsx
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    TextInput
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FIRESTORE_DB } from '../../../../FirebaseConfig';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { format } from "date-fns";
import { Stack } from "expo-router"

interface JournalEntry {
    response: string;
    timestamp: Date | null;
}

export default function JournalEntryPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [contents, setContents] = useState<string>("");
    const wordCount = contents.trim() ? contents.trim().    split(/\s+/).length : 0;
    const minWords = 50;
    const maxWords = 1500;

    useEffect(() => {
        const fetchJournalEntry = async () => {
            if (!id) {
                console.error("No journal entry ID provided.");
                return;
            }

            setLoading(true);
            try {
                const docRef = doc(FIRESTORE_DB, "journal-responses", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setJournalEntry({
                        response: data.response || "",
                        timestamp: data.timestamp ? data.timestamp.toDate() : null,
                    });
                } else {
                    console.log("No such document!");
                    // Optionally, redirect or show an error message
                }
            } catch (error) {
                console.error("Error fetching journal entry:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJournalEntry();
    }, [id]);

    const goBack = () => {
        router.back(); // Navigates to the previous screen
    };
    const enableEdit = async (entry: string) => {
        setEditing(true);
        setContents(entry);
    }
    
    const handleEdit = async () => {
        if (!id || !journalEntry) {
          console.error("No journal entry ID provided or entry not loaded.");
          return;
        }
        // Handle cases for word count
        if (wordCount < minWords) {
          Alert.alert("Go ahead, express yourself!", "Please enter an entry that is between 50 and 1500 words.");
          return;
        }

        if (wordCount > maxWords) {
          Alert.alert("Woah, slow your roll!", "Please enter an entry that is between 50 and 1500 words.");
          return;
        }
        Alert.alert(
          "Edit Journal Entry",
          "Are you sure you want to edit this entry?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            { 
              text: "OK", 
              onPress: async () => {
                try {
                  const docRef = doc(FIRESTORE_DB, "journal-responses", id);
                  await updateDoc(docRef, {
                    response: contents,
                  });
    
                  setEditing(false);
                  setJournalEntry({
                    response: contents,
                    timestamp: journalEntry.timestamp,
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
        if (!id || !journalEntry) {
          console.error("No journal question entry ID provided or entry not loaded.");
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
                  const docRef = doc(FIRESTORE_DB, "journal-responses", id);
                  await deleteDoc(docRef);
                  console.log("Document successfully deleted!");
                  // Navigate back to the entries page for the same date
                  const entryDate = journalEntry.timestamp 
                    ? format(journalEntry.timestamp, "yyyy-MM-dd")
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
        const day = format(timestamp, "d"); // Use "d" instead of "dd" to remove leading zero
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
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Image
                        source={require('../../../../assets/images/back_arrow.png')} // Replace with your back arrow icon
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
                    
                              : <TouchableOpacity onPress={() => enableEdit(journalEntry.response)}>
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
                {formatDateFull(journalEntry.timestamp)}

                {/* Journal Label and Time */}
                <View style={styles.journalInfoContainer}>
                    <Text style={styles.journalLabel}>JOURNAL</Text>
                    <Text style={styles.timeText}>{formatTime(journalEntry.timestamp)}</Text>
                </View>

                {/* Journal Entry */}
                {editing ?
                <><TextInput
              style={styles.editText}
              value={contents}
              onChangeText={setContents}
              multiline
              scrollEnabled={false} />
              <View style={styles.footer}>
                <View style={styles.wordCount}>
                  <Text style={[styles.minWordDisplay, wordCount < minWords ? { color: "red" } : { color: "#706645" }]}>
                    Minimum {wordCount}/{minWords} words
                  </Text>
                  <Text style={[styles.maxWordDisplay, wordCount > maxWords ? { color: "red" } : { color: "#706645" }]}>
                    Maximum {wordCount}/{maxWords} words
                  </Text>
                </View>
              </View></>
                : <Text style={styles.entryText}>{journalEntry.response}</Text>}
                
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
        flexDirection: 'row', // Added to ensure inline rendering
        alignItems: 'flex-start', // Align items to the top
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
    minWordDisplay: {
      fontFamily: "Poppins",
      fontSize: 14,
      color: "#706645",
      // textAlign: "center",
    },

    maxWordDisplay: {
        fontFamily: "Poppins",
        fontSize: 14,
        color: "#706645",
        // textAlign: "center"
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

    boldDay: {
        fontWeight: 'bold',
    },
    journalInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    journalLabel: {
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
    entryText: {
        fontSize: 14,
        fontWeight: 600,
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
