import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function WeekCalendar() {
  const currentDate = new Date();

  // Get the days of the week starting from Sunday
  const getWeekDays = () => {
    const weekDays = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Adjust to Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        name: day.toLocaleDateString('en-US', { weekday: 'short' }), // e.g., "Sun", "Mon"
        date: day.getDate(), // Numeric day
        isCurrentDay: day.toDateString() === currentDate.toDateString(),
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
  container: {
    flex: 1,
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0ECE0',
  },
  dayContainer: {
    alignItems: 'center',
    width: 40,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '400',
    color: '#706645',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#706645',
  },
  currentDay: {
    borderWidth: 2,
    borderColor: '#70664550',
    
    borderRadius: 5,
  },
  futureDay: {
    opacity: 0.5,
  },
});
