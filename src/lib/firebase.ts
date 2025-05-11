
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
];

// NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID is optional
// const optionalEnvVars: string[] = ["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"]; // Not currently used for a specific check but good to list

type FirebaseConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

const envVarToConfigKeyMap: { [key: string]: keyof FirebaseConfig } = {
  "NEXT_PUBLIC_FIREBASE_API_KEY": "apiKey",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "authDomain",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "projectId",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "storageBucket",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "messagingSenderId",
  "NEXT_PUBLIC_FIREBASE_APP_ID": "appId",
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID": "measurementId",
};

// Directly construct firebaseConfig using process.env
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
if (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
  firebaseConfig.measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
}

// --- Enhanced Configuration Validation ---

// 1. Check for common placeholder patterns in the API key.
const apiKey = firebaseConfig.apiKey;
if (apiKey && (
    apiKey.startsWith("YOUR_") || 
    apiKey.startsWith("AIzaSy") === false || // Valid keys start with AIzaSy
    apiKey.includes("XXXX") || 
    apiKey.length < 20) // Basic length check, typical keys are longer
   ) {
    // More specific check for "AIzaSy..." but allowing for test/emulator keys if they differ.
    // For this application, we assume standard Firebase API keys.
    if (apiKey.startsWith("YOUR_") || apiKey.includes("XXXX") || apiKey.length < 20 || (apiKey !== "firebase-emulator-api-key" && !apiKey.startsWith("AIzaSy"))) {
         const placeholderErrorMessage = `Firebase Configuration Error: The API key ('${apiKey}') appears to be a placeholder or is invalid. Please provide a valid Firebase API key in your .env.local file for NEXT_PUBLIC_FIREBASE_API_KEY. Valid keys typically start with 'AIzaSy'.`;
        console.error(placeholderErrorMessage);
        throw new Error(placeholderErrorMessage);
    }
}


// 2. Check for missing or empty *required* environment variables.
const missingConfigKeys: string[] = [];
for (const envVar of requiredEnvVars) {
  const configKey = envVarToConfigKeyMap[envVar];
  if (!firebaseConfig[configKey]) { // Checks for undefined, null, or empty string
    missingConfigKeys.push(envVar);
  }
}

if (missingConfigKeys.length > 0) {
  const errorMessage = `Firebase Configuration Error: The following environment variables are missing or undefined: ${missingConfigKeys.join(", ")}. Please ensure they are set in your .env.local file and the Next.js build process has access to them (prefixed with NEXT_PUBLIC_).`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

// --- End of Enhanced Configuration Validation ---

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error: any) {
    console.error("Critical Firebase Initialization Error:", error.message);
    // Re-throw a more generic error if initializeApp itself fails for other reasons
    // (though config validation should catch most issues).
    throw new Error(`Failed to initialize Firebase: ${error.message}. Ensure your Firebase configuration is correct.`);
  }
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
// 5. Create a .env.local file in your project root and add your Firebase config.
//    Example content for .env.local:
//    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_VALID_API_KEY"
//    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT_ID.firebaseapp.com"
//    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
//    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_PROJECT_ID.appspot.com"
//    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
//    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
//    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID" # Optional
// 6. Restart your Next.js development server after creating/modifying .env.local.
