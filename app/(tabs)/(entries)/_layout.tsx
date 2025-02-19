import { Stack } from "expo-router"

export default function SetupLayout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, animation: "slide_from_left"}}/>
        <Stack.Screen name="entries"/>
    </Stack>
  );
}