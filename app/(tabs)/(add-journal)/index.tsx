import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function JournalEntry() {
    const backHome = () => {
        router.replace("/(home)/homepage");
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior="height" keyboardVerticalOffset={100}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <TouchableOpacity onPress={backHome}>
                    <Image source={require("../../../assets/images/close-button.png")} style={styles.close}/>
                </TouchableOpacity>
                <Text style={styles.prompt}>What are you currently feeling or experiencing?</Text>
                <TextInput
                    placeholder="Start writing..." 
                    placeholderTextColor="#3C4444"   
                    style={styles.input}
                    multiline={true}
                />
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.help}>
                        <Image source={require("../../../assets/images/fire.png")} style={styles.check}/>
                    </TouchableOpacity>    

                    <TouchableOpacity style={styles.finished}>
                        <Image source={require("../../../assets/images/check.png")} style={styles.check}/>
                    </TouchableOpacity>   
                </View>  
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0ECE0"
    },

    close: {
        resizeMode: "cover",
        width: 30, 
        height: 30,
        marginLeft: 10,
        marginTop: 10,
    },

    prompt: {
        alignSelf: "center",
        fontFamily: "Poppins",
        fontSize: 16,
        fontWeight: 400, 
        color: "#706645",
        paddingLeft: 9,
        borderLeftColor: "#706645",
        borderLeftWidth: 2,
        marginTop: 20,
        marginBottom: 25,
        width: 346,
    },

    input: {
        alignSelf: "center",
        fontFamily: "Poppins",
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 24,
        color: "#3C4444",
        paddingLeft: 9,
        borderLeftColor: "#3C4444",
        borderLeftWidth: 2,
        width: 346,
    },

    footer: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexDirection: "row",
    },

    finished: {
        // position: "absolute",
        // right: 27,
        // bottom: 15,
        // alignSelf: "flex-end",
        backgroundColor: '#7E948C', 
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 27,
        marginBottom: 15
    },

    check: {
        resizeMode: "center"
    },

    help: {
        backgroundColor: '#F0ECE0', 
        borderColor: '#706645CC',
        borderWidth: 2,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 27,
        marginBottom: 15
    }
})