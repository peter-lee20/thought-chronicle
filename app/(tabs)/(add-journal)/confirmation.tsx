import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

/**
 * Confirmation component displays a confirmation message after a journal entry is completed,
 * and provides a button to navigate back to the home page.
 *
 * @returns {JSX.Element} The rendered confirmation screen.
 */
export default function confirmation() {
    /**
   * Navigates the user back to the home page.
   *
   * @returns {void}
   */
    const backHome = () => {
        router.replace("/(home)/homepage");
    }

    return (
    <View style={styles.container}>
        <Image source={require('../../../assets/images/confirm-image.png')} style={styles.image}/>
        <Text style={styles.title}>Congrats!</Text>
        <Text style={styles.subtitle}>You've completed your journal entry!</Text>
        <TouchableOpacity onPress={backHome} style={styles.button}>
            <Text style={styles.buttonText}>Back to Home Page</Text>
        </TouchableOpacity>
    </View>
    )
}

const styles = StyleSheet.create({
    button: {
      backgroundColor: "#7E948C",
      borderRadius: 14,
      padding: 18,
      width: 352,
    },
    buttonText: {
      color: "#F0ECE0",
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    container: {
      alignItems: "center",
      backgroundColor: "#F0ECE0",
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
    },
    image: {
      height: 250,
      width: 210,
    },
    subtitle: {
      color: "#3C4444",
      fontFamily: "Poppins",
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 24,
      marginBottom: 50,
    },
    title: {
      color: "#3C4444",
      fontFamily: "Poppins",
      fontSize: 24,
      fontWeight: "700",
      lineHeight: 36,
      marginTop: 50,
    },
  });