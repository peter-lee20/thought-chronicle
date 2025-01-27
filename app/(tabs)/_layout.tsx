import { Stack } from "expo-router"

export default function SetupLayout() {
  return (
    <Stack>
        <Stack.Screen name="(home)" options={{ headerShown: false }}/>
    </Stack>
  );
}