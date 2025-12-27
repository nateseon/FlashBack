import { Link, useLocation } from 'react-router-dom';
import { MicButton } from './MicButton';

interface LayoutProps {
  children: React.ReactNode;
  showMicButton?: boolean;
}

export const Layout = ({ children, showMicButton = false }: LayoutProps) => {
  const location = useLocation();
  const isMapView = location.pathname === '/';
  const isARView = location.pathname === '/ar';

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* 상단바 */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border-b border-gray-700 z-50 safe-area-top">
        <Link to="/" className="text-lg sm:text-xl font-bold text-white touch-manipulation">
          FlashBack
        </Link>
        <div className="flex gap-1.5 sm:gap-2">
          <Link
            to="/"
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
              isMapView
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 active:bg-gray-600 hover:bg-gray-600'
            }`}
          >
            Map
          </Link>
          <Link
            to="/ar"
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
              isARView
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 active:bg-gray-600 hover:bg-gray-600'
            }`}
          >
            AR
          </Link>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-hidden relative">
        {children}
        {showMicButton && (
          <div className="absolute bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-40">
            <MicButton />
          </div>
        )}
      </main>

      {/* 하단 네비게이션 바 */}
      <nav className="flex items-center justify-around px-2 sm:px-4 py-2 sm:py-3 bg-gray-800 border-t border-gray-700 z-50 safe-area-bottom">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 sm:gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors touch-manipulation ${
            location.pathname === '/'
              ? 'text-primary-400'
              : 'text-gray-400 active:text-gray-300 hover:text-gray-300'
          }`}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-[10px] sm:text-xs">Map</span>
        </Link>
        <Link
          to="/ar"
          className={`flex flex-col items-center gap-0.5 sm:gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors touch-manipulation ${
            location.pathname === '/ar'
              ? 'text-primary-400'
              : 'text-gray-400 active:text-gray-300 hover:text-gray-300'
          }`}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] sm:text-xs">AR</span>
        </Link>
        <Link
          to="/drop"
          className={`flex flex-col items-center gap-0.5 sm:gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors touch-manipulation ${
            location.pathname === '/drop'
              ? 'text-primary-400'
              : 'text-gray-400 active:text-gray-300 hover:text-gray-300'
          }`}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-[10px] sm:text-xs">Drop</span>
        </Link>
      </nav>
    </div>
  );
};

