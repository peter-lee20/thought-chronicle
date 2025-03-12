import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

/**
 * Verification component displays a confirmation message and a sign-in button.
 *
 * @returns {JSX.Element} The rendered verification screen.
 */
export default function Verification(): JSX.Element {
  /**
   * Navigates the user to the sign-in screen.
   */
  const goToSignIn = (): void => {
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/images/setup-finish.png")}
      />
      <Text style={styles.heading}>Congrats!</Text>
      <Text style={styles.text}>
        You've finished creating your account! Please check your email to verify your account and start your journey.
      </Text>
      <TouchableOpacity onPress={goToSignIn}>
        <Text style={styles.button}>Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#7E948C",
    borderRadius: 14,
    color: "#F0ECE0",
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "600",
    padding: 18,
    textAlign: "center",
    width: 352,
  },
  container: {
    alignItems: "center",
    backgroundColor: "#F0ECE0",
    color: "#3C4444",
    flex: 1,
    fontFamily: "Poppins",
    justifyContent: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 36,
    marginBottom: 26,
    marginTop: 26,
  },
  image: {
    height: 151,
    width: 152,
  },
  text: {
    fontSize: 15,
    lineHeight: 22.5,
    marginBottom: 26,
    maxWidth: "77%",
    textAlign: "center",
  },
});
