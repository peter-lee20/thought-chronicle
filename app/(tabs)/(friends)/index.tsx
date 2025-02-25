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
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../FirebaseConfig';
import { getAuth, signOut } from 'firebase/auth';
import { router } from 'expo-router';

import FindTab from './FindTab';
import FriendsTab from './FriendsTab';
import RequestsTab from './RequestsTab';
import SentTab from './SentTab';
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
  const [findFriends, setFriends] = useState<Person[]>([]);

  useEffect(() => {

    /**
     * Fetches users from the Firebase and creates a list of Person objects from the data.
     */
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(FIRESTORE_DB, "users"));
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
        console.error("Server error: unable to fetch current users.", error);
      }
    };

    fetchUsers();
  }, []);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const id = currentUser?.uid;

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
    Friends: [
      {
        id: '1',
        username: 'johndoe',
        name: 'John Doe',
        buttons: [{ label: 'Remove', onPress: () => console.log('Added') }],
      },
      {
        id: '2',
        username: 'janesmith',
        name: 'Jane Smith',
        buttons: [{ label: 'Remove', onPress: () => console.log('Added') }],
      },
      {
        id: '3',
        username: 'alicejones',
        name: 'Alice Jones',
        buttons: [{ label: 'Remove', onPress: () => console.log('Added') }],
      },
    ],
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

  /**
   * Helper function for friend removal
   */

  const findAndDelete = (list: Array<string>, friend: string) => {
    // Find friendName in list and remove it
    const index = list.indexOf(friend);

    if (index !== -1){ // This check should never fail in normal app use
      list.splice(index, 1);
    } else {
      console.log("Your friend is FAKE.")
    }
    return list;
  }

  /**
   * Remove friend from friend list
   */
  const removeFriend = async (friendName: string) => {
    // Fetch caller's username
    const userCollection = collection(FIRESTORE_DB, "users");
    const userQuery = query(
      userCollection,
      where("userId", "==", id),
    );
    const userData = await getDocs(userQuery);

    // If userID is not in database at this point, something is wrong
    if (userData.empty){
      console.log("USER NOT FOUND. HOUSTON WE HAVE A PROBLEM.");
      return null;
    }

    // There should only be 1 document in userData
    const document = userData.docs[0];
    const friendsList = document.data()["friends"];
    const username = document.data()["username"];

    const modifiedList = findAndDelete(friendsList, friendName);

    // Update document in firebase
    const docRef = doc(FIRESTORE_DB, "users", document.id);
    await updateDoc(docRef, {
      friends: modifiedList
    });


    // Remove caller from friend's friend list
    const friendQuery = query(
      userCollection,
      where("username", "==", friendName),
    );

    const friendSnapshot = await getDocs(friendQuery);

    // friendSnapshot should not be empty
    if (friendSnapshot.empty){
      console.log("FriendSnapshot is empty.")
      return null;
    }

    const friendDoc = friendSnapshot.docs[0];
    const friendList = friendDoc.data()["friends"];

    // Find username in friend list and remove it
    const modifiedFriendList = findAndDelete(friendList, username);

    // Update document in firebase
    const friendDocRef = doc(FIRESTORE_DB, "users", friendDoc.id);
    await updateDoc(friendDocRef, {
      friends: modifiedFriendList
    });

    }

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
