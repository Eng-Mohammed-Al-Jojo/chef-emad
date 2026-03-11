/*----*/

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAogvx-12QltAK-WbHUte9875KcvFv955g",
  authDomain: "chef-emad.firebaseapp.com",
  databaseURL: "https://chef-emad-default-rtdb.firebaseio.com",
  projectId: "chef-emad",
  storageBucket: "chef-emad.firebasestorage.app",
  messagingSenderId: "841411610814",
  appId: "1:841411610814:web:192a7e85f83ea8cc74f6ef"
};

const app = initializeApp(firebaseConfig);

// 👇 هذا هو المهم
export const db = getDatabase(app);
export const auth = getAuth(app);
