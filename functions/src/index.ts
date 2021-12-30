import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setCustomClaims = functions.auth.user().onCreate(async (user) => {
  const CustomClaims = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": "staff",
      "x-hasura-allowed-roles": ["staff"],
      "x-hasura-user-id": user.uid,
    },
  };
  try {
    await admin.auth().setCustomUserClaims(user.uid, CustomClaims);
    await admin.firestore().collection("user_meta").doc(user.uid).create({
      refreshTime: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.log(e);
  }
});
