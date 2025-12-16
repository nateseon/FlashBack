import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapComponent } from '../components/Map';
import { MyDropsList } from '../components/MyDropsList';
import { AIAnswerSheet } from '../components/AIAnswerSheet';
import { MicButton } from '../components/MicButton';
import { useDrops } from '../state/drops';

export const HomePage = () => {
  const navigate = useNavigate();
  const { drops } = useDrops();
  const [isAIAnswerOpen, setIsAIAnswerOpen] = useState(false);

  const handleMicClick = () => {
    setIsAIAnswerOpen(true);
  };

  return (
    <div className="relative w-full h-full">
      <MapComponent drops={drops} />
      <MyDropsList drops={drops} />
      <button
        type="button"
        onClick={() => navigate('/drop')}
        className="absolute bottom-20 sm:bottom-24 right-3 sm:right-4 z-40 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-colors touch-manipulation"
      >
        + Drop Music
      </button>
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-40">
        <MicButton onStartRecording={handleMicClick} />
      </div>
      <AIAnswerSheet
        isOpen={isAIAnswerOpen}
        onClose={() => setIsAIAnswerOpen(false)}
      />
    </div>
  );
};

