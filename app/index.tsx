import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet, Alert, Image } from "react-native";
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';


export default function Index() {
 const [email, setEmail] = useState("");
 const [firstName, setFirstName] = useState("");
 const [lastName, setLastName] = useState("");
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [loading, setLoading] = useState(false);

 // Authentication
 const auth = FIREBASE_AUTH;


 const handleSignUp = async () => {
   if (password !== confirmPassword) {
     Alert.alert("Error", "Passwords do not match");
     return;
   }

   try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", `Account created for: ${firstName} ${lastName}`);
      console.log(response);
    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false)
}
   // Additional signup logic here
 };


 return (
   <View style={styles.container}>
     <Image
       source={require("../assets/images/signup-image.png")} // Replace with your image path
       style={styles.image}
     />
     <Text style={styles.heading}>Sign Up</Text>
     <TextInput
       style={styles.input}
       placeholder="Email"
       placeholderTextColor="#7E948C"
       value={email}
       onChangeText={setEmail}
       keyboardType="email-address"
     />
     <View style={styles.rowContainer}>
       <TextInput
         style={[styles.input, styles.halfInput]}
         placeholder="First Name"
         placeholderTextColor="#7E948C"
         value={firstName}
         onChangeText={setFirstName}
       />
       <TextInput
         style={[styles.input, styles.halfInput]}
         placeholder="Last Name"
         placeholderTextColor="#7E948C"
         value={lastName}
         onChangeText={setLastName}
       />
     </View>
     <TextInput
       style={styles.input}
       placeholder="Password"
       placeholderTextColor="#7E948C"
       value={password}
       onChangeText={setPassword}
       secureTextEntry
     />
     <TextInput
       style={styles.input}
       placeholder="Confirm Password"
       placeholderTextColor="#7E948C"
       value={confirmPassword}
       onChangeText={setConfirmPassword}
       secureTextEntry
     />
     <TouchableOpacity style={styles.button} onPress={handleSignUp}>
       <Text style={styles.buttonText}>Create Account</Text>
     </TouchableOpacity>
     <View style={styles.footer}>
       <Text style={styles.footerText}>Already have an account? </Text>
       <TouchableOpacity onPress={handleSignUp}>
         <Text style={styles.link}>Sign In</Text>
       </TouchableOpacity>
     </View>
   </View>
 );
}


const styles = StyleSheet.create({
 container: {
   flex: 1,
   justifyContent: "center",
   alignItems: "center",
   padding: 20,
   backgroundColor: "#F0ECE0",
 },
 image: {
   width: 150,
   height: 150,
   marginBottom: 20,
 },
 heading: {
   fontSize: 24,
   marginBottom: 20,
   color: "#333",
   fontFamily: "Poppins",
   fontWeight: "bold",
 },
 input: {
   width: "100%",
   padding: 15,
   marginBottom: 15,
   borderWidth: 2,
   borderColor: "#7E948C",
   borderRadius: 15,
   backgroundColor: "#F0ECE0",
   fontFamily: "Poppins",
 },
 rowContainer: {
   flexDirection: "row",
   justifyContent: "space-between",
   width: "100%",
 },
 halfInput: {
   width: "48%",
 },
 button: {
   backgroundColor: "#7E948C",
   paddingVertical: 20,
   paddingHorizontal: 20,
   borderRadius: 15,
   borderWidth: 1,
   borderColor: "#7E948C",
   alignItems: "center",
   width: "100%",
   marginTop: 20,
 },
 buttonText: {
   color: "white",
   fontSize: 16,
   fontWeight: "bold",
   fontFamily: "Poppins",
 },
 footer: {
   flexDirection: "row",
   alignItems: "center",
   justifyContent: "center",
   marginTop: 20,
 },
 footerText: {
   fontSize: 14,
   color: "#333",
   fontFamily: "Poppins",
 },
 link: {
   fontSize: 14,
   color: "#7E948C",
   fontWeight: "bold",
   textDecorationLine: "underline",
 },
});



