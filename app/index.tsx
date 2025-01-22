import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      {/* Illustration */}
      <Image source={require('../assets/images/illustration.png')} style={styles.illustration} />

      {/* Title and Subtitle */}
      <Text style={styles.title}>Chronicle your thoughts</Text>
      <Text style={styles.subtitle}>Pause, reflect, grow.</Text>

      {/* Input Fields */}
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" placeholderTextColor = "#7E948C" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry={true} placeholderTextColor = "#7E948C" />

      {/* Forgot Password Link */}
      <TouchableOpacity>
        <Text style={[styles.forgotPassword, { textDecorationLine: 'underline' }]}>Forgot your password?</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity style={styles.signInButton}>
        <Text style={styles.signInButtonText}>Sign in</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <TouchableOpacity>
        <Text style={[styles.signUp, { color: '#666', fontWeight: 'normal', textAlign: 'center' }]}>Don't have an account?{' '}
<Text style ={[styles.signUp, {color: '#7E948C', fontWeight: 'bold', textDecorationLine: 'underline' }]}>Sign up</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0ECE0', //background color
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
    marginBottom: 10,
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
    borderWidth: 1,
    borderRadius: 5,
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
    backgroundColor: '#7E948C', // Olive green button color
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
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
