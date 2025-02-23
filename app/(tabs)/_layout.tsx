import { Stack } from "expo-router"

export default function SetupLayout() {
  return (
    <Stack>
        <Stack.Screen name="(home)" options={{ headerShown: false }}/>
        <Stack.Screen name="(add-journal)" options={{ headerShown: false }}/>
        <Stack.Screen name="(entries)" options={{ headerShown: false }} />
        <Stack.Screen name="(friends)" options={{ headerShown: false }} />
    </Stack>
  );
}