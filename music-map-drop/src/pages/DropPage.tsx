import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicSearch } from '../components/MusicSearch';
import { DropModal } from '../components/DropModal';
import type { ItunesSong, MusicDrop } from '../types/music';
import { createDrop } from '../api/drops';

export const DropPage = () => {
  const navigate = useNavigate();
  const [selectedSong, setSelectedSong] = useState<ItunesSong | null>(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSongSelect = (song: ItunesSong) => {
    setSelectedSong(song);
    setIsDropModalOpen(true);
  };

  const handleDrop = async (newDrop: MusicDrop) => {
    setIsSubmitting(true);
    try {
      // 백엔드 API 호출 (현재는 임시로 로컬 처리)
      await createDrop({
        song: newDrop.song,
        text: newDrop.text,
        tags: newDrop.tags,
        location: newDrop.location,
      });
      // 성공 시 홈으로 이동
      navigate('/');
    } catch (error) {
      console.error('Failed to create drop:', error);
      // TODO: 에러 처리 (토스트 메시지 등)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Drop Music</h1>
          <p className="text-sm sm:text-base text-gray-400">Find a song to drop with your memory</p>
        </div>
        
        <MusicSearch onSongSelect={handleSongSelect} />
      </div>

      <DropModal
        isOpen={isDropModalOpen}
        onClose={() => setIsDropModalOpen(false)}
        selectedSong={selectedSong}
        onDrop={handleDrop}
      />
    </div>
  );
};

