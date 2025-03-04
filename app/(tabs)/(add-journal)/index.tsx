import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { FIRESTORE_DB } from '../../../FirebaseConfig';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';

const callPromptFunc = async () => {
    try {
        const user = FIREBASE_AUTH.currentUser;
        if (!user) throw new Error('User not authenticated');
    
        const idToken = await user.getIdToken();
    
        const response = await fetch('https://fetchprompt-bdm3hcghyq-uc.a.run.app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ message: 'Authenticated request' }),
        });
    
        const data = await response.json();
        return data
      } catch (error) {
        console.error('Error calling protected function:', error);
      }
}

export default function JournalEntry() {
    const[prompt, setPrompt] = useState("What are you currently feeling or experiencing?")
    const [response, setResponse] = useState('');
    const wordCount = response.trim() ? response.trim().    split(/\s+/).length : 0;
    const currentDate = new Date();
    const maxWords = 1500;

    const backHome = () => {
        router.replace("/(home)/homepage");
    }

    const getPrompt = async () => {
        const string = await callPromptFunc();
        setPrompt(string);
        
    }

    const handleSubmitResponse = async () => {

        if (wordCount > maxWords) {
            Alert.alert("Woah, slow your roll!", "Please enter an entry that is between 50 and 1500 words.");
        }
        
        try {
          // Get the current user's UID from Firebase Auth
          const user = FIREBASE_AUTH.currentUser;
    
          if (user) {
            // Save to Firestore
            await addDoc(collection(FIRESTORE_DB, 'journal-responses'), {
              response: response,
              date: currentDate.toLocaleDateString(),
              timestamp: new Date(),
              userId: user.uid, // Track the user who submitted the response
            });

            router.replace("/(add-journal)/confirmation");
            setResponse(''); // Clear input after submission
          } else {
            Alert.alert("You need to be logged in to submit a response.");
          }
        } catch (error) {
          console.error(error);
          Alert.alert("Failed to submit response. Please try again.");
        }
      }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "#F0ECE0"}}>
        <KeyboardAvoidingView style={styles.container} behavior="height" keyboardVerticalOffset={100}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <TouchableOpacity onPress={backHome}>
                    <Image source={require("../../../assets/images/close-button.png")} style={styles.close}/>
                </TouchableOpacity>
                <Text style={styles.prompt}>{prompt}</Text>

                <TextInput
                    placeholder="Start writing..." 
                    placeholderTextColor="#b4bcbc"   
                    style={styles.input}
                    multiline={true}
                    value={response}
                    onChangeText={setResponse}
                />
                <View style={styles.footer}>
                    <View style={styles.wordCount}>
                        <Text style={[styles.maxWordDisplay, wordCount > maxWords ? { color: "red" } : {color: "#706645" }]}>
                            {wordCount}/{maxWords} words
                        </Text>
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.help} onPress={getPrompt}>
                            <Image source={require("../../../assets/images/fire.png")} style={styles.check}/>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.finished} onPress={handleSubmitResponse}>
                            <Image source={require("../../../assets/images/check.png")} style={styles.check}/>
                        </TouchableOpacity>   
                    </View>
                </View>  
            </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0ECE0"
    },

    close: {
        resizeMode: "cover",
        width: 30, 
        height: 30,
        marginLeft: 10,
        marginTop: 10,
    },

    prompt: {
        alignSelf: "center",
        fontFamily: "Poppins",
        fontSize: 16,
        fontWeight: 400, 
        color: "#706645",
        paddingLeft: 9,
        borderLeftColor: "#706645",
        borderLeftWidth: 2,
        marginTop: 20,
        marginBottom: 25,
        width: 346,
    },

    input: {
        alignSelf: "center",
        fontFamily: "Poppins",
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 24,
        color: "#3C4444",
        paddingLeft: 9,
        borderLeftColor: "#3C4444",
        borderLeftWidth: 2,
        textAlignVertical: "top",
        width: 346,
        height: 400,
    },

    footer: {
        flex: 1,
        marginBottom: 15,
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
    
    buttons: {
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexDirection: "row",
    },

    help: {
        backgroundColor: '#F0ECE0', 
        borderColor: '#706645CC',
        borderWidth: 2,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 27,
    },

    finished: {
        // position: "absolute",
        // right: 27,
        // bottom: 15,
        // alignSelf: "flex-end",
        backgroundColor: '#7E948C', 
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 27,
    },

    check: {
        resizeMode: "center"
    },
})