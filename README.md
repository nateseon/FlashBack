# FlashBack

## Backend – ElevenLabs TTS (Day 5)

### Environment Variables/Secrets Setup
- For Functions deployment (recommended):  
  `firebase functions:secrets:set ELEVENLABS_API_KEY`  
  `firebase functions:secrets:set ELEVENLABS_DEFAULT_VOICE`
- For local emulator usage:  
  - Add to `functions/.env` in the following format (do not commit to Git):  
    ```
    ELEVENLABS_API_KEY=<your_key>
    ELEVENLABS_DEFAULT_VOICE=<voice_id>
    ```  
  - Or use `firebase functions:secrets:access ELEVENLABS_API_KEY` to retrieve and inject as environment variable before starting the emulator.

### HTTPS Function: POST /tts
- File: `functions/src/index.ts`  
- Request body (JSON): `{ "text": string, "voiceId"?: string }`  
  - If `voiceId` is not provided, `ELEVENLABS_DEFAULT_VOICE` will be used.
- Response: `audio/mpeg` MP3 binary

### Local Emulator Testing
```bash
cd functions
npm run build
cd ..
firebase emulators:start --only functions
```
Test:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, FlashBack ElevenLabs test."}' \
  http://localhost:5001/<project-id>/us-central1/tts \
  --output local-test.mp3
```

### Production Testing
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions:tts

curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"Production TTS test."}' \
  https://us-central1-<project-id>.cloudfunctions.net/tts \
  --output prod-test.mp3
```

---

## Backend – Gemini AI Integration (Day 8-10)

### Environment Setup
- Vertex AI automatically authenticates using the GCP project where Firebase Functions runs.
- No additional API key setup required (uses GCP project default authentication).

### HTTPS Function: POST /ai/ask

**Request Body (JSON):**
```json
{
  "text": "Are there any sad songs here?",
  "audioUrl": "https://...",  // Optional (STT not implemented yet)
  "location": {
    "latitude": 37.5665,
    "longitude": 126.9780
  }
}
```

**Response (JSON):**
```json
{
  "answerText": "There are a few songs with a sad mood nearby...",
  "tracks": [
    {
      "trackName": "Song Title",
      "artistName": "Artist Name",
      "mood": "sad",
      "coverUrl": "https://...",
      "previewUrl": "https://...",
      "userText": "I listened to this song while...",
      "distance": 0.5
    }
  ],
  "ttsAudioUrl": "data:audio/mpeg;base64,..."  // Optional
}
```

**Features:**
- Uses Gemini 1.5 Flash model
- Responds with an emotional DJ persona
- Queries location-based music drops from Firestore (5km radius)
- Converts response text to ElevenLabs TTS (returns base64-encoded audio URL)

### Local Testing
```bash
cd functions
npm run build
cd ..
firebase emulators:start --only functions,firestore
```

Test request:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What songs are nearby?",
    "location": {
      "latitude": 37.5665,
      "longitude": 126.9780
    }
  }' \
  http://localhost:5001/<project-id>/us-central1/aiAsk
```

### Deployment
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions:aiAsk
```

### API Contract (For Frontend)

**Endpoint:** `POST /ai/ask`

**Request:**
- `text` (string, optional): User question text
- `audioUrl` (string, optional): Audio URL (STT not implemented)
- `location` (object, required): `{ latitude: number, longitude: number }`

**Response:**
- `answerText` (string): AI response text
- `tracks` (array): Recommended track list (max 5 tracks)
- `ttsAudioUrl` (string, optional): TTS audio URL (base64 data URL)
