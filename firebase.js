import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDen7ENEnEasiTlKqEo8H-Qk9_hJvufHTI",
  authDomain: "login-645a3.firebaseapp.com",
  projectId: "login-645a3",
  storageBucket: "login-645a3.firebasestorage.app",
  messagingSenderId: "835286059085",
  appId: "1:835286059085:web:908ade31a76c04e08db404"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;

export const db = getFirestore(app);
