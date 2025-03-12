import { Stack } from "expo-router";

/**
 * JournalLayout component defines the navigation stack for journal screens.
 * @returns {JSX.Element} The navigation stack.
 */
export default function JournalLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="confirmation" options={{ headerShown: false }} />
      <Stack.Screen
        name="journal-entry/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="daily-response/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="global-daily-response/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="friends-daily-response/[id]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
