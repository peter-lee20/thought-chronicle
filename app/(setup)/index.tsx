import { Link, router } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";

/**
 * SignInScreen - Renders the sign-in page for user authentication.
 * @returns {JSX.Element} The SignInScreen component.
 */
export default function SignInScreen(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Firebase authentication token
  const auth = FIREBASE_AUTH;

  /**
   * Redirects the user to the forgot password screen.
   */
  const handleForgotPassword = () => {
    router.replace("/forgot");
  };

  /**
   * Handles user sign-in using Firebase authentication.
   * Shows success or failure alerts based on the authentication result.
   */
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);

      if (!response.user.emailVerified) {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before signing in.",
          [
            {
              text: "Send again",
              onPress: async () => await sendEmailVerification(response.user),
            },
            { text: "Ok" },
          ]
        );
        setLoading(false);
        return;
      }

      router.replace("/(tabs)/(home)/homepage");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Illustration */}
          <Image
            source={require("../../assets/images/illustration.png")}
            style={styles.illustration}
          />

          {/* Title and Subtitle */}
          <Text style={styles.title}>Chronicle your thoughts</Text>
          <Text style={styles.subtitle}>Pause, reflect, grow.</Text>

          {/* Input Fields */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#7E948C"
            onChangeText={setEmail}
            autoCorrect={false}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            placeholderTextColor="#7E948C"
            onChangeText={setPassword}
          />

          {/* Forgot Password Link */}
          <View style={{ width: "100%" }}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text
                style={[
                  styles.forgotPassword,
                  { textDecorationLine: "underline" },
                ]}
              >
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Sign in</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <TouchableOpacity>
            <Text
              style={[
                styles.signUp,
                { color: "#666", fontWeight: "normal", textAlign: "center" },
              ]}
            >
              Don't have an account?{" "}
              <Link
                href="/signup"
                style={[
                  styles.signUp,
                  {
                    color: "#7E948C",
                    fontWeight: "bold",
                    textDecorationLine: "underline",
                  },
                ]}
              >
                Sign up
              </Link>
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0ECE0",
    padding: 20,
  },

  forgotPassword: {
    fontSize: 14,
    color: "#7E948C",
    marginBottom: 20,
    textAlign: "right",
    width: "100%",
    fontWeight: "bold",
  },

  illustration: {
    width: 250,
    height: 200,
    marginBottom: 20,
  },

  input: {
    width: "100%",
    height: 50,
    borderColor: "#7E948C",
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#F0ECE0",
  },

  signInButton: {
    backgroundColor: "#7E948C",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#7E948C",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },

  signInButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },

  signUp: {
    fontSize: 14,
    color: "#7E948C",
    textAlign: "center",
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
});
