import { Stack } from "expo-router"

export default function JournalLayout() {
  return (
    <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="confirmation" options={{ headerShown: false }}/>
    </Stack>
  );
}