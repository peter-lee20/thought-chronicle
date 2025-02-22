import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import PersonCard from './PersonCard';

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
 * Props for the SentTab component.
 */
interface SentTabProps {
  items: Person[];
}

/**
 * SentTab component displays a list of sent friend requests with search functionality.
 *
 * @param {SentTabProps} props - The props for the SentTab component.
 * @returns {JSX.Element} The rendered SentTab component.
 */
const SentTab: React.FC<SentTabProps> = ({ items }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    width: '100%',
  },
  listItem: {
    color: '#706645',
    fontFamily: 'Poppins',
    fontSize: 16,
    marginBottom: 5,
  },
  searchBar: {
    flex: 1,
    paddingRight: 10,
    paddingVertical: 10,
  },
  searchBarContainer: {
    alignItems: 'center',
    backgroundColor: '#70664533',
    borderRadius: 30,
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    height: 20,
    marginRight: 10,
    width: 20,
  },
  tabContent: {
    flex: 1,
    paddingVertical: 20,
    width: '100%',
  },
});

export default SentTab;
