import { Stack } from "expo-router"

export default function SetupLayout() {
  return (
    <Stack>
        <Stack.Screen name="index"/>
        <Stack.Screen name="forgot"/>
        <Stack.Screen name="signup"/>
        <Stack.Screen name="verification"/>
    </Stack>
  );
}