import './index.css';
import { useMemo, useState, useEffect, useRef } from 'react';
import { MapComponent } from './components/Map';
import { DropCreator } from './components/DropCreator';
import { MicButton } from './components/MicButton';
import { AIAnswerSheet } from './components/AIAnswerSheet';
import { DropDetailModal } from './components/DropDetailModal';
import { ToastContainer } from './components/Toast';
import { useAiConversation } from './hooks/useAiConversation';
import type { Drop } from './types/drop';

const seedDrops: Drop[] = [
  {
    id: 'seoul-1',
    title: 'N Seoul Tower',
    artist: 'City Nights',
    mood: 'night',
    text: 'Namsan night view is truly artistic',
    lat: 37.5512,
    lng: 126.9882,
    createdAt: Date.now() - 1000 * 60 * 10,
  },
  {
    id: 'seoul-2',
    title: 'Seoul City Hall',
    artist: 'Rainy Mood',
    mood: 'calm',
    text: 'The feeling in front of City Hall on a rainy day',
    lat: 37.5665,
    lng: 126.9780,
    createdAt: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'sea-1',
    title: 'Seattle Downtown',
    artist: 'Chill Vibes',
    mood: 'chill',
    text: 'Vibes near Pike Place Market',
    lat: 47.6062,
    lng: -122.3321,
    createdAt: Date.now() - 1000 * 60 * 2,
  },
];

const MyDropsList = ({ drops, onSelect, onMapCenterChange }: { drops: Drop[]; onSelect: (drop: Drop) => void; onMapCenterChange: (drop: Drop) => void; }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      maxHeight: '35vh',
      overflowY: 'auto',
      background: 'rgba(0,0,0,0.75)',
      color: 'white',
      padding: '12px 16px',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>My Drops ({drops.length})</div>
      {drops.length === 0 && <div style={{ color: '#bbb' }}>No drops yet. Add one from the modal.</div>}
      {drops.map((drop) => (
        <div
          key={drop.id}
          onClick={() => onMapCenterChange(drop)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: '#111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            color: '#ffde59',
            flexShrink: 0,
          }}>
            LP
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
              {drop.title}
            </div>
            <div style={{ fontSize: 12, color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
              {drop.artist || 'Unknown Artist'} · {drop.mood || 'mood'}
            </div>
            {drop.text && (
              <div style={{ fontSize: 11, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {drop.text}
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(drop);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            Details
          </button>
        </div>
      ))}
    </div>
  );
};

function App() {
  const [myDrops, setMyDrops] = useState<Drop[]>(seedDrops);
  const initialCenter = useMemo(
    () => ({ lat: seedDrops[0].lat, lng: seedDrops[0].lng }),
    []
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(initialCenter);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'error' | 'success' | 'info' }>>([]);
  const lastQuestionRef = useRef<string>('');

  // AI 대화 훅
  const aiConversation = useAiConversation();

  // Toast 추가 함수
  const addToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // Toast 제거 함수
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Failed to get location:', error);
          // 기본값으로 서울 사용
          setCurrentLocation({
            latitude: 37.5665,
            longitude: 126.9780,
          });
        }
      );
    } else {
      // 기본값으로 서울 사용
      setCurrentLocation({
        latitude: 37.5665,
        longitude: 126.9780,
      });
    }
  }, []);

  const handleAddDrop = (drop: Drop) => {
    setMyDrops((prev) => [drop, ...prev]);
    setMapCenter({ lat: drop.lat, lng: drop.lng });
  };

  const handleSelectDrop = (drop: Drop) => {
    setSelectedDrop(drop); // 상세 모달 표시
  };

  const handleMapCenterChange = (drop: Drop) => {
    setMapCenter({ lat: drop.lat, lng: drop.lng });
  };

  // 마이크 녹음 완료 핸들러
  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (!currentLocation) {
      addToast('Unable to get location information.', 'error');
      aiConversation.setStatus('idle');
      return;
    }

    try {
      // Blob을 URL로 변환
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // 백엔드에 전송하고 응답 받기
      const response = await aiConversation.askWithAudio(audioUrl, currentLocation);
      
      // 응답에서 직접 ttsAudioUrl 가져오기
      if (response?.ttsAudioUrl) {
        aiConversation.setStatus('playing');
        const audio = new Audio(response.ttsAudioUrl);
        audio.onended = () => {
          aiConversation.setStatus('idle');
        };
        audio.onerror = () => {
          aiConversation.setStatus('idle');
        };
        await audio.play();
      } else {
        // TTS 오디오가 없으면 상태만 idle로 변경
        aiConversation.setStatus('idle');
      }
      
      // 임시 URL 정리
      URL.revokeObjectURL(audioUrl);
    } catch (error: any) {
      console.error('AI 질문 처리 실패:', error);
      aiConversation.setStatus('idle');
      
      // 네트워크 에러인 경우
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('연결할 수 없습니다') || error?.message?.includes('cannot connect')) {
        addToast('Network connection failed. Please try again.', 'error');
      } else {
        addToast(error?.message || 'An error occurred while processing AI question.', 'error');
      }
    }
  };

  // TTS 오디오 재생 핸들러
  const handlePlayTtsAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      aiConversation.setStatus('idle');
    };
    audio.onerror = () => {
      aiConversation.setStatus('idle');
    };
    audio.play().catch((err) => {
      console.error('TTS 오디오 재생 실패:', err);
      aiConversation.setStatus('idle');
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 1. map (background) */}
      <MapComponent drops={myDrops} center={mapCenter} />
      
      {/* 2. music search (floating above the map) */}
      <DropCreator onAddDrop={handleAddDrop} />

      {/* 3. AI Answer Sheet */}
      <AIAnswerSheet
        status={aiConversation.status}
        answerText={aiConversation.lastAnswer}
        tracks={aiConversation.answerTracks}
        error={aiConversation.error}
        ttsAudioUrl={aiConversation.ttsAudioUrl}
        onPlayAudio={handlePlayTtsAudio}
        onDismiss={aiConversation.reset}
        autoDismissSeconds={15}
      />

      {/* 4. AI Input (Text input + Mic Button) - Moved to top */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        {/* Text input */}
        {aiConversation.status === 'idle' && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '8px 12px',
              borderRadius: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <input
              type="text"
              placeholder={currentLocation ? "Ask AI..." : "Loading location..."}
              disabled={!currentLocation}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && currentLocation && e.currentTarget.value.trim()) {
                  const text = e.currentTarget.value.trim();
                  
                  // 같은 질문 연속 클릭 시 상태 초기화
                  if (lastQuestionRef.current === text && aiConversation.status !== 'idle') {
                    aiConversation.reset();
                    lastQuestionRef.current = '';
                    e.currentTarget.value = '';
                    return;
                  }
                  
                  lastQuestionRef.current = text;
                  e.currentTarget.value = '';
                  
                  try {
                    // 백엔드에 전송하고 응답 받기
                    const response = await aiConversation.askWithText(text, currentLocation);
                    
                    // 응답에서 직접 ttsAudioUrl 가져오기
                    if (response?.ttsAudioUrl) {
                      aiConversation.setStatus('playing');
                      const audio = new Audio(response.ttsAudioUrl);
                      audio.onended = () => {
                        aiConversation.setStatus('idle');
                      };
                      audio.onerror = () => {
                        aiConversation.setStatus('idle');
                      };
                      await audio.play();
                    } else {
                      // TTS 오디오가 없으면 상태만 idle로 변경
                      aiConversation.setStatus('idle');
                    }
                  } catch (error: any) {
                    console.error('Failed to process AI question:', error);
                    aiConversation.setStatus('idle');
                    
                    // 네트워크 에러인 경우
                    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Cannot connect')) {
                      addToast('Network connection failed. Please try again.', 'error');
                    } else {
                      addToast(error?.message || 'An error occurred while processing AI question.', 'error');
                    }
                  }
                }
              }}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              width: '200px',
              backgroundColor: 'transparent',
            }}
          />
          </div>
        )}
        
        <MicButton
          status={aiConversation.status}
          onStatusChange={(status) => {
            // 같은 질문 연속 클릭 시 상태 초기화
            if (status === 'recording' && aiConversation.status === 'recording') {
              aiConversation.reset();
              lastQuestionRef.current = '';
              return;
            }
            aiConversation.setStatus(status);
          }}
          onRecordingComplete={handleRecordingComplete}
          onError={(error) => {
            addToast(error.message, 'error');
          }}
          disabled={!currentLocation}
        />
      </div>

      {/* 5. my drops list (bottom sheet style) */}
      <MyDropsList drops={myDrops} onSelect={handleSelectDrop} onMapCenterChange={handleMapCenterChange} />

      {/* 6. Drop Detail Modal */}
      <DropDetailModal drop={selectedDrop} onClose={() => setSelectedDrop(null)} />

      {/* 7. Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;