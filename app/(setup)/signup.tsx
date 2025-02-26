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
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

/**
 * Function that checks whether a provided username is valid (meaning that
 * it is unique from other usernames in the database and only contains
 * lowercase letters and numbers.
 *
 * @param username the string containing the username to be checked
 * @returns a boolean representign whether the username is valid
 */
const isValidUser = async (username: string) => {
  try {
    const sameUsernames = await getDocs(
      query(
        collection(FIRESTORE_DB, "users"),
        where("username", "==", username)
      )
    );
    const meetsCharReqs = /^[a-z1-9]{5,15}$/;

    if (!sameUsernames.empty) {
      Alert.alert("Error", "This username has been taken");
      return false;
    } else if (!meetsCharReqs.test(username)) {
      Alert.alert("Error", "Username does not meet all requirements");
      return false;
    }

    return true;
  } catch (error) {
    Alert.alert(
      "Error",
      "There was an error validating your username. Please try again later."
    );
    return false;
  }
};

// const UsernameRequirements = async (username: string) => {
//   const uniqueUser = await isUniqueUser(username);

//   const requirements = [
//     { label: "8+ characters", validator: (_ : string) => uniqueUser},
//   ];

//   return (
//     <View style={styles.requirementsGrid}>
//       {requirements.map((req, index) => (
//         <View key={index} style={styles.requirementItem}>
//           <Text
//             style={{
//               color: req.validator(username) ? "green" : "#7E948C", //#7E948C
//               fontSize: 14,
//             }}
//           >
//             {req.validator(username) ? "✓" : "✗"} {req.label}
//           </Text>
//         </View>
//       ))}
//     </View>
//   );
// }

const UsernameRequirements = ({ username }: { username: string }) => {
  const requirements = [
    {
      label: "5-15 characters",
      validator: (user: string) => user.length >= 5 && user.length <= 15,
    },
    {
      label: "Contains only lowercase letters and numbers",
      validator: (user: string) => /^[a-z1-9]*$/.test(user),
    },
  ];

  return (
    <View style={styles.requirementsGrid}>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementItem}>
          <Text
            style={{
              color: req.validator(username) ? "green" : "#7E948C", //#7E948C
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

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: "8+ characters", validator: (pwd) => pwd.length >= 8 },
    { label: "Uppercase letter", validator: (pwd) => /[A-Z]/.test(pwd) },
    { label: "Numeric character", validator: (pwd) => /[0-9]/.test(pwd) },
    {
      label: "Special character",
      validator: (pwd) => /[^a-zA-Z0-9]/.test(pwd),
    },
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
  const [username, setUsername] = useState("");
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
      Alert.alert("Success", `Account created for: ${firstName} ${lastName}`);

      // Store first and last name to Firestore
      await addDoc(collection(FIRESTORE_DB, "users"), {
        userId: response.user.uid,
        email: email,
        firstname: firstName,
        lastname: lastName,
        username: username,
        friends: [],
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Sign Up</Text>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // keyboardVerticalOffset={Platform.OS === "ios" ?  : 20}
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
      </KeyboardAvoidingView>

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
    </SafeAreaView>
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

  formContainer: {
    alignItems: "center",
    // flexGrow: 1,
    padding: 20,
    width: "100%",
  },

  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },

  heading: {
    fontSize: 24,
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
    width: "90%",
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

  requirementsContainer: {
    width: "100%",
    marginTop: -5,
    marginBottom: 10,
  },
});
