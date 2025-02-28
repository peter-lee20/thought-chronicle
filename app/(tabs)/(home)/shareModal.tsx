import { Image, ImageSourcePropType, Modal, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useEffect, useState } from "react";

interface OptionProps {
    disabled: boolean,
    image: ImageSourcePropType | null;
    optionTitle: string;
    optionText: string;
    currVal: boolean;
    onPress: () => void;
}

const Option: React.FC<OptionProps> = ({ disabled, image, optionTitle, optionText, currVal, onPress}) => {
    return (
        <View style={styles.optionContainer}> 
            <View style={styles.optionImageContainer}>
                {image && <Image style={styles.optionImage} source={image} />}
            </View>

            <View style={styles.optionTextContainer}>
                <View>
                    <Text style={[styles.optionTitle, disabled && {opacity: 0.5}]}>
                        { optionTitle }
                    </Text>

                    <Text style={[styles.optionText, disabled && {opacity: 0.5}]}>
                        { optionText }
                    </Text>
                </View>

                <Switch
                    value={currVal}
                    onValueChange={onPress}
                    disabled={disabled}
                />
            </View>
        </View>
    );
};

interface ModalProps {
    isVisible: boolean,
    isFirstSubmit: boolean,
    onClose: () => void,
    // onFirstSubmit: (options: { globalFeed: boolean, anonymous: boolean, friends: boolean}) => void,
    onSubmit: (options: { globalFeed: boolean, anonymous: boolean, friends: boolean}) => void,
}

const ShareModal: React.FC<ModalProps> = ({ isVisible, isFirstSubmit, onClose, onSubmit}) => {
    const [modalOverlayColor, setModalOverlayColor] = useState("rgba(0, 0, 0, 0.2)");
    const [options, setOptions] = useState({
        globalFeed: true,
        anonymous: false,
        friends: true,
    })

    const toggleOption = (key: keyof typeof options) => {
        setOptions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleModalClose = () => {
        setModalOverlayColor("transparent");
        onClose();
    }

    const handleModalSubmit = () => {
        onSubmit(options);
        onClose();
    }

    return (
        <SafeAreaView>
            <Modal
                animationType="none"
                transparent={true}
                visible={isVisible}
                onDismiss={() => setModalOverlayColor("rgba(0, 0, 0, 0.2)")}
            >
                <TouchableWithoutFeedback onPress={handleModalClose}>
                    <View style={[styles.modalOverlay, {backgroundColor: modalOverlayColor}]}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Share</Text>
                                
                                <View style={styles.modalBody}>
                                    <Option 
                                        disabled={false}
                                        image={require("../../../assets/images/global-icon.png")}
                                        optionTitle="Global Feed"
                                        optionText="Share your entry with the world"
                                        currVal={options.globalFeed}
                                        onPress={() => { 
                                            toggleOption("globalFeed");
                                            setOptions((prev) => ({
                                                ...prev,
                                                anonymous: false,
                                            }))
                                        }}
                                    />

                                    <Option
                                        disabled={!options.globalFeed}
                                        image={null}
                                        optionTitle="Anonymous"
                                        optionText="Remain completely anonymous"
                                        currVal={options.anonymous}
                                        onPress={() => toggleOption("anonymous")}
                                    />

                                    <Option
                                        disabled={false}
                                        image={require("../../../assets/images/friends-icon.png")}
                                        optionTitle="Friends"
                                        optionText="Share your entry with your friends"
                                        currVal={options.friends}
                                        onPress={() => toggleOption("friends")}
                                    />
                                </View>

                                <View style={styles.modalFooter}>
                                    <Text style={styles.modalWarning}>*Your entry will be saved even if you don't share.</Text>

                                    <TouchableOpacity style={styles.modalSubmit} onPress={handleModalSubmit}>
                                        {isFirstSubmit ? 
                                            (<Text style={styles.modalSubmitText}>Submit</Text>):
                                            // text is different depending on whether the user is submitting their response
                                            // or changing their settings
                                            (<Text style={styles.modalSubmitText}>Save</Text>)
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
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
        paddingBottom: 30,
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 30,
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
        flex: 1,
        justifyContent: "flex-end",
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
        justifyContent: "space-between",
    },

    optionImage: {
        height: "100%",
        resizeMode: "contain",
        width: 50,
    },

    optionImageContainer: {
        width: 65,
        height: 50,
    },

    optionText: {
        color: "#706645",
        fontFamily: "Poppins",
        fontSize: 11,
        lineHeight: 17,
    },

    optionTextContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    optionTitle: {
        color: "#706645",
        fontFamily: "Poppins",
        fontSize: 16,
        lineHeight: 24,
    },
});