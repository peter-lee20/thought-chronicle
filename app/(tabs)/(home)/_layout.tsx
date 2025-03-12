import { Stack } from "expo-router";

/**
 * SetupLayout component defines the navigation stack for home screens.
 * @returns {JSX.Element} The navigation stack.
 */
export default function SetupLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="homepage"
        options={{ headerShown: false, animation: "none" }}
      />
      
      <Stack.Screen name="weekCalendar" />
    </Stack>
  );
}
