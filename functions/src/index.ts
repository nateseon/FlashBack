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

// ElevenLabs TTS request payload
interface TtsRequestBody {
  text?: string;
  voiceId?: string;
}

/**
 * POST /tts
 * Body: { text: string; voiceId?: string }
 * Response: audio/mpeg (MP3) binary
 */
export const tts = functions.https.onRequest(async (req, res) => {
  // Basic CORS (open for rapid prototyping; tighten for production)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // Use only the standard env/secret key name
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const defaultVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE;

  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY is not set");
    res.status(500).json({ error: "TTS configuration error (missing api key)" });
    return;
  }

  const body = req.body as TtsRequestBody;
  const text = body?.text?.trim();
  const voiceId = body?.voiceId || defaultVoiceId;

  if (!text) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  if (!voiceId) {
    console.error("ELEVENLABS_DEFAULT_VOICE (or voiceId in body) is not set");
    res.status(500).json({ error: "TTS voice configuration error" });
    return;
  }

  try {
    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const elevenResponse = await fetch(elevenLabsUrl, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        // Optionally extend with model_id or voice_settings if needed later
        // model_id: "eleven_multilingual_v2",
      }),
    });

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text().catch(() => "");
      console.error("ElevenLabs TTS error", elevenResponse.status, errorText);
      res
        .status(502)
        .json({ error: "TTS provider error", status: elevenResponse.status });
      return;
    }

    const audioArrayBuffer = await elevenResponse.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.byteLength.toString());
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(audioBuffer);
  } catch (error) {
    console.error("Unexpected TTS error", error);
    res.status(500).json({ error: "Internal TTS error" });
  }
});