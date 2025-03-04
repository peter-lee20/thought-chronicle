// import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { onSchedule } from "firebase-functions/scheduler";
import { FieldValue } from "firebase-admin/firestore";
// import { onRequest } from "firebase-functions/https";

admin.initializeApp();
// Function to fetch random question from Firestore
exports.scheduleFetchQuestion = onSchedule("0 8 * * *",  
  async () => {
    // Inefficient if our question database is big
    try {
      const snapshot = admin.firestore().collection("daily-question-prompts").get();
      const qPool = (await snapshot).docs;

      if (qPool.length == 0) {
        console.log("No daily question found...");
      }

      const randomIndex = Math.floor(Math.random() * qPool.length);
      const randomQuestion = qPool[randomIndex].data();

      console.log(randomQuestion.prompt);

      await admin.firestore().collection("current-question").doc("latest").set({
        text: randomQuestion.prompt,
        timestamp: FieldValue.serverTimestamp()
      });

      //return null;
    } catch(error) {
      console.error("Error fetching question:", error);
      // return null;
    }
  }
);

/**
 * Updates every user's streak every day at midnight depending on if they
 * answered the daily question on the previous day.
 */
exports.scheduleUpdateStreak = onSchedule("0 8 * * *",
  async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toLocaleDateString("en-US");

    try {
      const usersSnapshot = await admin.firestore().collection("users").get();

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.data().userId;
        const prevUserResponseSnapshot = await admin.firestore()
          .collection("daily-question-responses")
          .where("userId", "==", userId)
          .where("date", "==", yesterdayString)
          .get();
        let newStreak = userDoc.data().currentStreak || 0;

        if (prevUserResponseSnapshot.empty) {
          newStreak = 0;
        } else {
          newStreak += 1;
        }

        await admin.firestore().collection("userStreaks").doc(userId).update({
          currentStreak: newStreak,
        });
      }
    } catch (error: any) {
      console.error("There was an error updating your streak.", error);
    }
  }
)

export const fetchPrompt = functions.https.onRequest(async (req, res) => {
  // Inefficient if our question database is big
  admin.firestore().collection("random-prompts").get()
    .then((snapshot) => {
      const qPool = snapshot.docs;
      if (qPool.length == 0) {
        console.log("Random prompt database is empty");
      }

      // Get random document from database
      const randomIndex = Math.floor(Math.random() * qPool.length);
      const data = qPool[randomIndex].data();
      res.send(data["prompt"]);
    })
    .catch((error) => {
      console.error("Error fetching prompt", error);
      res.status(500).send({error: "Internal Server Error"});
    });
});
