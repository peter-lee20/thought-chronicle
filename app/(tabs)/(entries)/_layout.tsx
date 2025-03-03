import { Stack } from "expo-router"

export default function SetupLayout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, animation: "none" }}/>
        <Stack.Screen name="entries" options={{ headerShown: false, animation: "none" }}/>
    </Stack>
  );
}