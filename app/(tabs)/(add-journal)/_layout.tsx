import { Stack } from "expo-router"

export default function JournalLayout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }}/>
        <Stack.Screen name="confirmation" options={{ headerShown: false }}/>
        <Stack.Screen name="journal-entry/[id]" options={{ headerShown: false }}/>
        <Stack.Screen name="daily-response/[id]" options={{ headerShown: false }}/>
        <Stack.Screen name="global-daily-response/[id]" options={{ headerShown: false }}/>
    </Stack>
  );
}