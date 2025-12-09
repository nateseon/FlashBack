import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Request data interface
interface CreateDropRequest {
  artistName?: string;
  trackName?: string;
  coverUrl?: string;
  previewUrl?: string;
  userText?: string;
  mood?: string;
  latitude?: number;
  longitude?: number;
}

// 1. Create drop function (customized for screenshot schema)
export const createDrop = functions.https.onCall(async (request) => {
  // (Optional) Authentication check: Can be commented out during testing if needed
//   if (!request.auth) {
//     throw new functions.https.HttpsError(
//       "unauthenticated",
//       "Authentication is required for this feature."
//     );
//   }

  // 2. Receive data from frontend (matching schema field names)
  const data = request.data as CreateDropRequest;
  const { 
    artistName, 
    trackName, 
    coverUrl, 
    previewUrl, 
    userText, 
    mood, 
    latitude, 
    longitude 
  } = data;

  // 3. Validate required data
  if (!trackName || !latitude || !longitude) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Required information (track name, location) is missing."
    );
  }

  try {
    // 4. Create object to save to database
    const newDrop = {
      // Music information
      artistName: artistName || "Unknown Artist",
      trackName: trackName,
      coverUrl: coverUrl || "",
      previewUrl: previewUrl || "",

      // User input
      userText: userText || "",
      mood: mood || "neutral", // Default value (sad, happy, calm, etc.)
      
      // System management fields
      likeCount: 0, // Initially 0 likes
      location: new admin.firestore.GeoPoint(latitude, longitude), // Convert latitude/longitude
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // Server timestamp
      
      // (Recommended) It's safer to get author information from request.auth
      // Not in the screenshot, but needed later to find 'my posts'
      uid: request.auth?.uid || "anonymous", 
    };

    // 5. Save to 'drops' collection
    const docRef = await db.collection("drops").add(newDrop);

    return { 
      success: true, 
      id: docRef.id, 
      message: "Drop saved successfully!" 
    };

  } catch (error) {
    console.error("Error creating drop:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while saving.");
  }
});