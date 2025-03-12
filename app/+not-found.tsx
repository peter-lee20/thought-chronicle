import React from "react";
import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

/**
 * NotFoundScreen component displays a friendly error message for non-existent screens.
 * It provides a link to guide the user back to the home screen.
 *
 * @returns {JSX.Element} The rendered NotFoundScreen component.
 */
export default function NotFoundScreen(): JSX.Element {
  return (
    <>
      {/* Configure the header with a custom title */}
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        {/* The link is provided so users can quickly return to the home screen */}
        <Link href="/(setup)" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
