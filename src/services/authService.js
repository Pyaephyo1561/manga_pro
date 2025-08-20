// Ensure the default Firebase app is initialized
import '../utils/firebase';

import { 
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

// Auth and DB instances from the default Firebase app (initialized in utils/firebase.js)
const auth = getAuth();
const db = getFirestore();

const provider = new GoogleAuthProvider();

const ensureUserDocument = async (user) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    providerId: user.providerData?.[0]?.providerId || 'password',
    lastLoginAt: serverTimestamp(),
    createdAt: serverTimestamp()
  }, { merge: true });
};

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  await ensureUserDocument(result.user);
  return result.user;
};

export const registerWithEmail = async (email, password, displayName) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  await ensureUserDocument(cred.user);
  return cred.user;
};

export const loginWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDocument(cred.user);
  return cred.user;
};

export const logout = async () => {
  await signOut(auth);
};

export const onAuthStateChange = (callback) => onAuthStateChanged(auth, callback);


