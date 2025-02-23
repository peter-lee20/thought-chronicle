import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';

import FindTab from './FindTab';
import FriendsTab from './FriendsTab';
import RequestsTab from './RequestsTab';
import SentTab from './SentTab';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';

/**
 * Represents a person with basic information and optional interaction buttons.
 */
interface Person {
  id: string;
  username: string;
  name: string;
  buttons?: { label: string; onPress: () => void }[];
}

/**
 * Type alias for the tab names in the FriendsPage.
 */
type TabName = 'Find' | 'Friends' | 'Requests' | 'Sent';

/**
 * Interface for defining a tab item with a name and image.
 */
interface TabItem {
  name: TabName;
  image: any;
}

/**
 * Interface defining the structure of the tab content, mapping each TabName to an array of Person objects.
 */
interface TabContentType {
  Find: Person[];
  Friends: Person[];
  Requests: Person[];
  Sent: Person[];
}

/**
 * Functional component for the Friends page.
 * This page displays different tabs for managing friends, requests, and sent invitations.
 *
 * @returns {JSX.Element} - The rendered FriendsPage component.
 */
export default function FriendsPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabName>('Find');
  const [findUsers, setFindUsers] = useState<Person[]>([]);


  /**
   * React Native effect for creating a list of Person objects from user data stored in the Firebase
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(FIRESTORE_DB, "names"));
        const users = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: data.userId,
            username: data.username,
            name: `${data.firstname} ${data.lastname}`,
            buttons: [{ label: '+ Add Friend', onPress: () => console.log('Added') }]
          };
        }).sort((a, b) => a.name.localeCompare(b.name));
        setFindUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  /**
   * An array of tab items, each representing a tab in the FriendsPage.
   */
  const tabs: readonly TabItem[] = [
    {
      name: 'Find',
      image: require('../../../assets/images/search_icon.png'),
    },
    {
      name: 'Friends',
      image: require('../../../assets/images/friends-icon.png'),
    },
    {
      name: 'Requests',
      image: require('../../../assets/images/requests.png'),
    },
    {
      name: 'Sent',
      image: require('../../../assets/images/sent_request.png'),
    },
  ];

  /**
   * Data for each tab.
   */
  const tabContent: TabContentType = {
    Find: findUsers,
    Friends: findUsers,
    Requests: [
      {
        id: '1',
        username: 'johndoe',
        name: 'John Doe',
        buttons: [{ label: 'Confirm', onPress: () => console.log('Added') }],
      },
      {
        id: '2',
        username: 'janesmith',
        name: 'Jane Smith',
        buttons: [{ label: 'Confirm', onPress: () => console.log('Added') }],
      },
      {
        id: '3',
        username: 'alicejones',
        name: 'Alice Jones',
        buttons: [{ label: 'Confirm', onPress: () => console.log('Added') }],
      },
    ],
    Sent: [
      {
        id: '1',
        username: 'johndoe',
        name: 'John Doe',
        buttons: [{ label: 'Pending', onPress: () => console.log('Added') }],
      },
      {
        id: '2',
        username: 'janesmith',
        name: 'Jane Smith',
        buttons: [{ label: 'Pending', onPress: () => console.log('Added') }],
      },
      {
        id: '3',
        username: 'alicejones',
        name: 'Alice Jones',
        buttons: [{ label: 'Pending', onPress: () => console.log('Added') }],
      },
    ],
  };

  /**
   * Renders the content for the currently active tab.
   *
   * @returns {JSX.Element | null} - The content of the active tab.
   */
  const renderTabContent = (): JSX.Element | null => {
    switch (activeTab) {
      case 'Find':
        return <FindTab items={tabContent.Find} />;
      case 'Friends':
        return <FriendsTab items={tabContent.Friends} />;
      case 'Requests':
        return <RequestsTab items={tabContent.Requests} />;
      case 'Sent':
        return <SentTab items={tabContent.Sent} />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.tabContainer}>
              {tabs.map((tab: TabItem) => (
                <TouchableOpacity
                  key={tab.name}
                  style={[
                    styles.tab,
                    activeTab === tab.name && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab(tab.name)}
                >
                  <Image
                    source={tab.image}
                    style={styles.tabImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>
            {renderTabContent()}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Footer outside KeyboardAvoidingView */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => {
            router.replace('/(home)/homepage');
          }}
        >
          <Image
            source={require('../../../assets/images/today.png')}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.replace('/(entries)/');
          }}
        >
          <Image
            source={require('../../../assets/images/entries.png')}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.replace('/(add-journal)/');
          }}
        >
          <Image
            source={require('../../../assets/images/circle.png')}
            style={styles.footerImage}
            resizeMode="contain"
          />
          <Text style={styles.plusSign}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require('../../../assets/images/feed.png')}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require('../../../assets/images/friends.png')}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    borderBottomColor: '#706645',
    borderBottomWidth: 2,
  },
  container: {
    backgroundColor: '#F0ECE0',
    flex: 1,
    marginTop: 20,
    padding: 20,
  },
  footer: {
    backgroundColor: '#F0ECE0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  footerImage: {
    height: 50,
    width: 50,
  },
  plusSign: {
    color: 'white',
    fontSize: 30,
    fontWeight: '400',
    marginLeft: 15.5,
    marginTop: 4,
    position: 'absolute',
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  tabImage: {
    height: 40,
    width: 40,
  },
});
