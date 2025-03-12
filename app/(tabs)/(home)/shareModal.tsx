import React, { useEffect, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Switch,
} from "react-native";
import { useEffect as useReactEffect, useState as useReactState } from "react"; // redundant import removed
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "@/FirebaseConfig";

/**
 * Props for the Option component.
 */
interface OptionProps {
  disabled: boolean;
  image: ImageSourcePropType | null;
  optionTitle: string;
  optionText: string;
  currVal: boolean;
  onPress: () => void;
}

/**
 * Option component renders an individual sharing option.
 * We disable the option and adjust opacity if it's not available.
 *
 * @param props - OptionProps containing image, title, text, current value, and onPress handler.
 * @returns {JSX.Element} The rendered option.
 */
const Option: React.FC<OptionProps> = ({
  disabled,
  image,
  optionTitle,
  optionText,
  currVal,
  onPress,
}) => {
  return (
    <View style={styles.optionContainer}>
      <View style={styles.optionImageContainer}>
        {image && <Image style={styles.optionImage} source={image} />}
      </View>

      <View style={styles.optionTextContainer}>
        <View>
          <Text style={[styles.optionTitle, disabled && { opacity: 0.5 }]}>
            {optionTitle}
          </Text>
          <Text style={[styles.optionText, disabled && { opacity: 0.5 }]}>
            {optionText}
          </Text>
        </View>
        <Switch value={currVal} onValueChange={onPress} disabled={disabled} />
      </View>
    </View>
  );
};

/**
 * Props for the ShareModal component.
 */
interface ShareModalProps {
  isVisible: boolean;
  isFirstSubmit: boolean;
  onClose: () => void;
  onSubmit: (options: {
    globalFeed: boolean;
    anonymous: boolean;
    friends: boolean;
  }) => void;
}

/**
 * ShareModal component allows the user to adjust sharing settings for their entry.
 * We fetch the user's current visibility settings (if they already submitted)
 * so they can update them.
 *
 * @param props - ShareModalProps including visibility, submit handlers, etc.
 * @returns {JSX.Element} The rendered share modal.
 */
const ShareModal: React.FC<ShareModalProps> = ({
  isVisible,
  isFirstSubmit,
  onClose,
  onSubmit,
}) => {
  const [modalOverlayColor, setModalOverlayColor] = useState<string>(
    "rgba(0, 0, 0, 0.2)"
  );

  // Default sharing options if no previous response exists.
  const defaultOptions = {
    globalFeed: true,
    anonymous: false,
    friends: true,
  };
  const [options, setOptions] = useState(defaultOptions);

  /**
   * Toggles a sharing option by key.
   * We reset "anonymous" to false when the global feed option is toggled,
   * ensuring that anonymous responses cannot be enabled if not shared globally.
   *
   * @param key - The option key to toggle.
   * @returns {void}
   */
  const toggleOption = (key: keyof typeof options): void => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /**
   * Handles modal close by resetting the overlay color and calling onClose.
   *
   * @returns {void}
   */
  const handleModalClose = (): void => {
    setModalOverlayColor("transparent");
    onClose();
  };

  /**
   * Handles modal submit by passing the current options and closing the modal.
   *
   * @returns {void}
   */
  const handleModalSubmit = (): void => {
    onSubmit(options);
    onClose();
  };

  useEffect((): void => {
    /**
     * Fetches the current visibility settings for the user's daily response.
     * We do this so that when a user wants to change their settings, we pre-populate the modal.
     */
    const fetchOptions = async (): Promise<void> => {
      try {
        const currUser = FIREBASE_AUTH.currentUser;
        if (currUser) {
          const todayString = new Date().toLocaleDateString();
          const responseSnapshot: QuerySnapshot<DocumentData> = await getDocs(
            query(
              collection(FIRESTORE_DB, "daily-question-responses"),
              where("userId", "==", currUser.uid),
              where("date", "==", todayString)
            )
          );
          if (!responseSnapshot.empty) {
            const responseData = responseSnapshot.docs[0].data();
            setOptions({
              globalFeed: responseData.sharedGlobally,
              anonymous: responseData.anonymous,
              friends: responseData.sharedWithFriends,
            });
          } else {
            console.error("You have not responded to the daily question");
          }
        } else {
          console.error("You need to be logged in to view your response settings");
        }
      } catch (error: any) {
        console.error("There was a server error fetching your visibility options", error);
      }
    };

    if (!isFirstSubmit) {
      fetchOptions();
    }
  }, [isFirstSubmit]);

  return (
    <SafeAreaView>
      <Modal
        animationType="none"
        transparent={true}
        visible={isVisible}
        onDismiss={() => setModalOverlayColor("rgba(0, 0, 0, 0.2)")}
      >
        <TouchableWithoutFeedback onPress={handleModalClose}>
          <View style={[styles.modalOverlay, { backgroundColor: modalOverlayColor }]}>
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
                      // When global feed is toggled, we force anonymous to false
                      setOptions((prev) => ({
                        ...prev,
                        anonymous: false,
                      }));
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
                  <Text style={styles.modalWarning}>
                    *Your entry will be saved even if you don't share.
                  </Text>
                  <TouchableOpacity style={styles.modalSubmit} onPress={handleModalSubmit}>
                    {isFirstSubmit ? (
                      <Text style={styles.modalSubmitText}>Submit</Text>
                    ) : (
                      <Text style={styles.modalSubmitText}>Save</Text>
                    )}
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
        marginBottom: 70,
        marginTop: 30,
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
    modalFooter: {
        alignSelf: "center",
        width: "90%",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalSubmit: {
        alignItems: "center",
        backgroundColor: "#7E948C",
        borderRadius: 14,
        paddingBottom: 18,
        paddingTop: 18,
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
        height: 50,
        width: 65,
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
