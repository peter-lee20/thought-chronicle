import { Stack } from "expo-router";

/**
 * SetupLayout component defines the navigation stack for setup screens.
 * @returns {JSX.Element} The navigation stack.
 */
export default function SetupLayout() {
  return (
    <Stack>
      <Stack.Screen name="board" options={{ headerShown: false }} />
    </Stack>
  );
}
