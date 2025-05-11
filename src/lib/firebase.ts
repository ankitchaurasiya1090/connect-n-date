
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// IMPORTANT: Replace with your Firebase project's configuration

const requiredEnvVars: string[] = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  // NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID is optional, so not listed here as strictly required for core functionality
];

let firebaseConfig: {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
} = {};

if (typeof window === "undefined") {
  // Server-side, check environment variables
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    // Log the error on the server for easier debugging during build or server start
    console.error(
      `Firebase configuration error: The following environment variables are missing or undefined: ${missingEnvVars.join(", ")}. Please ensure they are set in your .env.local file or environment.`
    );
    // We'll let the client-side check throw the visible error, or handle this more gracefully if needed.
    // For now, proceed with potentially undefined config to allow build to pass, client will handle error.
  }
    firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
    };

} else {
  // Client-side, directly use public env vars (Next.js makes these available)
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
  };

  const clientSideMissingEnvVars = requiredEnvVars.filter(envVar => !firebaseConfig[envVar as keyof typeof firebaseConfig]);
   if (clientSideMissingEnvVars.length > 0) {
    throw new Error(
      `Firebase configuration error: The following environment variables are missing or undefined: ${clientSideMissingEnvVars.join(", ")}. Please ensure they are set in your .env.local file and the Next.js build process has access to them.`
    );
  }
}


let app: FirebaseApp;
if (!getApps().length) {
  // Check if all required config values are present before initializing
  const allRequiredValuesPresent = requiredEnvVars.every(key => !!firebaseConfig[key as keyof typeof firebaseConfig]);
  if (!allRequiredValuesPresent) {
      // This check is more for robustness, the earlier checks should catch this.
      // If running on client, the error would have been thrown already.
      // If on server, it would have logged.
      // This specific error might not be directly visible to the user if on server, but important for logs.
      const errorMessage = `Firebase initialization failed: One or more required configuration values are missing. Check your .env.local file and ensure variables like NEXT_PUBLIC_FIREBASE_API_KEY are correctly set. Missing: ${requiredEnvVars.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]).join(', ')}`;
      console.error(errorMessage);
      // Avoid throwing here on server-side during module load if critical vars are missing to prevent build failures,
      // but AuthProvider will fail later.
      if (typeof window !== "undefined") {
          throw new Error(errorMessage);
      }
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };

// Reminder:
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Add a Web App to your project and copy the firebaseConfig.
// 3. Enable Email/Password sign-in method in Firebase Authentication > Sign-in method.
// 4. Set up Firestore database in Firebase console.
// 5. Create a .env.local file in your project root and add your Firebase config as shown in the .env.local example.
// 6. Restart your Next.js development server after creating/modifying .env.local.
