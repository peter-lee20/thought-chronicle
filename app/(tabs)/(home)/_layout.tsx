import { Stack } from "expo-router"

export default function SetupLayout() {
  return (
    <Stack>
        <Stack.Screen name="homepage" />
        <Stack.Screen name="weekCalendar"/>
    </Stack>
  );
}