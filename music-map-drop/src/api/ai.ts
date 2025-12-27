import type { AiAskRequest, AiAskResponse } from '../types/ai';

// 諛깆뿏??API URL (媛쒕컻 ?섍꼍?먯꽌???먮??덉씠?? ?꾨줈?뺤뀡?먯꽌???ㅼ젣 URL)
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    // Firebase Functions Emulator
    const projectId = 'flashback-25e2f';
    return `http://localhost:5002/${projectId}/us-central1/aiAsk`;
  }
  // Production
  return `https://us-central1-flashback-25e2f.cloudfunctions.net/aiAsk`;
};

export const askAi = async (request: AiAskRequest): Promise<AiAskResponse> => {
  const url = getApiUrl();
  
  try {
    // audioUrl???덈뒗 寃쎌슦 FormData濡??꾩넚, ?꾨땲硫?JSON?쇰줈 ?꾩넚
    if (request.audioUrl) {
      let blob: Blob;
      
      // Blob URL??寃쎌슦 ?ㅼ젣 Blob?쇰줈 蹂??      if (request.audioUrl.startsWith('blob:')) {
        const blobResponse = await fetch(request.audioUrl);
        if (!blobResponse.ok) {
          throw new Error(`Blob fetch failed: ${blobResponse.status}`);
        }
        blob = await blobResponse.blob();
      } else if (request.audioUrl.startsWith('data:')) {
        // Data URL??寃쎌슦 Blob?쇰줈 蹂??        const response = await fetch(request.audioUrl);
        blob = await response.blob();
      } else {
        throw new Error('Unsupported audio URL format');
      }
      
      // Blob ?ш린 ?뺤씤 (10MB ?쒗븳)
      if (blob.size > 10 * 1024 * 1024) {
        throw new Error('Audio file is too large (max 10MB)');
      }
      
      // FormData濡??꾩넚
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('location', JSON.stringify(request.location));
      if (request.text) {
        formData.append('text', request.text);
      }
      
      console.log('AI API call (FormData):', url, {
        hasText: !!request.text,
        hasAudio: true,
        audioSize: blob.size,
      });
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        throw new Error(errorData.error || errorData.details || `API request failed: ${response.status}`);
      }
      
      const data: AiAskResponse = await response.json();
      return data;
    } else {
      // ?띿뒪?몃쭔 ?덈뒗 寃쎌슦 JSON?쇰줈 ?꾩넚
      console.log('AI API call (JSON):', url, {
        hasText: !!request.text,
        hasAudio: false,
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        throw new Error(errorData.error || errorData.details || `API request failed: ${response.status}`);
      }

      const data: AiAskResponse = await response.json();
      return data;
    }
  } catch (error: any) {
    console.error('AI API call error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    // ?ㅽ듃?뚰겕 ?먮윭??寃쎌슦 ??移쒗솕?곸씤 硫붿떆吏
    if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
      throw new Error('Cannot connect to backend server. Please check if the backend is running.');
    }
    
    throw error;
  }
};

