// src/utils/firebase.utils.js
// ─────────────────────────────────────────────────────────────────────────────
// getFirebase() — initialises the Firebase app with your project config and
// returns { auth, db, ...all SDK helpers } for use in any component.
//
// 🔧  To use your own Firebase project, replace the values in `firebaseConfig`
//     with the config object from:
//     Firebase Console → Project Settings → Your Apps → SDK setup & config
// ─────────────────────────────────────────────────────────────────────────────

function getFirebase() {
  const f = window._firebase;
  if (!f) return null;

  const firebaseConfig = {
    apiKey:            "AIzaSyDz4kh4yPMRVjng6kH7UFtZdAjWRU5ofJA",
    authDomain:        "crypto-currency-1eaee.firebaseapp.com",
    projectId:         "crypto-currency-1eaee",
    storageBucket:     "crypto-currency-1eaee.firebasestorage.app",
    messagingSenderId: "94227033480",
    appId:             "1:94227033480:web:16704353274f3480ec9e3d",
    measurementId:     "G-6HT2WST9BC",
  };

  try {
    const app  = f.initializeApp(firebaseConfig);
    const auth = f.getAuth(app);
    const db   = f.getFirestore(app);
    return { auth, db, ...f };
  } catch (e) {
    return null;
  }
}
