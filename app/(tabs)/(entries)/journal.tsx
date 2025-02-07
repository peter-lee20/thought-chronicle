import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

export default function Journal() {
    return (
        <View style={styles.container}>
            <View style={styles.toolbar}>
                <Image style={styles.backIcon}/>
                <Image style={styles.trashIcon}/>
                <Image style={styles.shareIcon}/>
            </View>
            <Text style={styles.journalDate}></Text>
            <View style={styles.entryInfo}>
                <Text style={styles.entryType}>Journal</Text>
                <Text style={styles.entryTime}></Text>
            </View>
            <Text style={styles.journalText}></Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {

    },

    toolbar: {

    },

    backIcon: {

    },

    trashIcon: {

    },

    shareIcon: {

    },

    journalDate: {

    }, 
    
    entryInfo: {

    },

    entryType: {

    },

    entryTime: {

    },

    journalText: {
        
    }
});