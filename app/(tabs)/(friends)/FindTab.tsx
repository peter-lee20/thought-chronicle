// FindTab.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image } from 'react-native';
import PersonCard from './PersonCard';
import { FIREBASE_AUTH } from '@/FirebaseConfig';

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
 * Props for the FindTab component.
 */
interface FindTabProps {
  items: Person[];
}

/**
 * FindTab component displays a list of friend requests with search functionality.
 *
 * @param {FindTabProps} props - The props for the FindTab component.
 * @returns {JSX.Element} The rendered FindTab component.
 */
const FindTab: React.FC<FindTabProps> = ({ items }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => 
    item.id != FIREBASE_AUTH.currentUser?.uid && 
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    // item.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Image
          source={require('../../../assets/images/search_icon.png')}
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
        data={searchQuery != '' ? filteredItems: null}
        renderItem={({ item }) => (
          <PersonCard username={item.username} name={item.name} buttons={item.buttons} />
        )}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    // paddingVertical: 20,
    width: '100%',
  },

  tabContent: {
    flex: 1,
    paddingVertical: 20,
    width: '100%',
  },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#70664533',
    borderRadius: 30,
    marginBottom: 10,
    paddingHorizontal: 10,
  },

  searchBar: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 10, // Add some padding to the right
  },

  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },

  listItem: {
    color: '#706645',
    fontFamily: 'Poppins',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default FindTab;
