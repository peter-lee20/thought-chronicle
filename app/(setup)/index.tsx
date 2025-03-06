import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

/**
 * SignInScreen - Renders the sign-in page for user authentication.
 * @returns {JSX.Element} The SignInScreen component.
 */
export default function SignInScreen(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const AUTH = FIREBASE_AUTH;

  /**
   * Redirects the user to the forgot password screen.
   */
  const handleForgotPassword = (): void => {
    router.replace("/forgot");
  };

  /**
   * Handles user sign-in using Firebase authentication.
   * Shows success or failure alerts based on the authentication result.
   */
  const handleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(AUTH, email, password);
      Alert.alert("Success", `Signed in as ${email}`);
      router.replace("/(tabs)/(home)/homepage");
    } catch (error) {
      Alert.alert("Error", "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Illustration */}
          <Image source={require('../../assets/images/illustration.png')} style={styles.illustration} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>Chronicle your thoughts</Text>
          <Text style={styles.subtitle}>Pause, reflect, grow.</Text>

          {/* Input Fields */}
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#7E948C"
            style={styles.inputField}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#7E948C"
            secureTextEntry
            style={styles.inputField}
          />

          {/* Forgot Password */}
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            disabled={isLoading}
            onPress={handleSignIn}
            style={styles.signInButton}
          >
            <Text style={styles.signInButtonText}>{isLoading ? "Signing in..." : "Sign in"}</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <Text style={styles.signUpText}>
            Don't have an account?{" "}
            <Link href="/signup" style={styles.signUpLink}>
              Sign up
            </Link>
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F0ECE0",
    flex: 1,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    width: "100%",
  },
  forgotPasswordText: {
    color: "#7E948C",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  illustration: {
    height: 200,
    marginBottom: 20,
    width: 250,
  },
  innerContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  inputField: {
    backgroundColor: "#F0ECE0",
    borderColor: "#7E948C",
    borderRadius: 15,
    borderWidth: 2,
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: "100%",
  },
  signInButton: {
    alignItems: "center",
    backgroundColor: "#7E948C",
    borderRadius: 15,
    marginTop: 20,
    paddingVertical: 18,
    width: "100%",
  },
  signInButtonText: {
    color: "#F0ECE0",
    fontSize: 16,
    fontWeight: "700",
  },
  signUpLink: {
    color: "#7E948C",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  signUpText: {
    color: "#666",
    fontSize: 14,
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    color: "#666",
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  title: {
    color: "#333",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
});
