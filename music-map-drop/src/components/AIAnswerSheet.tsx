import React, { useEffect, useRef, useState } from 'react';
import type { AiAnswerTrack, AiConversationStatus } from '../types/ai';
import { AudioPlayer } from './AudioPlayer';

type AIAnswerSheetProps = {
  status: AiConversationStatus;
  answerText: string;
  tracks: AiAnswerTrack[];
  error: string | null;
  ttsAudioUrl?: string;
  onPlayAudio?: (audioUrl: string) => void;
  onDismiss?: () => void; // Called when the sheet should be dismissed
  autoDismissSeconds?: number; // Auto dismiss after this many seconds (default: 15)
};

export const AIAnswerSheet: React.FC<AIAnswerSheetProps> = ({
  status,
  answerText,
  tracks,
  error,
  ttsAudioUrl,
  onPlayAudio,
  onDismiss,
  autoDismissSeconds = 15,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [displayError, setDisplayError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Auto dismiss the answer sheet after a delay
  useEffect(() => {
    if (answerText && status === 'idle') {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoDismissSeconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [answerText, status, autoDismissSeconds, onDismiss]);

  // Reset visibility when new answer comes in
  useEffect(() => {
    if (status === 'thinking') {
      setIsVisible(true);
    }
  }, [status]);

  // ?먮윭媛 蹂寃쎈릺硫??쒖떆?섍퀬, 10珥????먮룞?쇰줈 ?щ씪吏寃???  useEffect(() => {
    if (error) {
      setDisplayError(error);
      // 5珥????꾩쟾???쒓굅 (9.5珥????좊땲硫붿씠???쒖옉, 0.5珥??좊땲硫붿씠??
      const timer = setTimeout(() => {
        setDisplayError(null);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      // ?먮윭媛 ?놁쑝硫?利됱떆 ?쒓굅
      setDisplayError(null);
    }
  }, [error]);

  useEffect(() => {
    if (ttsAudioUrl && status === 'playing' && onPlayAudio) {
      onPlayAudio(ttsAudioUrl);
    }
  }, [ttsAudioUrl, status, onPlayAudio]);

  const handlePlayPreview = (previewUrl?: string) => {
    if (!previewUrl) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(previewUrl);
    audioRef.current = audio;
    audio.play().catch((err) => {
      console.error('Failed to play audio:', err);
    });
  };

  // Hide if not visible or no content
  if (!isVisible && status === 'idle' && !displayError) {
    return null;
  }
  
  if (status === 'idle' && !answerText && !displayError) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '40vh',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '50vh',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        overflowY: 'auto',
      }}
    >
      {/* 濡쒕뵫 ?ㅼ펷?덊넠 */}
      {status === 'thinking' && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>?쨺</div>
          <div style={{ color: '#666', fontSize: '14px' }}>AI is thinking...</div>
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#007bff',
                  animation: `bounce 1.4s infinite ease-in-out ${i * 0.16}s`,
                }}
              />
            ))}
          </div>
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0); }
              40% { transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* ?먮윭 硫붿떆吏 (10珥????먮룞?쇰줈 ?щ씪吏? */}
      {displayError && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#fee',
            borderRadius: '8px',
            border: '1px solid #fcc',
            color: '#c33',
            animation: 'fadeOut 0.5s ease-out 9.5s forwards',
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          }}
          onAnimationEnd={() => {
            // ?좊땲硫붿씠?섏씠 ?앸굹硫?諛뺤뒪 ?꾩쟾???쒓굅
            setDisplayError(null);
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>?좑툘 Error</div>
          <div style={{ fontSize: '14px' }}>{displayError}</div>
          <style>{`
            @keyframes fadeOut {
              from {
                opacity: 1;
                transform: translateY(0);
              }
              to {
                opacity: 0;
                transform: translateY(-10px);
              }
            }
          `}</style>
        </div>
      )}

      {/* AI ?묐떟 ?띿뒪??*/}
      {answerText && status !== 'thinking' && (
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333',
              whiteSpace: 'pre-wrap',
              marginBottom: '16px',
            }}
          >
            {answerText}
          </div>
          
          {/* TTS ?ㅻ뵒???뚮젅?댁뼱 */}
          {ttsAudioUrl && (
            <AudioPlayer
              audioUrl={ttsAudioUrl}
              autoPlay={status === 'playing'}
              onEnded={() => {
                // ?곹깭??遺紐⑥뿉??愿由?              }}
              onError={() => {
                console.error('TTS audio playback failed');
              }}
            />
          )}
        </div>
      )}

      {/* 異붿쿇 ?몃옓 由ъ뒪??*/}
      {tracks.length > 0 && status !== 'thinking' && (
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#666',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid #eee',
            }}
          >
            Recommended Music ({tracks.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tracks.map((track, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  cursor: track.previewUrl ? 'pointer' : 'default',
                }}
                onClick={() => handlePlayPreview(track.previewUrl)}
              >
                {track.coverUrl && (
                  <img
                    src={track.coverUrl}
                    alt={track.trackName}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: '#333',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {track.trackName}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '4px',
                    }}
                  >
                    {track.artistName}
                  </div>
                  {track.mood && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#999',
                        display: 'inline-block',
                        padding: '2px 6px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '4px',
                        marginTop: '4px',
                      }}
                    >
                      {track.mood}
                    </div>
                  )}
                  {track.distance !== undefined && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#999',
                        marginTop: '4px',
                      }}
                    >
                      {track.distance.toFixed(1)}km away
                    </div>
                  )}
                </div>
                {track.previewUrl && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '20px',
                    }}
                  >
                    ?띰툘
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ?④꺼吏??ㅻ뵒???섎━癒쇳듃 */}
      <audio ref={audioRef} />
    </div>
  );
};

