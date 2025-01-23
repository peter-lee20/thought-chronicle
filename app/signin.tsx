import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Alert } from 'react-native';
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function App() {
   const [email, setEmail] = useState("");
   const [firstName, setFirstName] = useState("");
   const [lastName, setLastName] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [loading, setLoading] = useState(false);

   // Authentication
  const auth = FIREBASE_AUTH;

  const handleSignIn = async () => {
    setLoading(true);
    try {
        const response = await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Success", `Signed in as ${firstName} ${lastName}`);
        console.log(response);

    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
  }
  }
  return (
    <View style={styles.container}>
      {/* Illustration */}
      <Image source={require('../assets/images/illustration.png')} style={styles.illustration} />

      {/* Title and Subtitle */}
      <Text style={styles.title}>Chronicle your thoughts</Text>
      <Text style={styles.subtitle}>Pause, reflect, grow.</Text>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        placeholderTextColor="#7E948C"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        placeholderTextColor="#7E948C"
      />

      {/* Forgot Password Link */}
      <View style={{ width: '100%' }}>
        <TouchableOpacity>
          <Text style={[styles.forgotPassword, { textDecorationLine: 'underline' }]}>
            Forgot your password?
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity style={styles.signInButton}>
        <Text style={styles.signInButtonText}>Sign in</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <TouchableOpacity>
        <Text
          style={[
            styles.signUp,
            { color: '#666', fontWeight: 'normal', textAlign: 'center' },
          ]}
        >
          Don't have an account?{' '}
          <Text
            style={[
              styles.signUp,
              {
                color: '#7E948C',
                fontWeight: 'bold',
                textDecorationLine: 'underline',
              },
            ]}
          >
            Sign up
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0ECE0', // background color
    padding: 20,
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#7E948C',
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#F0ECE0',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#7E948C',
    marginBottom: 20,
    textAlign: 'right',
    width: '100%', 
    fontWeight: 'bold',
  },
  signInButton: {
    width: '100%',
    height: 50,
    paddingVertical: 20, 
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#7E948C',
    borderColor: '#7E948C',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginTop: 20,
  },
  signInButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  signUp: {
    fontSize: 14,
    color: '#7E948C',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
