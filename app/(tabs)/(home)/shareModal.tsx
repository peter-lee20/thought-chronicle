import { Image, Modal, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from "react";

interface OptionProps {
    image?: string | null;
    optionTitle: string;
    optionText: string;
    initValue: boolean;
}

const Option: React.FC<OptionProps> = ({ image, optionTitle, optionText, initValue }) => {
    const [isEnabled, setIsEnabled] = useState(initValue);

    return (
        <View style={styles.optionContainer}>

            {image != null && 
            <Image 
                style={styles.optionImage}
                source={require("../../../assets/images/global-icon.png")}
            />}

            <View>
                <Text style={styles.optionTitle}>{ optionTitle }</Text>
                <Text style={styles.optionText}>{ optionText }</Text>
            </View>

            <Switch
                value={isEnabled}
                onValueChange={() => setIsEnabled(!isEnabled)}
            />
        </View>
    );
};

interface ModalProps {
    isVisible: boolean,
    onClose: () => void,
}

const ShareModal: React.FC<ModalProps> = ({ isVisible, onClose }) => {

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isVisible}
                >
                    <TouchableWithoutFeedback onPress={onClose}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                                <View style={styles.modalContainer}>
                                    {/* <View style={styles.modalSliderIndicator} /> */}

                                    <Text style={styles.modalTitle}>Share</Text>
                                    
                                    <View style={styles.modalBody}>
                                        <Option 
                                            image="../../../assets/images/global-icon.png"
                                            optionTitle="Global Feed"
                                            optionText="Share your entry with the world"
                                            initValue={true}
                                        />

                                        <Option
                                            image={null}
                                            optionTitle="Anonymous"
                                            optionText="Share without giving your name"
                                            initValue={false}
                                        />

                                        <Option
                                            image="../../../assets/images/friends-icon.png"
                                            optionTitle="Friends"
                                            optionText="Share your entry with your friends"
                                            initValue={true}
                                        />
                                    </View>

                                    <View style={styles.modalFooter}>
                                        <Text style={styles.modalWarning}>*Your entry will be saved even if you don't share.</Text>

                                        <TouchableOpacity style={styles.modalSubmit}>
                                            <Text style={styles.modalSubmitText}>Submit</Text> 
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default ShareModal;

const styles = StyleSheet.create({
    modalBody: {
        alignSelf: "center",
        gap: 15,
        marginTop: 30,
        marginBottom: 70,
        width: "90%",
    },

    modalContainer: {
        backgroundColor: "#F0ECE0",
        borderRadius: 20,
        padding: 30,
    }, 

    modalSliderIndicator: {
        alignSelf: "center",
        backgroundColor: "#706645",
        borderRadius: 10,
        height: 4,
        marginBottom: 15,
        width: 60,
    },

    modalSubmit: {
        alignItems: "center",
        backgroundColor: "#7E948C",
        borderRadius: 14,
        paddingTop: 18,
        paddingBottom: 18,
        width: "100%",
    },

    modalSubmitText: {
        color: "#F0ECE0",
        fontSize: 16,
        fontWeight: 600,
    },

    modalTitle: {
        alignSelf: "center",
        color: "#706645",
        fontFamily: "Poppins",
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 30,
    },

    modalOverlay: {
        backgroundColor: "rgba(0,0,0,0.2)",
        borderColor: "black",
        borderWidth: 1,
        bottom: 0,
        flex: 1,
        justifyContent: "flex-end",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    modalFooter: {
        alignSelf: "center",
        width: "90%",
    },

    modalWarning: {
        color: "#706645",
        fontFamily: "Poppins",
        fontSize: 11,
        lineHeight: 16,
    },

    optionContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between"
    },

    optionImage: {
        height: "100%",
        resizeMode: "contain",
        width: "10%",
    },

    optionText: {
        color: "#706645",
        fontFamily: "Poppins",
        fontSize: 11,
        lineHeight: 17,
    },

    optionTitle: {
        color: "#706645",
        fontFamily: "Poppins",
        fontSize: 16,
        lineHeight: 24,
    },
});