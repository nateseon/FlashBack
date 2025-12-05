import './index.css'
import { MapComponent } from './components/Map';
import { MusicSearch } from './components/MusicSearch';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 1. map (background) */}
      <MapComponent />
      
      {/* 2. music search (floating above the map) */}
      <MusicSearch />
    </div>
  )
}

export default App