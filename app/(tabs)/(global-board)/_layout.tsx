import { Stack } from "expo-router"

export default function SetupLayout() {
  return (
    <Stack>
        <Stack.Screen name="board" options={{ headerShown: false }}/>
    </Stack>
  );
}