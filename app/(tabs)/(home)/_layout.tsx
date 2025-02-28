import { Stack } from "expo-router"

export default function SetupLayout() {
  return (
    <Stack>
        <Stack.Screen name="homepage" options={{ headerShown: false, animation: "none" }}/>
        <Stack.Screen name="weekCalendar"/>
    </Stack>
  );
}