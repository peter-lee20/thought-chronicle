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
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../FirebaseConfig';
import { getAuth, signOut } from 'firebase/auth';
import { router } from 'expo-router';

import FindTab from './FindTab';
import FriendsTab from './FriendsTab';
import RequestsTab from './RequestsTab';
import SentTab from './SentTab';
import { collection, getDocs, addDoc, serverTimestamp, query, where, doc, getDoc, updateDoc, } from 'firebase/firestore';

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
    const [sentRequests, setSentRequests] = useState<Person[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<Person[]>([]);
    const [friends, setFriends] = useState<Person[]>([]);
    const currentUserId = FIREBASE_AUTH.currentUser?.uid;
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (!currentUserId) {
            console.error("No user is logged in.");
            return;
        }

        /**
         * Fetches users from the Firebase and creates a list of Person objects from the data.
         */
        const fetchUsers = async () => {
            try {
                const snapshot = await getDocs(collection(FIRESTORE_DB, "users"));
                const users = await Promise.all(snapshot.docs.map(async (doc) => {
                    const data = doc.data();

                    // Check if a friend request already exists
                    const existingRequestQuery = query(
                        collection(FIRESTORE_DB, "friendRequests"),
                        where("senderID", "==", currentUserId),
                        where("receiverID", "==", data.userId)
                    );

                    const existingRequestSnapshot = await getDocs(existingRequestQuery);

                    let buttonLabel = '+ Add Friend';
                    let buttonPressHandler: () => Promise<void> = async () => {
                        try {
                            if (!currentUserId) {
                                console.error("No user is logged in.");
                                return;
                            }

                            await addDoc(collection(FIRESTORE_DB, "friendRequests"), {
                                senderID: currentUserId,
                                receiverID: data.userId,
                                status: "pending",
                                timestamp: serverTimestamp(),
                            });

                            console.log(`Friend request sent to ${data.username}`);

                            // Update the button on the Find tab immediately after sending the request
                            setFindUsers(prevUsers => prevUsers.map(user =>
                                user.id === data.userId
                                    ? {
                                        ...user,
                                        buttons: [{ label: 'Sent', onPress: () => { } }]
                                    }
                                    : user
                            ));

                            // Update the Sent tab after sending a new request
                            setSentRequests(prevSentRequests => [
                                ...prevSentRequests,
                                {
                                    id: data.userId,
                                    username: data.username,
                                    name: `${data.firstname} ${data.lastname}`,
                                    buttons: [{ label: 'Pending', onPress: () => { } }] // Or any other relevant action
                                }
                            ]);


                        } catch (error) {
                            console.error("Failed to send friend request:", error);
                        }
                    };


                    if (!existingRequestSnapshot.empty) {
                        buttonLabel = 'Sent';
                        buttonPressHandler = async () => { };
                    }

                    return {
                        id: data.userId,
                        username: data.username,
                        name: `${data.firstname} ${data.lastname}`,
                        buttons: [{ label: buttonLabel, onPress: buttonPressHandler }]
                    };
                }));
                setFindUsers(users.sort((a, b) => a.name.localeCompare(b.name))); // Sort after all async operations
            } catch (error) {
                console.error("Server error: unable to fetch current users.", error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };
        const fetchSentRequests = async () => {
            try {
                const sentQuery = query(
                    collection(FIRESTORE_DB, "friendRequests"),
                    where("senderID", "==", currentUserId),
                    where("status", "==", "pending")
                );
                const sentSnapshot = await getDocs(sentQuery);

                const sentUsersPromises = sentSnapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const receiverId = data.receiverID;

                    // Fetch user data for the receiver
                    const userQuery = query(
                        collection(FIRESTORE_DB, "users"),
                        where("userId", "==", receiverId)
                    );
                    const userSnapshot = await getDocs(userQuery);

                    if (!userSnapshot.empty) {
                        const userData = userSnapshot.docs[0].data();
                        return {
                            id: userData.userId,
                            username: userData.username,
                            name: `${userData.firstname} ${userData.lastname}`,
                            buttons: [{ label: 'Pending', onPress: () => { } }], // Or any other relevant action
                        };
                    } else {
                        console.log(`No user found with ID: ${receiverId}`);
                        return null; // Or handle the case where the user is not found
                    }
                });

                // Resolve all promises and filter out any null values
                const sentUsers = (await Promise.all(sentUsersPromises)).filter(
                    (user) => user !== null
                ) as Person[];
                setSentRequests(sentUsers);
            } catch (error) {
                console.error("Error fetching sent requests:", error);
            }
        };


        const fetchReceivedRequests = async () => {
            try {
                const receivedQuery = query(
                    collection(FIRESTORE_DB, "friendRequests"),
                    where("receiverID", "==", currentUserId),
                    where("status", "==", "pending")
                );
                const receivedSnapshot = await getDocs(receivedQuery);

                const receivedUsersPromises = receivedSnapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const senderId = data.senderID;

                    // Fetch user data for the sender
                    const userQuery = query(
                        collection(FIRESTORE_DB, "users"),
                        where("userId", "==", senderId)
                    );
                    const userSnapshot = await getDocs(userQuery);

                    if (!userSnapshot.empty) {
                        const userData = userSnapshot.docs[0].data();
                        return {
                            id: userData.userId,
                            username: userData.username,
                            name: `${userData.firstname} ${userData.lastname}`,
                            buttons: [{ label: 'Accept', onPress: () => { } }], // Or any other relevant action
                        };
                    } else {
                        console.log(`No user found with ID: ${senderId}`);
                        return null; // Or handle the case where the user is not found
                    }
                });

                // Resolve all promises and filter out any null values
                const receivedUsers = (await Promise.all(receivedUsersPromises)).filter(
                    (user) => user !== null
                ) as Person[];
                setReceivedRequests(receivedUsers);
            } catch (error) {
                console.error("Error fetching received requests:", error);
            }
        };

        const fetchFriends = async () => {
          try {
            const userQuery = query(
              collection(FIRESTORE_DB, "users"),
              where("userId", "==", currentUserId)
            )

            const userSnapshot = await getDocs(userQuery);
            
            // Get friends list
            const document = userSnapshot.docs[0]; // There should only be 1 doc in the snapshot
            const friendsList = document.data()["friends"];

            // If friendsList is empty, the query will be invalid
            if (friendsList.length){
                const friendQuery = query(
                    collection(FIRESTORE_DB, "users"),
                    where("username", "in", friendsList)
                  );
                
                const friendSnapshot = await getDocs(friendQuery);
                const friendPromises = friendSnapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const friendId = data.userId;

                    // Fetch user data for the sender
                    const userQuery = query(
                        collection(FIRESTORE_DB, "users"),
                        where("userId", "==", friendId)
                    );
                    const userSnapshot = await getDocs(userQuery);

                    if (!userSnapshot.empty) {
                        const userData = userSnapshot.docs[0].data();
                        return {
                            id: userData.userId,
                            username: userData.username,
                            name: `${userData.firstname} ${userData.lastname}`,
                            buttons: [{ label: 'Remove', onPress: () => removeFriend(userData.username) }], // Or any other relevant action
                        };
                    } else {
                        console.log(`No user found with ID: ${friendId}`);
                        return null; // Or handle the case where the user is not found
                    }
            
            });
                // Resolve all promises and filter out any null values
                const friends = (await Promise.all(friendPromises)).filter(
                    (user) => user !== null
                ) as Person[];
                setFriends(friends.sort((a, b) => a.name.localeCompare(b.name)));
            }
            

        } catch (error) {
            console.error("Server error: unable to fetch current friends.", error);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
        }

        fetchUsers();
        fetchReceivedRequests();
        fetchSentRequests();
        fetchFriends();
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
        Friends: friends,
        Requests: receivedRequests,
        Sent: sentRequests
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
      where("userId", "==", currentUserId),
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
                <TouchableOpacity
                    onPress={() => {
                        router.replace('/(global-board)');
                    }}
                >
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
