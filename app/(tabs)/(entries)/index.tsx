import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView, Alert, SafeAreaView, Modal, FlatList } from 'react-native'
import React, { useState } from 'react'
import { Calendar } from 'react-native-calendars';
import { router } from 'expo-router'
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { signOut } from 'firebase/auth';
import { TriangleDownFill } from 'akar-icons';
import { TouchableWithoutFeedback } from 'react-native';

export default function EntriesCalendar() {
    const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility

    const [selectedDate, setSelectedDate] = useState(new Date());
    const selectedYear: string = selectedDate.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: 'long'});


    const [modalVisible, setModalVisible] = useState(false);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }
    const pstDateString = new Intl.DateTimeFormat("en-CA", options).format(selectedDate);
    

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    }

    const handleSignOut = async () => {
        try {
            await signOut(FIREBASE_AUTH);
            Alert.alert('Signed out successfully!');
            router.replace("/(setup)");
            // Redirect to login screen or handle accordingly
        } catch (error) {
            console.error(error);
            Alert.alert('Failed to sign out. Please try again.');
        }
    };

    const handleMonthPress = (month: string) => {
        const monthIndex = months.indexOf(month) + 1;
        const newDate = `${selectedYear}-${monthIndex.toString().padStart(2, "0")}-01`;
        setSelectedDate(new Date(newDate));
        setModalVisible(false);
        console.log(newDate);
    };

    const MonthButton = ({item}: {item: string}) => {
        return (
            <TouchableOpacity style={styles.monthButtons} onPress={() => handleMonthPress}>
                <Text style={styles.monthButtonsText}>{item}</Text>
            </TouchableOpacity> 
        );
    };

    const dayComponent = ({ date }: {date: any}) => {
        return (
          <View style={styles.dayContainer}>
            {(pstDateString == date.dateString) ? (
                <View>
                    <Image
                        style={{ borderWidth: 2, borderColor: '#706645', borderRadius: 25}}
                        source={require('../../../assets/images/blank-circle-icon.png')} // Replace with your icon path 
                    />
                    <Text style={styles.selectedDayText}>{parseInt(date.dateString.split('-')[2],10)}</Text>
                </View>
            ) : (
                <View>
                    <Image
                        source={require('../../../assets/images/blank-circle-icon.png')} // Replace with your icon path
                    />
                    <Text style={styles.dayText}>{parseInt(date.dateString.split('-')[2],10)}</Text>
                </View>
            )}
          </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* header */}
            <View style={styles.header}>
                <View>
                <TouchableOpacity onPress={toggleDropdown}>
                    <Image
                    source={require('../../../assets/images/profile.png')}
                    style={styles.image}
                    resizeMode="contain"
                    />
                </TouchableOpacity>

                {showDropdown && (
                    <View style={styles.dropdownMenu}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={handleSignOut}>
                        <Text style={styles.dropdownText}>Sign Out</Text>
                    </TouchableOpacity>
                    </View>
                )}
                </View>
            </View>
            
            <View style={styles.body}>
                <View style={styles.dateContainer}>
                    <Text style={styles.date}>
                        { selectedYear }
                    </Text>
                    
                    <TouchableOpacity onPress={() => {setModalVisible(true)}}>
                        <Image
                            style={{ width: 20, height: 20 }} 
                            source={require("../../../assets/images/caret-down-solid.png")}
                        />
                    </TouchableOpacity>

                    <Modal
                        visible={modalVisible}
                        transparent={true}
                    >
                        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalYear}>{selectedDate.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric' })}</Text>
                                        <View style={styles.modalButtons}>
                                            <TouchableOpacity>
                                                <Image source={require("../../../assets/images/angle-left-solid.png")} style={styles.modalArrows}/>
                                            </TouchableOpacity>
                                            <TouchableOpacity>
                                                <Image source={require("../../../assets/images/angle-right-solid.png")} style={styles.modalArrows}/>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <FlatList
                                        data={months}
                                        renderItem={({item}) => <MonthButton item={item}/>}
                                        numColumns={4}
                                        contentContainerStyle={styles.monthGrid}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </TouchableOpacity>
                    </Modal>
                </View>
                

                <Calendar
                    style={styles.calendar}
                    theme={{
                        calendarBackground: '#F0ECE0',
                        dayTextColor: '#706645',
                        textSectionTitleColor: '#706645',
                        textDayHeaderFontFamily: 'Poppins',
                    }}
                    disableMonthChange={true}
                    enableSwipeMonths={false}
                    hideArrows={true}
                    hideExtraDays={true}
                    renderHeader={()=>null}
                    dayComponent={dayComponent}
                />
            </View>

            <View style={styles.footer}>
                <TouchableOpacity onPress={() => {router.replace('/(home)/homepage')}}>
                    <Image source={require('../../../assets/images/today.png')} style={styles.footerImage}resizeMode="contain" />
                </TouchableOpacity>
                    
                <TouchableOpacity>
                    <Image source={require('../../../assets/images/entries.png')} style={styles.footerImage} resizeMode="contain"/>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {router.replace('/(add-journal)/')}}>
                    <Image source={require('../../../assets/images/circle.png')} style={styles.footerImage} resizeMode="contain"/>
                    <Text style = {styles.plusSign}>+</Text>
                </TouchableOpacity>
                    
                <TouchableOpacity>
                    <Image source={require('../../../assets/images/feed.png')} style={styles.footerImage} resizeMode="contain"/>
                </TouchableOpacity>
                
                <TouchableOpacity>
                    <Image source={require('../../../assets/images/friends.png')} style={styles.footerImage} resizeMode="contain" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0ECE0',
        padding: 20,
    },
    
    // header styling
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 21,
        alignItems: 'center',
        marginBottom: 20,
    },
    
    image: {
        width: 40,
        height: 40,
    },

    dropdownMenu: {
        position: 'absolute',
        top: 50, // Position below the profile image
        right: 0,
        width: 100,
        backgroundColor: '#FFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
        zIndex: 10,
    },

    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },

    dropdownText: {
        color: '#706645',
        fontSize: 16,
        fontFamily: 'Poppins',
    },

    // body styling
    body: {
        paddingHorizontal: 10,
    },

    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 19,
    },

    date: {
        textAlign: "center",
        fontFamily: "Poppins",
        color: "#706645",
        fontSize: 24, 
        fontWeight: 600,
        lineHeight: 36,
        marginRight: 20,
    },

    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },

    modalContent: {
        width: 352,
        height: 242,
        borderRadius: 20,
        backgroundColor: "white",
        paddingLeft: 23,
        paddingRight: 23,
        paddingTop: 18,
        paddingBottom: 18,
    },

    modalHeader: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between"
    },

    modalYear: {
        fontFamily: "Poppins",
        fontSize: 32,
        fontWeight: 700,
        lineHeight: 48,
        color: "#706645",
    },

    modalButtons: {
        flex: 1,
        flexDirection: "row",
        gap: 8,
        justifyContent: "center",
    },

    modalArrows: {
        width: 20,
        height: 40
    },

    monthGrid: {
        flexDirection: "column",
        //flexWrap: "wrap",
        justifyContent: "space-evenly",
    },

    monthButtons: {
        backgroundColor: "#F0ECE0",
        width: 69,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
    },

    monthButtonsText: {
        color: "#706645",
        fontSize: 16, 
        fontWeight: 600,
    },

    calendar: {

    },

    dayContainer: {
        
    },

    selectedDayText: {
        fontFamily: "Poppins",
        fontSize: 13,
        backgroundColor: "#706645", 
        color: "#F0ECE0",
        textAlign: "center",
        marginTop: 8,
        borderRadius: 10,
    },

    dayText: {
        fontFamily: "Poppins",
        fontSize: 13,
        color: "#706645",
        textAlign: "center",
        marginTop: 8,
    },

    dayIcon: {
        
    },

    // footer styling
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 'auto', // Push footer to the bottom
        //paddingVertical: 20,
        backgroundColor: '#F0ECE0',
    },

    circleButton: {
        position: 'relative', // Make this container the reference for absolute positioning
        width: 50, // Adjust to match your circle image size
        height: 50, // Adjust to match your circle image size
        justifyContent: 'center',
        alignItems: 'center',
    },

    plusSign: {
        marginLeft: 15.5,
        marginTop: 4,
        position: 'absolute',
        fontSize: 30, // Adjust size as needed
        color: 'white', // Adjust color as needed
        fontWeight: '400', // Make the plus sign bold if needed
    },

    footerImage: {
        width: 50,
        height: 50,
    }, 
});

