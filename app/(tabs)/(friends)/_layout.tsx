import { Stack } from "expo-router"

/**
 * SetupLayout component defines the navigation stack for friend screens.
 * @returns {JSX.Element} The navigation stack.
 */
export default function SetupLayout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false}}/>
    </Stack>
  );
}