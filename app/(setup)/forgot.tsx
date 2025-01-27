import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function Forgot() {
  const [email, setEmail] = useState(''); 

  const handlePasswordReset = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert("Success", "Password reset instructions have been sent to your email.");
      })
      .catch((error) => {
        const errorMessage = error.message;
        Alert.alert("Error", errorMessage);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      <Text style={styles.text}>
        Enter the email associated with your account and we will send you password reset instructions.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Send Reset Instructions</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>
        Return to <Link href="/(setup)" style={styles.footerLink}>Sign In</Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0ECE0",
    alignContent: "center",
    justifyContent: "center",
  },
  title: {
    color: "#333",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 36,
  },
  text: {
    color: "#333",
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    alignSelf: "center",
    marginTop: 34,
    marginBottom: 34,
    maxWidth: 303,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    borderColor: "#7E948C",
    borderWidth: 2,
    borderRadius: 14,
    alignSelf: "center",
    justifyContent: "center",
    width: 352,
    height: 55,
    paddingLeft: 15,
    marginBottom: 34,
  },
  button: {
    backgroundColor: "#7E948C",
    width: 352,
    height: 66,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F0ECE0",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    color: "#333",
    fontSize: 15,
    lineHeight: 22.5,
    textAlign: "center",
    marginTop: 34,
  },
  footerLink: {
    fontWeight: "600",
    color: "#7E948C",
    textDecorationLine: "underline",
  },
});
