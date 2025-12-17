# FlashBack

## Backend – ElevenLabs TTS (Day 5)

### 환경 변수/시크릿 설정
- Functions 배포용 시크릿(권장):  
  `firebase functions:secrets:set ELEVENLABS_API_KEY`  
  `firebase functions:secrets:set ELEVENLABS_DEFAULT_VOICE`
- 로컬 에뮬레이터에서 사용할 경우(예시):  
  - `functions/.env`에 아래 형태로 추가 (Git에 올리지 말 것)  
    ```
    ELEVENLABS_API_KEY=<your_key>
    ELEVENLABS_DEFAULT_VOICE=<voice_id>
    ```  
  - 또는 `firebase functions:secrets:access ELEVENLABS_API_KEY`로 가져와 환경변수로 주입 후 에뮬레이터 실행.

### HTTPS Function: POST /tts
- 파일: `functions/src/index.ts`  
- 요청 바디(JSON): `{ "text": string, "voiceId"?: string }`  
  - `voiceId`가 없으면 `ELEVENLABS_DEFAULT_VOICE` 사용.
- 응답: `audio/mpeg` MP3 바이너리

### 로컬 에뮬레이터 테스트
```bash
cd functions
npm run build
cd ..
firebase emulators:start --only functions
```
테스트:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"안녕하세요, FlashBack ElevenLabs 테스트입니다."}' \
  http://localhost:5001/<project-id>/us-central1/tts \
  --output local-test.mp3
```

### 배포 후 테스트
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions:tts

curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"프로덕션 TTS 테스트입니다."}' \
  https://us-central1-<project-id>.cloudfunctions.net/tts \
  --output prod-test.mp3
```