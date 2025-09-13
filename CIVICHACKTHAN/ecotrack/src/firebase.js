// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc, orderBy} from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "#your api key",
  authDomain: "ecotrack-aed3e.firebaseapp.com",
  projectId: "ecotrack-aed3e",
  storageBucket: "ecotrack-aed3e.firebasestorage.app",
  messagingSenderId: "379254934201",
  appId: "1:379254934201:web:9cff989b2ebf0d51b82968",
  measurementId: "G-NHKTV75ED9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// convenience wrappers
export async function uploadImageFile(file, path) {
  const r = storageRef(storage, path);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
}
export {
  collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc, orderBy, 
};
