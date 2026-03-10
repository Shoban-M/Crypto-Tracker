// src/firebase/loader.js
// ─────────────────────────────────────────────────────────────────────────────
// Loads the Firebase SDK via ES module imports (required for the CDN build)
// and exposes every needed function on `window._firebase` so the Babel-compiled
// JSX files — which cannot use ES module syntax — can access them.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window._firebase = {
  initializeApp,
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup,
  getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove,
};

window._firebaseReady = true;
window.dispatchEvent(new Event("firebaseReady"));
