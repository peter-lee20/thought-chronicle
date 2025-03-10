import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "../../../FirebaseConfig";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function EntriesCalendar() {
  const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
const [markedDates, setMarkedDates] = useState<Record<string, any>>({}); // Keeps track of days with entries written by the user
  const currentDate = new Date(); // Current date object

  // Current date string formatted in PST (local time)
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const pstDateString = new Intl.DateTimeFormat("en-CA", options).format(
    currentDate
  );

  /**
   * Converts the given date string formatted in MM/DD/YYY to YYYY-MM-DD
   * for the purpose of marking the date on the calendar.
   * @param dateStr a date string formatted in MM/DD/YYYY
   * @returns a new date string formatted in YYYY-MM-DD
   */
  const convertDate = (dateStr: string) => {
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // On render, queries all the daily question responses and journal entries written by the user and marks the dates on the calendar
  useEffect(() => {
    /**
     * Queries all the daily question responses and journal entries written by the user and marks the dates on the calendar.
     */
    const updateCalendar = async () => {
      try {
        const currUser = FIREBASE_AUTH.currentUser;
        const questionSnapshot = await getDocs(
          query(
            collection(FIRESTORE_DB, "daily-question-responses"),
            where("userId", "==", currUser?.uid)
          )
        );
        const entrySnapshot = await getDocs(
          query(
            collection(FIRESTORE_DB, "journal-responses"),
            where("userId", "==", currUser?.uid)
          )
        );

        if (!questionSnapshot.empty || !entrySnapshot.empty) {
          const dates: Record<string, { marked: boolean }> = {};
          questionSnapshot.docs.forEach((doc) => {
            const date: string = doc.data().date;
            const formattedDate: string = convertDate(date);

            if (date) {
              dates[formattedDate] = {
                marked: true,
              };
            }
          });

          entrySnapshot.docs.forEach((doc) => {
            const date: string = doc.data().date;
            const formattedDate: string = convertDate(date);

            if (date) {
              dates[formattedDate] = {
                marked: true,
              };
            }
          });

          setMarkedDates(dates);
        }
      } catch (error) {
        console.log("Error fetching entries: ", error);
      }
    };

    updateCalendar();
  }, []);

  /**
   * Toggles the visibility of the dropdown menu.
   */
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  /**
   * Signs the user out of the app and redirects them to the login screen.
   */
  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      Alert.alert("Signed out successfully!");
      router.replace("/(setup)");
      // Redirect to login screen or handle accordingly
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to sign out. Please try again.");
    }
  };

  /**
   * Redirects the user to the entries page for the given date string if the user has written an entry on that day.
   *
   * @param dateString a date string formatted in YYYY-MM-DD
   */
  const goToEntries = (dateString: string) => {
    const hasEntry: boolean = markedDates[dateString];

    if (hasEntry) {
      router.replace(`/(entries)/entries?date=${dateString}`);
    }
  };

  /**
   * Custom day component for each day in the calendar (shows whether the user completed some entry on that specific day)
   *
   * @param date a date object containing the date string in YYYY-MM-DD format
   * @returns a view containing the day icon and the day number
   */
  const dayComponent = ({ date }: { date: { dateString: string } }) => {
    const isSelected: boolean = pstDateString == date.dateString;
    const hasEntry: boolean = markedDates[date.dateString];

    return (
      <View>
        <TouchableOpacity
          onPress={() => goToEntries(date.dateString)}
          style={[
            styles.dayIconContainer,
            {
              borderWidth: isSelected || hasEntry ? 2 : 0,
              borderColor: isSelected || hasEntry ? "#706645" : "transparent",
              borderStyle: isSelected ? "solid" : "dashed",
            },
          ]}
        >
          {hasEntry && (
            <Image
              style={{ width: 23, height: 23 }}
              source={require("../../../assets/images/journal-check.png")}
            ></Image>
          )}
        </TouchableOpacity>

        <Text style={isSelected ? styles.selectedDayText : styles.dayText}>
          {parseInt(date.dateString.split("-")[2], 10)}
        </Text>
      </View>
    );
  };

  /**
   * Custom header component for the calendar that displays the current month and year.
   *
   * @param date a date object containing the date string in YYYY-MM-DD format
   * @returns a view containing the month and year
   */
  const HeaderComponent = ({ date }: { date: Date }) => {
    const monthName = new Date(date).toLocaleDateString("en-US", {
      timeZone: "America/Los_Angeles",
      month: "long",
      year: "numeric",
    });

    return (
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{monthName}</Text>
      </View>
    );
  };

  /**
   * Arrow component for the calendar that displays the left and right arrows for navigating between months.
   *
   * @param direction a string that can be either 'left' or 'right'
   * @returns a custom arrow component for the calendar
   */
  const Arrow = ({ direction }: { direction: string }) => {
    return direction == "left" ? (
      <Image
        source={require("../../../assets/images/angle-left-solid.png")}
        style={styles.modalArrows}
      />
    ) : (
      <Image
        source={require("../../../assets/images/angle-right-solid.png")}
        style={styles.modalArrows}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* header */}
      <SafeAreaView style={styles.header}>
        <View>
          <TouchableOpacity onPress={toggleDropdown}>
            <Image
              source={require("../../../assets/images/profile.png")}
              style={styles.headerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleSignOut}
              >
                <Text style={styles.dropdownText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* calendar */}
    <View style={styles.body}>
      <Calendar
        theme={{
        calendarBackground: "#F0ECE0",
        dayTextColor: "#706645",
        textSectionTitleColor: "#706645",
        textDayHeaderFontFamily: "Poppins",
        }}
        enableSwipeMonths={true}
        hideExtraDays={true}
        renderHeader={(date: Date) => <HeaderComponent date={date} />}
        renderArrow={(direction: string) => <Arrow direction={direction} />}
        dayComponent={dayComponent}
      />
    </View>

      {/* footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => {
            router.replace("/(home)/homepage");
          }}
        >
          <Image
            source={require("../../../assets/images/today.png")}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity>
          <Image
            source={require("../../../assets/images/entries.png")}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            router.replace("/(add-journal)/");
          }}
        >
          <Image
            source={require("../../../assets/images/circle.png")}
            style={styles.footerImage}
            resizeMode="contain"
          />
          <Text style={styles.plusSign}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            router.replace("/(global-board)");
          }}
        >
          <Image
            source={require("../../../assets/images/feed.png")}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            router.replace("/(friends)");
          }}
        >
          <Image
            source={require("../../../assets/images/friends.png")}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0ECE0",
  },

  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 21,
    alignItems: "center",
    marginBottom: 20,
  },

  headerImage: {
    width: 40,
    height: 40,
  },

  dropdownMenu: {
    position: "absolute",
    top: 50, // Position below the profile image
    right: 0,
    width: 100,
    backgroundColor: "#FFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 10,
  },

  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  dropdownText: {
    color: "#706645",
    fontSize: 16,
    fontFamily: "Poppins",
  },

  body: {
    paddingHorizontal: 10,
  },

  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  dateChangeButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  date: {
    textAlign: "center",
    fontFamily: "Poppins",
    color: "#706645",
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 36,
    marginRight: 7,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  modalContent: {
    flexDirection: "column",
    width: 352,
    height: 242,
    borderRadius: 20,
    backgroundColor: "white",
    paddingLeft: 23,
    paddingRight: 23,
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: "center",
  },

  modalArrows: {
    width: 20,
    height: 40,
  },

  dayIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#FDFCF3",
    alignItems: "center",
    justifyContent: "center",
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

  // footer styling
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: "auto", // Push footer to the bottom,
    paddingVertical: 20,
    backgroundColor: "#F0ECE0",
  },

  circleButton: {
    position: "relative", // Make this container the reference for absolute positioning
    width: 50, // Adjust to match your circle image size
    height: 50, // Adjust to match your circle image size
    justifyContent: "center",
    alignItems: "center",
  },

  plusSign: {
    marginLeft: 15.5,
    marginTop: 4,
    position: "absolute",
    fontSize: 30, // Adjust size as needed
    color: "white", // Adjust color as needed
    fontWeight: "400", // Make the plus sign bold if needed
  },

  footerImage: {
    width: 50,
    height: 50,
  },
});
