import { Link, router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: "8+ characters", validator: (pwd) => pwd.length >= 8 },
    { label: "Uppercase letter", validator: (pwd) => /[A-Z]/.test(pwd) },
    { label: "Numeric character", validator: (pwd) => /[0-9]/.test(pwd) },
    { label: "Special character", validator: (pwd) => /[^a-zA-Z0-9]/.test(pwd) },
  ];

  return (
    <View style={styles.requirementsGrid}>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementItem}>
          <Text
            style={{
              color: req.validator(password) ? "green" : "#7E948C", //#7E948C
              fontSize: 14,
            }}
          >
            {req.validator(password) ? "✓" : "✗"} {req.label}
          </Text>
        </View>
      ))}
    </View>
  );
};


export default function Signup() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Firebase authentication token
  const auth = FIREBASE_AUTH;

  const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const checkPasswordRequirements = (pwd) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^a-zA-Z0-9]/.test(pwd)
    );
  };

  const handleSignUp = async () => {
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      Alert.alert("Error", "Missing fields");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Invalid email format");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!checkPasswordRequirements(password)) {
      Alert.alert("Error", "Password does not meet all requirements");
      return;
    }

    try {
      setLoading(true);
      const response = await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", `Account created for: ${firstName} ${lastName}`);

      // Store first and last name to Firestore
      await addDoc(collection(FIRESTORE_DB, "names"), {
        email,
        firstname: firstName,
        lastname: lastName,
      });

      router.replace("/verification");
      console.log(response);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={styles.container}
      >
        <Image
          source={require("../../assets/images/signup-image.png")}
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

        {/* Password Requirements */}
        <PasswordRequirements password={password} />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#7E948C"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={() => handleSignUp()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(setup)" style={styles.link}>
            Sign In
          </Link>
        </View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  requirementsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap", 
    justifyContent: "space-between",
    marginTop: -5,
    marginBottom: 2,
  },
  requirementItem: {
    width: "48%",
    marginBottom: 10, 
  },
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
    color:"#333",
    fontFamily: "Poppins",
   },
   link: {
    fontSize: 14,
    color: "#7E948C",
    fontWeight: "bold",
    textDecorationLine: "underline"},
    
    requirementsContainer: {
      width: "100%",
      marginTop: -5, 
      marginBottom: 10,
    },
});
