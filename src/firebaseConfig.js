import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPRsJ600XqWwWxpq4a6YQPoY1PM80v0iE",
  authDomain: "grow-daily-339ef.firebaseapp.com",
  projectId: "grow-daily-339ef",
  storageBucket: "grow-daily-339ef.appspot.com",
  messagingSenderId: "508215311979",
  appId: "1:508215311979:web:76e5b77a301b7e931fbb2e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});
