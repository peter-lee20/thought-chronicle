import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { Link } from 'expo-router';
import { connectAuthEmulator } from 'firebase/auth';

export default function forgot() {
    return (
    <View style={styles.container}>
        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.text}>Enter the email associated with your account and we will send you password reset instructions.</Text>
        <TextInput 
            style={styles.input}
            placeholder='Email'/>
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Send Reset Instructions</Text>
        </TouchableOpacity>
        <Text style={styles.footer}>
            Return to <Link href="/(setup)" style={styles.footerLink}>Sign In</Link>
        </Text>
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0ECE0",
        alignContent: "center",
        justifyContent: "center"
    },

    title: {
        //fontFamily: "Poppins",
        color: "#333",
        fontSize: 24,
        fontWeight: 700,
        textAlign: "center",
        lineHeight: 36,
    },

    text: {
        //fontFamily: "Poppins",
        color: "#333",
        fontSize: 15, 
        fontWeight: 400,
        textAlign: "center",
        alignSelf: "center",
        marginTop: 34,
        marginBottom: 34,
        maxWidth: 303
    },

    input: {
        fontSize: 16,
        lineHeight: 24,
        borderColor: "#7E948C",
        borderWidth: 2,
        borderRadius: 14,
        alignSelf: "center",
        justifyContent: "center",
        width: 352,
        height: 55,
        // paddingTop: 9,
        // paddingBottom: 9,
        paddingLeft: 15,
        marginBottom: 34
    },

    button: {
        backgroundColor: "#7E948C",
        width: 352,
        height: 66,
        alignSelf: "center",
        justifyContent: "center",
        borderRadius: 14,
    },

    buttonText: {
        fontSize: 16,
        fontWeight: 600,
        color: "#F0ECE0",
        textAlign: "center",
        lineHeight: 24
    },

    footer: {
        color: "#333",
        fontSize: 15,
        lineHeight: 22.5,
        textAlign: "center",
        marginTop: 34
    },

    footerLink: {
        fontWeight: 600,
        color: "#7E948C",
        textDecorationLine: "underline"
    }
});