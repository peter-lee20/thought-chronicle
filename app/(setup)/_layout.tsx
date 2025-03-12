import { Stack } from "expo-router";

/**
 * SetupLayout component defines the navigation stack for setup screens.
 * @returns {JSX.Element} The navigation stack.
 */
export default function SetupLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, animation: "none" }}
      />
      <Stack.Screen
        name="forgot"
        options={{ headerShown: false, animation: "none" }}
      />
      <Stack.Screen
        name="signup"
        options={{ headerShown: false, animation: "none" }}
      />
      <Stack.Screen
        name="verification"
        options={{ headerShown: false, animation: "none" }}
      />
    </Stack>
  );
}
