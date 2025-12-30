import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAuc32ht-xQ9muDD9wysbYOkWjpQ_mPRUQ",
  authDomain: "my-premier-e96e3.firebaseapp.com",
  projectId: "my-premier-e96e3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
