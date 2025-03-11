import React, { useEffect, useState } from "react";
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
    Alert
} from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../FirebaseConfig';
import { getAuth, signOut } from 'firebase/auth';
import { router } from 'expo-router';

import FindTab from './FindTab';
import FriendsTab from './FriendsTab';
import RequestsTab from './RequestsTab';
import SentTab from './SentTab';
import { collection, getDocs, addDoc, serverTimestamp, query, where, doc, getDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

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
type TabName = "Find" | "Friends" | "Requests" | "Sent";

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
         * @returns {Person[]}
         */
        const fetchUsers = async () => {
            try {
                const snapshot = await getDocs(collection(FIRESTORE_DB, "users"));
                const users = await Promise.all(
                    snapshot.docs.map(async (doc) => {
                        const data = doc.data();

                        // Check if I sent them a friend request
                        const sentRequestQuery = query(
                            collection(FIRESTORE_DB, "friendRequests"),
                            where("senderID", "==", currentUserId),
                            where("receiverID", "==", data.userId),
                            where("status", "==", "pending")
                        );
                        const sentRequestSnapshot = await getDocs(sentRequestQuery);

                        // Check if they sent me a friend request
                        const receivedRequestQuery = query(
                            collection(FIRESTORE_DB, "friendRequests"),
                            where("senderID", "==", data.userId),
                            where("receiverID", "==", currentUserId),
                            where("status", "==", "pending")
                        );
                        const receivedRequestSnapshot = await getDocs(receivedRequestQuery);

                        // Check if the user is already your friend
                        const friendQuery = query(
                            collection(FIRESTORE_DB, "users"),
                            where("userId", "==", currentUserId),
                            where("friends", "array-contains", data.username)

                        )

                        const friendSnapshot = await getDocs(friendQuery);

                        let buttonLabel = "+ Add Friend";
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
                                setFindUsers((prevUsers) =>
                                    prevUsers.map((user) =>
                                        user.id === data.userId
                                            ? {
                                                ...user,
                                                buttons: [{ label: "Sent", onPress: () => { } }],
                                            }
                                            : user
                                    )
                                );

                                // Update the Sent tab after sending a new request
                                setSentRequests((prevSentRequests) => [
                                    ...prevSentRequests,
                                    {
                                        id: data.userId,
                                        username: data.username,
                                        name: `${data.firstname} ${data.lastname}`,
                                        buttons: [{ label: "Pending", onPress: () => { } }], // Or any other relevant action
                                    },
                                ]);
                            } catch (error) {
                                console.error("Failed to send friend request:", error);
                            }
                        };

                        if (!sentRequestSnapshot.empty) {
                            buttonLabel = 'Sent';
                            buttonPressHandler = async () => { };
                        } else if (!receivedRequestSnapshot.empty) {
                            buttonLabel = 'Pending';
                            buttonPressHandler = async () => { };
                        } else if (!friendSnapshot.empty) {
                            buttonLabel = 'Remove';
                            buttonPressHandler = async () => {
                                removeFriend(data.userId);
                            }
                        }

                        return {
                            id: data.userId,
                            username: data.username,
                            name: `${data.firstname} ${data.lastname}`,
                            buttons: [{ label: buttonLabel, onPress: buttonPressHandler }],
                        };
                    })
                );
                setFindUsers(users.sort((a, b) => a.username.localeCompare(b.username))); // Sort after all async operations
            } catch (error) {
                console.error("Server error: unable to fetch current users.", error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        /**
         * Fetches all pending friend requests for the current user
         * @returns {Person[]}
         */
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
                            buttons: [{ label: "Pending", onPress: () => { } }], // Or any other relevant action
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
        
        /**
         * Fetches all received friend requests for the current user
         * @returns {Person[]}
         */
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
                            buttons: [{
                                label: 'Accept', onPress: () => {
                                    Alert.alert(
                                        "Accept Friend Request",
                                        `Do you want to accept friend request from ${userData.username}?`,
                                        [
                                            {
                                                text: "Cancel",
                                                style: "cancel",
                                            },
                                            {
                                                text: "Confirm",
                                                onPress: () => addFriend(userData.userId),
                                            },
                                        ],
                                    );
                                }
                            }], // Or any other relevant action
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

        /**
         * Fetches all current friends for the current user
         * @returns {Person[]}
         */
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
                if (friendsList.length) {
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
                                buttons: [{
                                    label: 'Remove', onPress: () => {
                                        Alert.alert(
                                            "Remove Friend",
                                            `Are you sure you want to remove ${userData.username} from your friends?`,
                                            [
                                                {
                                                    text: "Cancel",
                                                    style: "cancel",
                                                },
                                                {
                                                    text: "Confirm",
                                                    onPress: () => removeFriend(userData.userId),
                                                },
                                            ],
                                        );
                                    }
                                }], // Or any other relevant action
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
            name: "Find",
            image: require("../../../assets/images/search_icon.png"),
        },

        {
            name: "Friends",
            image: require("../../../assets/images/friends-icon.png"),
        },

        {
            name: "Requests",
            image: require("../../../assets/images/requests.png"),
        },

        {
            name: "Sent",
            image: require("../../../assets/images/sent_request.png"),
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
            case "Find":
                return <FindTab items={tabContent.Find} />;
            case "Friends":
                return <FriendsTab items={tabContent.Friends} />;
            case "Requests":
                return <RequestsTab items={tabContent.Requests} />;
            case "Sent":
                return <SentTab items={tabContent.Sent} />;
            default:
                return null;
        }
    };

    /**
     * Locates and removes the specified username from the provided list
     * @param list - The list to be modified
     * @param friend - The username to be removed
     * @returns {Array<string>}
     */

    const findAndDelete = (list: Array<string>, friend: string) => {
        // Find friendName in list and remove it
        const index = list.indexOf(friend);

        if (index !== -1) { // This check should never fail in normal app use
            list.splice(index, 1);
        } else {
            console.log("Your friend is FAKE.")
        }
        return list;
    }

    /**
     * Remove friend from friend list
     * @param friendId - Firebase ID of user to be removed
     */
    const removeFriend = async (friendId: string) => {
        // const confirmed = window.confirm("Are you sure you want to remove this friend?");
        // if (!confirmed) return;

        // Fetch documents
        const userCollection = collection(FIRESTORE_DB, "users");
        const ids = [currentUserId, friendId]
        const userQuery = query(
            userCollection,
            where("userId", "in", ids),
        );

        const userData = await getDocs(userQuery);

        // If userID is not in database at this point, something is wrong
        if (userData.size != 2) {
            console.log("WRONG NUMBER OF USERS. HOUSTON WE HAVE A PROBLEM.");
            return null;
        }

        // Manipulate elements such that the first element is self, second element is friend
        let masterDoc = userData.docs;
        if (masterDoc[0].data()["userId"] !== currentUserId) {
            let temp = masterDoc[0];
            masterDoc[0] = masterDoc[1];
            masterDoc[1] = temp;
        }
        // Fetch user data for both users
        const document = masterDoc[0];
        const friendDocument = masterDoc[1];
        let friendsList = document.data()["friends"];
        let friendsList2 = friendDocument.data()["friends"];
        const username = document.data()["username"];
        const friendName = friendDocument.data()["username"];

        if (friendsList.some((friend: string) => friend === friendName)) {
            friendsList = findAndDelete(friendsList, friendName);
        } else {
            console.log("Friend is not here!");
        }

        if (friendsList2.some((friend: string) => friend === username)) {
            friendsList2 = findAndDelete(friendsList2, username);
        } else {
            console.log("Friend is not here!");
        }
        // Update documents in firebase
        await updateDoc(document.ref, {
            friends: friendsList
        });

        await updateDoc(friendDocument.ref, {
            friends: friendsList2
        });

        // Update UI

        setFriends(prevFriends =>
            prevFriends.filter(friend => friend.id !== friendId)
        );

        setFindUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === friendId
                    ? {
                        ...user,
                        buttons: [{
                            label: '+ Add Friend', onPress: async () => {

                                // Function to send friend requests
                                await addDoc(collection(FIRESTORE_DB, "friendRequests"), {
                                    senderID: currentUserId,
                                    receiverID: friendId,
                                    status: "pending",
                                    timestamp: serverTimestamp(),
                                });

                                console.log(`Friend request sent to ${friendName}`);

                                // Update the button on the Find tab immediately after sending the request
                                setFindUsers(prevUsers => prevUsers.map(user =>
                                    user.id === friendId
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
                                        id: friendId,
                                        username: friendName,
                                        name: `${friendDocument.data().firstname} ${friendDocument.data().lastname}`,
                                        buttons: [{ label: 'Pending', onPress: () => { } }] // Or any other relevant action
                                    }
                                ]);
                            }
                        }]
                    }
                : user
            )
        );

    }

    /**
     * Add friend to friend list
     * @param friendId - Firebase ID of user to be added
     */

    const addFriend = async (friendId: string) => {
        // const confirmed = window.confirm("Are you sure you want to add this friend?");
        // if (!confirmed) return;
        // Delete friend request from firebase
        const requests = collection(FIRESTORE_DB, "friendRequests");
        const requestQuery = query(
            requests,
            where("receiverID", "==", currentUserId),
            where("senderID", "==", friendId)
        );

        const requestData = await getDocs(requestQuery);

        // If requestData is empty, the request doesn't exist
        if (requestData.empty) {
            console.log("Request doesn't exist");
            return null;
        }

        // Delete document
        const request = requestData.docs[0];
        await deleteDoc(request.ref);

        // Fetch caller's username
        const userCollection = collection(FIRESTORE_DB, "users");
        const ids = [currentUserId, friendId]
        const userQuery = query(
            userCollection,
            where("userId", "in", ids),
        );

        const userData = await getDocs(userQuery);

        // If userID is not in database at this point, something is wrong
        if (userData.size != 2) {
            console.log("WRONG NUMBER OF USERS. HOUSTON WE HAVE A PROBLEM.");
            return null;
        }

        // Manipulate elements such that the first element is self, second element is friend
        let masterDoc = userData.docs;
        if (masterDoc[0].data()["userId"] !== currentUserId) {
            let temp = masterDoc[0];
            masterDoc[0] = masterDoc[1];
            masterDoc[1] = temp;
        }

        // Fetch user data for both users
        const document = masterDoc[0];
        const friendDocument = masterDoc[1];
        let friendsList = document.data()["friends"];
        let friendsList2 = friendDocument.data()["friends"];
        const username = document.data()["username"];
        const friendName = friendDocument.data()["username"];

        if (friendsList.some((friend: string) => friend === friendName)) {
            console.log("Friend is already here!")
        } else {
            friendsList.push(friendName);
        }

        if (friendsList2.some((friend: string) => friend === username)) {
            console.log("Friend is already here!")
        } else {
            friendsList2.push(username);
        }

        // Update documents in firebase
        await updateDoc(document.ref, {
            friends: friendsList
        });

        await updateDoc(friendDocument.ref, {
            friends: friendsList2
        });

        // Update UI
        setFriends(prevFriends => [
            ...prevFriends,
            {
                id: friendId,
                username: friendName,
                name: `${friendDocument.data().firstname} ${friendDocument.data().lastname}`,
                buttons: [{label: 'Remove', onPress: () => {
                      Alert.alert(
                          "Remove Friend",
                          `Are you sure you want to remove ${friendName} from your friends?`,
                          [
                              {
                                  text: "Cancel",
                                  style: "cancel",
                              },
                              {
                                  text: "Confirm",
                                  onPress: () => removeFriend(friendId),
                              },
                          ],
                      );
                  }
              }], // Or any other relevant action
            }
        ]);

        setReceivedRequests(prevRequests =>
            prevRequests.filter(friend => friend.id !== friendId)
        );

        setFindUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === friendId ? {
                    ...user,
                    buttons: [{label: 'Remove', onPress: () => {
                            Alert.alert(
                                "Remove Friend",
                                `Are you sure you want to remove ${friendName} from your friends?`,
                                [
                                    {
                                        text: "Cancel",
                                        style: "cancel",
                                    },
                                    {
                                        text: "Confirm",
                                        onPress: () => removeFriend(friendId),
                                    },
                                ],
                            );
                        }
                    }], // Or any other relevant action
                }
                : user
            )
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F0ECE0" }}>
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
                        router.replace("/(home)/homepage");
                    }}
                >
                    <Image
                        source={require("../../../assets/images/today.png")}
                        style={styles.footerImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        router.replace("/(entries)/");
                    }}
                >
                    <Image
                        source={require("../../../assets/images/entries.png")}
                        style={styles.footerImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        router.replace("/(add-journal)/");
                    }}
                >
                    <Image
                        source={require("../../../assets/images/circle.png")}
                        style={styles.footerImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.plusSign}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        router.replace("/(global-board)");
                    }}
                >
                    <Image
                        source={require("../../../assets/images/feed.png")}
                        style={styles.footerImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image
                        source={require("../../../assets/images/friends.png")}
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
        borderBottomColor: "#706645",
        borderBottomWidth: 2,
    },
    container: {
        backgroundColor: "#F0ECE0",
        flex: 1,
        marginTop: 20,
        padding: 20,
    },
    footer: {
        backgroundColor: "#F0ECE0",
        flexDirection: "row",
        justifyContent: "space-around",
        paddingBottom: 20,
    },
    footerImage: {
        height: 50,
        width: 50,
    },
    plusSign: {
        color: "white",
        fontSize: 30,
        fontWeight: "400",
        marginLeft: 15.5,
        marginTop: 4,
        position: "absolute",
    },
    tab: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    tabImage: {
        height: 40,
        width: 40,
    },
});
