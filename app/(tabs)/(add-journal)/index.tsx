import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { FIRESTORE_DB } from '../../../FirebaseConfig';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';

export default function JournalEntry() {
    const [response, setResponse] = useState('');
    const currentDate = new Date();

    const backHome = () => {
        router.replace("/(home)/homepage");
    }

    const handleSubmitResponse = async () => {
        if (response.trim() === '') {
            Alert.alert("Please enter a response.");
            return;
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
            
            Alert.alert("Response submitted successfully!");
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
        <KeyboardAvoidingView style={styles.container} behavior="height" keyboardVerticalOffset={100}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <TouchableOpacity onPress={backHome}>
                    <Image source={require("../../../assets/images/close-button.png")} style={styles.close}/>
                </TouchableOpacity>
                <Text style={styles.prompt}>What are you currently feeling or experiencing?</Text>
                <TextInput
                    placeholder="Start writing..." 
                    placeholderTextColor="#b4bcbc"   
                    style={styles.input}
                    multiline={true}
                    value={response}
                    onChangeText={setResponse}
                />
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.finished} onPress={handleSubmitResponse}>
                        <Image source={require("../../../assets/images/check.png")} style={styles.check}/>
                    </TouchableOpacity>       
                </View>  
            </ScrollView>
        </KeyboardAvoidingView>
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
        width: 346,
    },

    footer: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "flex-end",
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
        marginBottom: 15
    },

    check: {
        resizeMode: "center"
    }
})