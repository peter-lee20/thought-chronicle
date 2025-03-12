import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface WeekDay {
  name: string;
  date: number;
  isCurrentDay: boolean;
  isFutureDay: boolean;
}

/**
 * WeekCalendar component displays the days of the current week starting from Sunday.
 * It highlights the current day and dims future days to guide user focus.
 *
 * @returns {JSX.Element} The rendered week calendar.
 */
export default function WeekCalendar(): JSX.Element {
  const currentDate = new Date();

  /**
   * Generates an array of week days starting from Sunday.
   * We adjust the start to Sunday because it provides a consistent weekly view regardless of locale.
   *
   * @returns {WeekDay[]} The array of week days.
   */
  const getWeekDays = (): WeekDay[] => {
    const weekDays: WeekDay[] = [];
    const startOfWeek = new Date(currentDate);
    // Adjust to Sunday (0 = Sunday) by subtracting the current day index.
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    // Loop through 7 days to build the week.
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        name: day.toLocaleDateString("en-US", { weekday: "short" }),
        date: day.getDate(),
        // Use full date string comparison for accuracy.
        isCurrentDay: day.toDateString() === currentDate.toDateString(),
        // Flag days after the current day to apply a dimming style.
        isFutureDay: day > currentDate,
      });
    }
    return weekDays;
  };

  const weekDays = getWeekDays();

  return (
    <View style={styles.container}>
      <View style={styles.calendar}>
        {weekDays.map((day, index) => (
          <View
            key={index}
            style={[
              styles.dayContainer,
              day.isCurrentDay && styles.currentDay,
              day.isFutureDay && styles.futureDay,
            ]}
          >
            <Text style={styles.dayName}>{day.name}</Text>
            <Text style={styles.dayDate}>{day.date}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: "#F0ECE0",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  container: {
    flex: 1,
  },

  currentDay: {
    borderColor: "#70664550",
    borderRadius: 5,
    borderWidth: 2,
  },

  dayContainer: {
    alignItems: "center",
    width: 40,
  },

  dayDate: {
    color: "#706645",
    fontSize: 16,
    fontWeight: "700",
  },

  dayName: {
    color: "#706645",
    fontSize: 12,
    fontWeight: "400",
  },

  futureDay: {
    opacity: 0.5,
  },
});
