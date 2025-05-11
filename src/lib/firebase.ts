
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Define FirebaseConfig interface
interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

// Populate firebaseConfig from environment variables
// It's crucial that these are correctly set in the environment (.env.local)
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const REQUIRED_ENV_VAR_KEYS: Array<keyof Omit<FirebaseConfig, 'measurementId'>> = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

// Renamed to avoid confusion if this file itself is referred to as having a validateFirebaseConfig export
function validateFirebaseConfigInternal(config: FirebaseConfig): { isValid: boolean; messages: string[] } {
  const messages: string[] = [];
  let isValid = true;

  // Check for missing environment variables (undefined or null)
  const unsetEnvVarDetails = REQUIRED_ENV_VAR_KEYS
    .map(key => {
        const envVarNameMapping: Record<string, string> = {
            apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
            authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
            projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
            storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
            messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
            appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
        };
        return { key, envVarName: envVarNameMapping[key] || key };
    })
    .filter(detail => config[detail.key] == null);

  if (unsetEnvVarDetails.length > 0) {
    const missingVarNames = unsetEnvVarDetails.map(detail => detail.envVarName).join(", ");
    const errorMessage = `Firebase Configuration Error: The following environment variables are missing or undefined: ${missingVarNames}. Please ensure they are set in your .env.local file.`;
    messages.push(errorMessage);
    console.error(errorMessage); // Use console.error for missing critical vars
    // This is a critical error that prevents Firebase from initializing.
    throw new Error(errorMessage);
  }

  // Validate API Key specifically for placeholder values or invalid format
  const apiKey = config.apiKey; // Already checked for null/undefined above
  if (apiKey && apiKey !== "firebase-emulator-api-key") { // Emulator key is valid and bypasses these checks
    if (apiKey.startsWith("YOUR_") || apiKey.toUpperCase().includes("XXXX") || apiKey.length < 20 || !apiKey.startsWith("AIzaSy")) {
        const warningMessage = `Firebase Configuration Warning: The API key ('${apiKey}') for NEXT_PUBLIC_FIREBASE_API_KEY appears to be a placeholder or is invalid. Firebase initialization might fail. Valid keys typically start with 'AIzaSy'.`;
        messages.push(warningMessage);
        console.warn(warningMessage);
        isValid = false; // Mark as not strictly valid but don't throw for this warning.
    }
  }

  // Validate other project-specific IDs for placeholders
  const placeholderChecks: {key: keyof FirebaseConfig, varName: string, searchStrings: string[], originalKey: string}[] = [
    { key: 'authDomain', varName: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', searchStrings: ['your-project-id'], originalKey: 'authDomain'},
    { key: 'projectId', varName: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', searchStrings: ['your-project-id'], originalKey: 'projectId' },
    { key: 'storageBucket', varName: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', searchStrings: ['your-project-id'], originalKey: 'storageBucket' },
    { key: 'messagingSenderId', varName: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', searchStrings: ['YOUR_SENDER_ID', '123456789012'], originalKey: 'messagingSenderId' },
    { key: 'appId', varName: 'NEXT_PUBLIC_FIREBASE_APP_ID', searchStrings: ['YOUR_APP_ID', '1:123456789012:web:xxxxxx'], originalKey: 'appId'},
  ];

  for (const check of placeholderChecks) {
    const value = config[check.key];
    if (value) { 
        // Avoid re-warning for apiKey if already handled by the specific API key check
        if (check.key === 'apiKey' && apiKey && (apiKey.startsWith("YOUR_") || apiKey.toUpperCase().includes("XXXX") || apiKey.length < 20 || !apiKey.startsWith("AIzaSy")) && apiKey !== "firebase-emulator-api-key" ) {
            continue;
        }
        if (check.searchStrings.some(s => value.includes(s)) || value.toUpperCase().startsWith("YOUR_")) {
            const warningMessage = `Firebase Configuration Warning: The value ('${value}') for ${check.varName} appears to be a placeholder. Firebase initialization might fail. Please use your actual Firebase project's ${check.originalKey}.`;
            messages.push(warningMessage);
            console.warn(warningMessage);
            isValid = false; // Mark as not strictly valid but don't throw.
        }
    }
  }
  return { isValid, messages };
}

// This flag allows to bypass validation for specific environments if needed.
const BYPASS_FIREBASE_VALIDATION = process.env.BYPASS_FIREBASE_VALIDATION === 'true';

if (!BYPASS_FIREBASE_VALIDATION) {
    try {
        // validateFirebaseConfigInternal will throw for MISSING variables.
        const { isValid: isConfigFormatValid, messages } = validateFirebaseConfigInternal(firebaseConfig);
        if (!isConfigFormatValid && messages.length > 0) {
            // This console.warn is for the case where validateFirebaseConfigInternal itself didn't throw
            // but found non-critical issues (like placeholders or format issues).
            console.warn("FIREBASE CONFIGURATION ISSUES DETECTED (see warnings above). Attempting to proceed, but Firebase services may not initialize correctly.");
        }
    } catch (e: any) {
        // This catch block handles the critical error of MISSING env vars thrown by validateFirebaseConfigInternal.
        // Re-throw to ensure the app does not attempt to run with fatally flawed config.
        // This will cause Next.js to show an error page for missing essential config.
        console.error("FATAL FIREBASE CONFIGURATION ERROR (from validation):", e.message);
        throw e; 
    }
}

// Initialize Firebase
let app: FirebaseApp;
try {
  if (!getApps().length) {
    // Safeguard: Ensure all required config values for initializeApp are strings and not undefined.
    // validateFirebaseConfigInternal should have thrown if they were missing.
    const initConfig = {
      apiKey: firebaseConfig.apiKey!, // Non-null assertion, as missing apiKey would have thrown above.
      authDomain: firebaseConfig.authDomain!,
      projectId: firebaseConfig.projectId!,
      storageBucket: firebaseConfig.storageBucket!,
      messagingSenderId: firebaseConfig.messagingSenderId!,
      appId: firebaseConfig.appId!,
      measurementId: firebaseConfig.measurementId, // measurementId is optional
    };
    app = initializeApp(initConfig);
  } else {
    app = getApp();
  }
} catch (error: any) {
  // This error means Firebase SDK itself could not be initialized with the provided config.
  // This will catch errors like `auth/invalid-api-key` from Firebase if placeholders were used or config is otherwise bad.
  console.error("CRITICAL FIREBASE SDK INITIALIZATION ERROR:", error.message);
  // Provide a more actionable error message to the developer.
  throw new Error(`Critical Firebase SDK Initialization Error: ${error.message}. This often occurs if environment variables (e.g., API key) are placeholders, incorrect, or if Firebase project setup (like enabling Authentication services) is incomplete. Please check your Firebase project configuration and .env.local file.`);
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
//    Example content for .env.local (replace with your actual values):
//    NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
//    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
//    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
//    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
//    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
//    NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:xxxxxx"
//    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX" # Optional
// 6. Restart your Next.js development server after creating/modifying .env.local.
