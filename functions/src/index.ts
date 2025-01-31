import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
// Function to fetch random question from Firestore

export const fetchQuestion = functions.https.onRequest(async (req, res) => {
  // Inefficient if our question database is big
  admin.firestore().collection("daily-question-prompts").get()
    .then((snapshot) => {
      const qPool = snapshot.docs;
      if (qPool.length == 0) {
        console.log("Question prompt database is empty");
      }

      // Get random document from database
      const randomIndex = Math.floor(Math.random() * qPool.length);
      const data = qPool[randomIndex].data();
      res.send(data);
    })
    .catch((error) => {
      console.error("Error fetching question", error);
      res.status(500).send({error: "Internal Server Error"});
    });
});

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
      res.send(data);
    })
    .catch((error) => {
      console.error("Error fetching prompt", error);
      res.status(500).send({error: "Internal Server Error"});
    });
});
