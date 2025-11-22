import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (server-side ONLY with elevated privileges)
// This should only run on the server, never in the browser
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    // This is OK if running on client side - Admin SDK is server-only
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

