import { useState } from 'react';
import { AIAnswerSheet } from '../components/AIAnswerSheet';

export const ARPage = () => {
  const [isAIAnswerOpen, setIsAIAnswerOpen] = useState(false);

  return (
    <div className="relative w-full h-full bg-gray-900 flex items-center justify-center p-4">
      {/* AR 뷰 플레이스홀더 */}
      <div className="text-center space-y-4 w-full max-w-md">
        <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gray-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-600 mx-auto">
          <svg className="w-16 h-16 sm:w-24 sm:h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm sm:text-base text-gray-400">AR View (Coming Soon)</p>
        <button
          onClick={() => setIsAIAnswerOpen(true)}
          className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary-600 active:bg-primary-700 hover:bg-primary-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors touch-manipulation"
        >
          AI 추천 열기 (테스트)
        </button>
      </div>

      <AIAnswerSheet
        isOpen={isAIAnswerOpen}
        onClose={() => setIsAIAnswerOpen(false)}
      />
    </div>
  );
};

