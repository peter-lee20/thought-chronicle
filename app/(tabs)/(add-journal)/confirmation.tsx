import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

export default function confirmation() {
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
    container: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F0ECE0",
    },

    image: {
        width: 210,
        height: 250
    },

    title: {
        fontFamily: "Poppins",
        color: "#3C4444",
        fontSize: 24,
        fontWeight: 700,
        lineHeight: 36,
        marginTop: 50,
    },

    subtitle: {
        fontFamily: "Poppins",
        color: "#3C4444",
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 24,
        marginBottom: 50,
    }, 

    button: {
        backgroundColor: "#7E948C",
        width: 352,
        borderRadius: 14,
        padding: 18,
    },

    buttonText: { 
        textAlign: "center",
        color: "#F0ECE0",
        fontWeight: 600,
        fontSize: 16,
    }
});