import { Stack } from "expo-router";

/**
 * SetupLayout component defines the navigation stack for add-journal screens.
 * @returns {JSX.Element} The navigation stack.
 */
export default function SetupLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(home)"
        options={{ headerShown: false, animation: "none" }}
      />

      <Stack.Screen
        name="(add-journal)"
        options={{ headerShown: false, animation: "none" }}
      />

      <Stack.Screen
        name="(entries)"
        options={{ headerShown: false, animation: "none" }}
      />

      <Stack.Screen
        name="(friends)"
        options={{ headerShown: false, animation: "none" }}
      />

      <Stack.Screen
        name="(global-board)"
        options={{ headerShown: false, animation: "none" }}
      />
    </Stack>
  );
}
