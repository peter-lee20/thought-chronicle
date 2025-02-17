import { Stack } from "expo-router"

export default function SetupLayout() {
  return (
    <Stack>
        <Stack.Screen name="homepage" options={{ headerShown: false}}/>
        <Stack.Screen name="weekCalendar"/>
    </Stack>
  );
}