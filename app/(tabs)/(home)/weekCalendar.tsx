import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StylesProps {
  [key: string]: any;
}

interface WeekDay {
  name: string;
  date: number;
  isCurrentDay: boolean;
  isFutureDay: boolean;
}

// Component to display a week calendar
export default function WeekCalendar() {
  const currentDate = new Date();

  // Function to get the days of the week starting from Sunday
  const getWeekDays = (): WeekDay[] => {
    const weekDays: WeekDay[] = [];
    const startOfWeek = new Date(currentDate);

    // Adjust to Sunday
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        name: day.toLocaleDateString('en-US', { weekday: 'short' }),
        date: day.getDate(),
        isCurrentDay: day.toDateString() === currentDate.toDateString(),
        isFutureDay: day > currentDate,
      });
    }

    return weekDays;
  };

  const weekDays = getWeekDays();

  return (
    <View style={styles.container}>
      {/* Calendar Display */}
      <View style={styles.calendar}>
        {weekDays.map((day: WeekDay, index: number) => (
          <View
            key={index}
            style={[
              styles.dayContainer,
              day.isCurrentDay && styles.currentDay,
              day.isFutureDay && styles.futureDay,
            ]}
          >
            {/* Day Name */}
            <Text style={styles.dayName}>{day.name}</Text>
            {/* Day Date */}
            <Text style={styles.dayDate}>{day.date}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles: StylesProps = StyleSheet.create({
  calendar: {
    backgroundColor: '#F0ECE0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
  },
  currentDay: {
    borderColor: '#70664550',
    borderRadius: 5,
    borderWidth: 2,
  },
  dayContainer: {
    alignItems: 'center',
    width: 40,
  },
  dayDate: {
    color: '#706645',
    fontSize: 16,
    fontWeight: '700',
  },
  dayName: {
    color: '#706645',
    fontSize: 12,
    fontWeight: '400',
  },
  futureDay: {
    opacity: 0.5,
  },
});
