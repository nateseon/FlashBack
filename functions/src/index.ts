import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { VertexAI } from "@google-cloud/vertexai";
import { SpeechClient } from "@google-cloud/speech";

admin.initializeApp();
const db = admin.firestore();

// Initialize Vertex AI (Gemini)
const projectId = process.env.GCLOUD_PROJECT || "flashback-25e2f";
const location = "us-central1";
const vertexAI = new VertexAI({ project: projectId, location });

// Initialize Speech-to-Text client
const speechClient = new SpeechClient();

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

// ========== Day 8-10: Gemini AI Integration ==========
// ========== Day 11-12: STT Integration ==========

// Helper: Convert audio URL to text using Google Cloud Speech-to-Text
async function transcribeAudio(audioUrl: string): Promise<string | null> {
  try {
    // Download audio from URL
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      console.error("Failed to download audio:", audioResponse.status);
      return null;
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBytes = Buffer.from(audioBuffer).toString("base64");

    // Detect audio format from URL or Content-Type
    // Default to WEBM_OPUS (common from MediaRecorder), but try to detect
    let encoding: "WEBM_OPUS" | "LINEAR16" | "FLAC" | "MP3" = "WEBM_OPUS";
    const contentType = audioResponse.headers.get("content-type") || "";
    const urlLower = audioUrl.toLowerCase();
    
    if (urlLower.includes(".wav") || contentType.includes("wav")) {
      encoding = "LINEAR16";
    } else if (urlLower.includes(".flac") || contentType.includes("flac")) {
      encoding = "FLAC";
    } else if (urlLower.includes(".mp3") || contentType.includes("mp3")) {
      encoding = "MP3";
    }

    // Configure Speech-to-Text request
    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: encoding,
        sampleRateHertz: encoding === "WEBM_OPUS" ? 48000 : 16000, // Adjust based on format
        languageCode: "ko-KR", // Korean (primary)
        alternativeLanguageCodes: ["en-US"], // Fallback to English
        enableAutomaticPunctuation: true,
        model: "latest_long", // Best for longer audio
        useEnhanced: true, // Use enhanced model for better accuracy
      },
    };

    // Perform transcription with timeout
    const [response] = await Promise.race([
      speechClient.recognize(request),
      new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error("STT timeout")), 10000) // 10s timeout
      ),
    ]);
    
    if (!response.results || response.results.length === 0) {
      console.warn("No transcription results");
      return null;
    }

    // Combine all transcription results
    const transcript = response.results
      .map((result: any) => result.alternatives?.[0]?.transcript)
      .filter((text: any) => text)
      .join(" ");

    return transcript || null;
  } catch (error) {
    console.error("STT error:", error);
    // Return null to allow fallback to text input
    return null;
  }
}

// Helper: Query nearby drops from Firestore
async function queryNearbyDrops(
  latitude: number,
  longitude: number,
  radiusKm: number = 5,
  mood?: string,
  limit: number = 10
): Promise<any[]> {
  try {
    // Query drops collection
    let query = db.collection("drops").limit(limit);
    
    // Filter by mood if provided
    if (mood) {
      query = query.where("mood", "==", mood);
    }
    
    const snapshot = await query.get();
    const drops: any[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const dropLocation = data.location;
      
      if (dropLocation && dropLocation instanceof admin.firestore.GeoPoint) {
        // Calculate distance (Haversine formula - simplified)
        const distance = calculateDistance(
          latitude,
          longitude,
          dropLocation.latitude,
          dropLocation.longitude
        );
        
        if (distance <= radiusKm) {
          drops.push({
            id: doc.id,
            trackName: data.trackName || "",
            artistName: data.artistName || "",
            mood: data.mood || "neutral",
            userText: data.userText || "",
            coverUrl: data.coverUrl || "",
            previewUrl: data.previewUrl || "",
            distance: Math.round(distance * 100) / 100, // Round to 2 decimals
            likeCount: data.likeCount || 0,
          });
        }
      }
    });
    
    // Sort by distance
    drops.sort((a, b) => a.distance - b.distance);
    return drops;
  } catch (error) {
    console.error("Error querying nearby drops:", error);
    return [];
  }
}

// Helper: Calculate distance between two coordinates (Haversine)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Generate TTS audio URL (internal call to tts function)
async function generateTtsAudio(text: string): Promise<string | null> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const defaultVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE;
    
    if (!apiKey || !defaultVoiceId) {
      console.error("TTS configuration missing");
      return null;
    }
    
    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${defaultVoiceId}`;
    const response = await fetch(elevenLabsUrl, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      console.error("TTS generation failed:", response.status);
      return null;
    }
    
    // For now, return a placeholder URL. In production, you might want to:
    // 1. Upload to Cloud Storage and return public URL
    // 2. Return base64 encoded audio
    // 3. Return a signed URL
    // For now, we'll return a data URL pattern or handle it in frontend
    const audioBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");
    return `data:audio/mpeg;base64,${base64}`;
  } catch (error) {
    console.error("TTS generation error:", error);
    return null;
  }
}

// AI Ask request interface
interface AiAskRequest {
  text?: string;
  audioUrl?: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

/**
 * POST /ai/ask
 * Body: { text?: string; audioUrl?: string; location: { latitude, longitude } }
 * Response: { answerText: string; tracks: any[]; ttsAudioUrl?: string }
 */
export const aiAsk = functions.https.onRequest(async (req, res) => {
  // CORS
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

  try {
    const body = req.body as AiAskRequest;
    const { text, audioUrl, location } = body;

    // Validate input
    if (!text && !audioUrl) {
      res.status(400).json({ error: "Either text or audioUrl is required" });
      return;
    }

    if (!location?.latitude || !location?.longitude) {
      res.status(400).json({ error: "Location (latitude, longitude) is required" });
      return;
    }

    // Process audio input if provided (Day 11-12: STT integration)
    let userQuery = text;
    
    // Start Firestore query and STT in parallel for better performance
    const [nearbyDrops, transcribedText] = await Promise.all([
      queryNearbyDrops(
        location.latitude,
        location.longitude,
        5, // 5km radius
        undefined, // No mood filter for now
        20 // Limit to 20 drops
      ),
      audioUrl && !text ? transcribeAudio(audioUrl) : Promise.resolve(null),
    ]);

    if (!userQuery && audioUrl) {
      if (transcribedText) {
        userQuery = transcribedText;
        console.log("STT result:", transcribedText);
      } else {
        res.status(400).json({ error: "Failed to transcribe audio. Please try again or use text input." });
        return;
      }
    }

    if (!userQuery) {
      res.status(400).json({ error: "Either text or audioUrl with valid transcription is required" });
      return;
    }

    // Initialize Gemini model with Function Calling
    const model = vertexAI.preview.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    // Define function for Firestore query (for Function Calling)
    // Note: Function Calling will be implemented in a simplified way for Day 8-10
    // Full Function Calling integration can be enhanced later

    // System prompt: Emotional DJ persona
    const systemPrompt = `You are a warm, emotional DJ for the city. Your role is to help people discover music memories and stories shared by others in their area.

When users ask questions like:
- "Are there any sad songs here?"
- "What music is nearby?"
- "Tell me about songs in this area"
- "Recommend something based on my mood"

Use the search_nearby_music function to find relevant drops, then respond warmly and personally. Share the stories and emotions behind the music. Be conversational, empathetic, and make users feel connected to the music community around them.

Current location context: ${location.latitude}, ${location.longitude}
Nearby drops found: ${nearbyDrops.length} drops within 5km

Format your response naturally, mentioning specific songs and artists when relevant.`;

    // Prepare user message
    const userMessage = userQuery;

    // Prepare context with nearby drops for Gemini
    const dropsContext = nearbyDrops.length > 0
      ? `\n\nHere are ${nearbyDrops.length} music drops I found nearby:\n${JSON.stringify(nearbyDrops.slice(0, 10), null, 2)}`
      : "\n\nNo music drops found nearby yet. Encourage the user to drop their own music memory!";

    const queryWithContext = `${userMessage}${dropsContext}\n\nPlease respond warmly as an emotional DJ, mentioning specific songs and stories when relevant.`;

    // Call Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm your emotional DJ, ready to help you discover music memories in your area." }],
        },
        {
          role: "user",
          parts: [{ text: queryWithContext }],
        },
      ],
    });

    const response = result.response;
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I couldn't generate a response. Please try again.";

    // Extract recommended tracks from nearby drops (top 5 by relevance)
    const recommendedTracks = nearbyDrops.slice(0, 5).map((drop) => ({
      trackName: drop.trackName,
      artistName: drop.artistName,
      mood: drop.mood,
      coverUrl: drop.coverUrl,
      previewUrl: drop.previewUrl,
      userText: drop.userText,
      distance: drop.distance,
    }));

    // Generate TTS audio
    const ttsAudioUrl = await generateTtsAudio(responseText);

    // Return response
    res.status(200).json({
      answerText: responseText,
      tracks: recommendedTracks,
      ttsAudioUrl: ttsAudioUrl || undefined,
    });
  } catch (error) {
    console.error("AI Ask error:", error);
    res.status(500).json({ error: "Internal AI error", details: String(error) });
  }
});