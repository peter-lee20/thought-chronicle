/**
 * @file Homepage.test.tsx
 * @description Test suite for the HomePage component
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import HomePage from "../../app/(tabs)/(home)/homepage";
import { getDoc, getDocs, addDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { Alert } from "react-native";

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true, // Simulate that the document exists
    data: () => ({ text: "What are you grateful for today?" }), // Mocked document data
  }),
  updateDoc: jest.fn(),
  addDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    empty: false, // Simulate that the query is not empty
    docs: [
      {
        id: "1",
        data: () => ({ currentStreak: 5 }), // Mocked document data
      },
    ],
  }),
  query: jest.fn(),
  where: jest.fn(),
}));

// Mock Firebase Authentication
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
  FIREBASE_AUTH: {
    currentUser: {
      uid: 'testUserId',
      email: 'test@example.com'
    }
  },
  getAuth: jest.fn()
}));

// Mock Firebase Configuration
jest.mock('../../FirebaseConfig', () => ({
  FIRESTORE_DB: {},
  FIREBASE_AUTH: {
    currentUser: {
      uid: 'testUserId',
      email: 'test@example.com'
    }
  }
}));

// Mock Expo Router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn()
  },
  useGlobalSearchParams: jest.fn()
}));

/**
 * Test suite for HomePage Component Rendering
 */
describe("HomePage Component - Rendering", () => {
  beforeEach(() => {
    (getDoc as jest.Mock).mockClear();
    (getDocs as jest.Mock).mockClear();
    (signOut as jest.Mock).mockClear();
    (router.replace as jest.Mock).mockClear();
    jest.spyOn(Alert, 'alert').mockClear();
  });

  /**
   * Test case: Verify that the 'Today' title is rendered
   */
  it("renders the 'Today' title", async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(screen.getByText("Today")).toBeTruthy();
    });
  });
  
  /**
   * Test case: Verify that the response input field is rendered
   */
  it("renders the response input field", async () => {
    render(<HomePage />);
    const inputField = await screen.findByPlaceholderText("Type your response here...");
    expect(inputField).toBeTruthy();
  });
});

/**
 * Test suite for HomePage Component Data Fetching
 */
describe("HomePage Component - Data Fetching", () => {
  beforeEach(() => {
    (getDoc as jest.Mock).mockClear();
    (getDocs as jest.Mock).mockClear();
    (signOut as jest.Mock).mockClear();
    (router.replace as jest.Mock).mockClear();
    jest.spyOn(Alert, 'alert').mockClear();
  });

  /**
   * Test case: Verify that the daily question is fetched and displayed
   */
  it("fetches and displays the daily question", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ text: "What are you grateful for today?" }),
    });

    render(<HomePage />);
    await waitFor(() => {
      expect(screen.getByText("What are you grateful for today?")).toBeTruthy();
    });
  });
});

/**
 * Test suite for HomePage Component Response Submission
 */
describe("HomePage Component - Submitting Response", () => {
  beforeEach(() => {
    (getDoc as jest.Mock).mockClear();
    (getDocs as jest.Mock).mockClear();
    (addDoc as jest.Mock).mockClear();
    (signOut as jest.Mock).mockClear();
    (router.replace as jest.Mock).mockClear();
    jest.spyOn(Alert, 'alert').mockClear();
  });
  
  /**
   * Test case: Verify that an alert is shown when submitting an empty response
   */
  it("shows alert if response is empty", async () => {
    render(<HomePage />);
    const submitButton = screen.getByText("Submit Response");
    await act(async () => {
      fireEvent.press(submitButton);
    });
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Please enter a response.");
    });
  });
});

/**
 * Test suite for HomePage Component Streak Functionality
 */
describe("HomePage Component - Streak Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test case: Verify that the user's current streak is displayed
   */
  it("displays the user's current streak", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ currentStreak: 5 }),
    });

    render(<HomePage />);
    const streakElement = await screen.findByText("5");
    expect(streakElement).toBeTruthy();
  });
  
  /**
   * Test case: Verify that the streak updates after a successful response submission
   */
  it("updates streak after successful response submission", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ currentStreak: 5 }),
    }).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ currentStreak: 6 }),
    });
  
    (addDoc as jest.Mock).mockResolvedValue({});
  
    render(<HomePage />);
  
    const input = screen.getByPlaceholderText("Type your response here...");
    fireEvent.changeText(input, "Test response");
  
    const submitButton = screen.getByText("Submit Response");
  
    // Wrap fireEvent.press in act because it triggers asynchronous updates
    await act(async () => {
      fireEvent.press(submitButton);
    });
  
    // Wait for the streak to update
    await waitFor(() => {
      expect(screen.getByText("6")).toBeTruthy();
    });
  });
});
