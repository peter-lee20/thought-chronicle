import React, { useState } from "react";
import { View, TextInput, FlatList, StyleSheet, Image } from "react-native";
import PersonCard from "./PersonCard";

/**
 * Represents a person with basic information and optional interaction buttons.
 */
interface Person {
  id: string;
  name: string;
  username: string;
  buttons?: { label: string; onPress: () => void }[];
}

/**
 * Props for the RequestsTab component.
 */
interface RequestsTabProps {
  items: Person[];
}

/**
 * RequestsTab component displays a list of friend requests with search functionality.
 *
 * @param {RequestsTabProps} props - The props for the RequestsTab component.
 * @returns {JSX.Element} The rendered RequestsTab component.
 */
const RequestsTab: React.FC<RequestsTabProps> = ({ items }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) =>
    item.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Image
          source={require("../../../assets/images/search_icon.png")}
          style={styles.searchIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredItems}
        renderItem={({ item }) => (
          <PersonCard
            username={item.username}
            name={item.name}
            buttons={item.buttons}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    width: "100%",
  },

  listItem: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 16,
    marginBottom: 5,
  },

  searchBar: {
    flex: 1,
    paddingRight: 10,
    paddingVertical: 10,
  },

  searchBarContainer: {
    alignItems: "center",
    backgroundColor: "#70664533",
    borderRadius: 30,
    flexDirection: "row",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  
  searchIcon: {
    height: 20,
    marginRight: 10,
    width: 20,
  },
});

export default RequestsTab;
