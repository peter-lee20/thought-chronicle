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

// export const manuallyFetchQuestion = functions.https.onRequest(async (req, res) => {
//   // Inefficient if our question database is big
//   console.log("running")
//   admin.firestore().collection("daily-question-prompts").get()
//     .then((snapshot) => {
//       const qPool = snapshot.docs;
//       if (qPool.length == 0) {
//         console.log("Question prompt database is empty");
//       }
//       const randomIndex = Math.floor(Math.random() * qPool.length);
//       const data = qPool[randomIndex].data();

//       console.log(data.prompt);
//       res.send(data);
//     })
//     .catch((error) => {
//       console.error("Error fetching question", error);
//       res.status(500).send({error: "Internal Server Error"});
//     });
// });

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
