import { Stack } from "expo-router";

/**
 * SetupLayout component defines the navigation stack for entry screens.
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
        name="entries"
        options={{ headerShown: false, animation: "none" }}
      />
    </Stack>
  );
}
