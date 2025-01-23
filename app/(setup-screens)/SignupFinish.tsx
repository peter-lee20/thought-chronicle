import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'

export default function index() {
    return (
        <View style={styles.container}>
            <Image style={styles.image} source={require("../assets/images/setup-finish.png")}></Image>
            <Text style={styles.heading}>Congrats!</Text>
            <Text style={styles.text}>
                You've finished creating your account! Please check your email
                to verify your account and start your journey.
            </Text>
            <TouchableOpacity>
                <Text style={styles.button}>Sign in</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        fontFamily: "Poppins",
        backgroundColor: "#F0ECE0",
        color: "#3C4444",
        justifyContent: "center",
        alignItems: "center"
    },

    image: {
        width: 152,
        height: 151
    },

    heading: {
        fontWeight: 700,
        fontSize: 24,
        lineHeight: 36,
        marginTop: 26,
        marginBottom: 26,
    },

    text: {
        fontSize: 15,
        lineHeight: 22.5,
        textAlign: "center",
        maxWidth: "77%",
        marginBottom: 26
    },

    button: {
        backgroundColor: "#7E948C",
        color: "#F0ECE0",
        textAlign: "center",
        fontWeight: 600,
        fontSize: 16,
        width: 352,
        borderRadius: 14,
        padding: 18
    }
})