import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

/**
 * Props for the button component.
 */
interface ButtonProps {
  label: string;
  onPress: () => void;
}

/**
 * Props for the PersonCard component.
 */
interface PersonCardProps {
  username: string;
  name: string;
  buttons?: ButtonProps[];
}

/**
 * PersonCard component displays a card with user information and action buttons.
 *
 * @param {PersonCardProps} props - The props for the PersonCard component.
 * @returns {JSX.Element} The rendered PersonCard component.
 */
const PersonCard: React.FC<PersonCardProps> = ({ username, name, buttons }) => (
  <View style={styles.cardContainer}>
    <Image
      source={require("../../../assets/images/profile.png")}
      style={styles.avatar}
    />
    <View style={styles.textContainer}>
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.name}>{name}</Text>
    </View>
    <View style={styles.buttonContainer}>
      {buttons?.map((button, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={button.onPress}
        >
          <Text style={styles.buttonText}>{button.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 20,
    height: 40,
    marginRight: 20,
    width: 40,
  },

  button: {
    backgroundColor: "#70664533",
    borderRadius: 5,
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  buttonContainer: {
    marginLeft: "auto",
  },

  buttonText: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 14,
  },

  cardContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 20,
  },

  name: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 16,
  },

  textContainer: {
    flexDirection: "column",
  },
  
  username: {
    color: "#706645",
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PersonCard;
