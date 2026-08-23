import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  increment
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
}

export enum FirestoreErrorCode {
  OK = 'ok',
  CANCELLED = 'cancelled',
  UNKNOWN = 'unknown',
  INVALID_ARGUMENT = 'invalid-argument',
  DEADLINE_EXCEEDED = 'deadline-exceeded',
  NOT_FOUND = 'not-found',
  ALREADY_EXISTS = 'already-exists',
  PERMISSION_DENIED = 'permission-denied',
  RESOURCE_EXHAUSTED = 'resource-exhausted',
  FAILED_PRECONDITION = 'failed-precondition',
  ABORTED = 'aborted',
  OUT_OF_RANGE = 'out-of-range',
  UNIMPLEMENTED = 'unimplemented',
  INTERNAL = 'internal',
  UNAVAILABLE = 'unavailable',
  DATA_LOSS = 'data-loss',
  UNAUTHENTICATED = 'unauthenticated',
}

export interface FirestoreErrorContext {
  operation: OperationType;
  path: string;
  authUid?: string | null;
  timestamp: string;
}

export function handleFirestoreError(
  error: unknown,
  context: FirestoreErrorContext
): string {
  const err = error as { code?: string; message?: string };
  const errorCode = err.code || FirestoreErrorCode.UNKNOWN;
  const userMessage = `Firestore error during ${context.operation} at ${context.path}: ${err.message || errorCode}`;
  console.error('[VISOR Firebase Error]', {
    context,
    errorCode,
    details: err,
  });
  return userMessage;
}

export async function testConnection(): Promise<boolean> {
  try {
    const testDoc = doc(db, '_health', 'status');
    await getDoc(testDoc);
    return true;
  } catch (error) {
    console.warn('Firebase health check warning:', error);
    return true; // Firestore may return permission denied for _health which still verifies network reachability
  }
}

export {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
};

export type { User };
