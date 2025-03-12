import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

/**
 * Interface representing the props for the PasswordRequirements component.
 */
interface PasswordRequirementsProps {
  password: string;
}

/**
 * Interface representing a single password requirement.
 */
interface Requirement {
  label: string;
  validator: (pwd: string) => boolean;
}

/**
 * Checks whether a provided username is valid. A valid username is unique in the
 * database and contains only lowercase letters and numbers.
 *
 * @param username - The username string to validate.
 * @returns {Promise<boolean>} A promise that resolves to true if valid, otherwise false.
 */
const isValidUser = async (username: string): Promise<boolean> => {
  try {
    const sameUsernames = await getDocs(
      query(
        collection(FIRESTORE_DB, "users"),
        where("username", "==", username)
      )
    );
    const meetsCharReqs = /^[a-z0-9]{5,15}$/;

    if (!sameUsernames.empty) {
      Alert.alert("Error", "This username has been taken");
      return false;
    } else if (!meetsCharReqs.test(username)) {
      Alert.alert("Error", "Username does not meet all requirements");
      return false;
    }

    return true;
  } catch (error: unknown) {
    Alert.alert(
      "Error",
      "There was an error validating your username. Please try again later."
    );
    return false;
  }
};

/**
 * Component that renders username requirements.
 *
 * @param props - The component props containing the username.
 * @returns {JSX.Element} The rendered username requirements.
 */
const UsernameRequirements = ({
  username,
}: {
  username: string;
}): JSX.Element => {
  const requirements = [
    {
      label: "5-15 characters",
      validator: (user: string): boolean =>
        user.length >= 5 && user.length <= 15,
    },
    {
      label: "Contains only lowercase letters and numbers",
      // Validator returns false when input is empty, so color changes only after typing starts.
      validator: (user: string): boolean =>
        user.length > 0 && /^[a-z0-9]*$/.test(user),
    },
  ];

  return (
    <View style={styles.requirementsGrid}>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementItem}>
          <Text
            style={{
              color: req.validator(username) ? "green" : "#7E948C",
              fontSize: 14,
            }}
          >
            {req.validator(username) ? "✓" : "✗"} {req.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

/**
 * Component that renders password requirements.
 *
 * @param props - The component props containing the password.
 * @returns {JSX.Element} The rendered password requirements.
 */
const PasswordRequirements = ({
  password,
}: PasswordRequirementsProps): JSX.Element => {
  const requirements: Requirement[] = [
    {
      label: "8+ characters",
      validator: (pwd: string): boolean => pwd.length >= 8,
    },
    {
      label: "Uppercase letter",
      validator: (pwd: string): boolean => /[A-Z]/.test(pwd),
    },
    {
      label: "Numeric character",
      validator: (pwd: string): boolean => /[0-9]/.test(pwd),
    },
    {
      label: "Special character",
      validator: (pwd: string): boolean => /[^a-zA-Z0-9]/.test(pwd),
    },
  ];

  return (
    <View style={styles.requirementsGrid}>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementItem}>
          <Text
            style={{
              color: req.validator(password) ? "green" : "#7E948C",
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

/**
 * Signup component that renders a sign-up form and handles account creation.
 *
 * @returns {JSX.Element} The rendered signup component.
 */
export default function Signup(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Firebase authentication token.
  const auth = FIREBASE_AUTH;

  /**
   * Validates the email format.
   *
   * @param email - The email string to validate.
   * @returns {boolean} True if valid, false otherwise.
   */
  const isValidEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  /**
   * Checks if the password meets the required criteria.
   *
   * @param pwd - The password string to validate.
   * @returns {boolean} True if the password meets all requirements, false otherwise.
   */
  const checkPasswordRequirements = (pwd: string): boolean => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^a-zA-Z0-9]/.test(pwd)
    );
  };

  /**
   * Handles the signup process including validation and account creation.
   *
   * @returns {Promise<void>} A promise that resolves when the signup process is complete.
   */
  const handleSignUp = async (): Promise<void> => {
    if (
      !email ||
      !firstName ||
      !lastName ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Missing fields");
      return;
    }

    const validUser = await isValidUser(username);
    if (!validUser) {
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
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(response.user);

      // Store first and last name, username, email, and userId to Firestore.
      await addDoc(collection(FIRESTORE_DB, "users"), {
        userId: response.user.uid,
        email: email,
        firstname: firstName,
        lastname: lastName,
        username: username,
        friends: [],
      });

      // Start storing streak for new user
      await setDoc(doc(FIRESTORE_DB, "userStreaks", response.user.uid), {
        currentStreak: 0,
        lastAnsweredDate: "N/A",
      });

      router.replace("/verification");
      console.log(response);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Sign Up</Text>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formContainer}
      >
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
          placeholder="Username"
          placeholderTextColor="#7E948C"
          value={username}
          onChangeText={setUsername}
        />

        <UsernameRequirements username={username} />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#7E948C"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Render Password Requirements */}
        <PasswordRequirements password={password} />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#7E948C"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </KeyboardAvoidingView>

      <TouchableOpacity
        style={[styles.button]}
        onPress={handleSignUp}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#7E948C",
    borderColor: "#7E948C",
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 20,
    width: "90%",
  },

  buttonText: {
    color: "white",
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "bold",
  },

  container: {
    alignItems: "center",
    backgroundColor: "#F0ECE0",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  formContainer: {
    alignItems: "center",
    padding: 20,
    width: "100%",
  },

  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  footerText: {
    color: "#333",
    fontFamily: "Poppins",
    fontSize: 14,
  },

  halfInput: {
    width: "48%",
  },

  heading: {
    color: "#333",
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "bold",
  },

  image: {
    height: 150,
    marginBottom: 20,
    width: 150,
  },

  input: {
    backgroundColor: "#F0ECE0",
    borderColor: "#7E948C",
    borderRadius: 15,
    borderWidth: 2,
    fontFamily: "Poppins",
    marginBottom: 15,
    padding: 15,
    width: "100%",
  },

  link: {
    color: "#7E948C",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  requirementItem: {
    width: "48%",
    marginBottom: 10,
  },

  requirementsContainer: {
    marginBottom: 10,
    marginTop: -5,
    width: "100%",
  },

  requirementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 2,
    marginTop: -5,
    width: "100%",
  },

  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
