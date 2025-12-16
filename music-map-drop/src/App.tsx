import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ARPage } from './pages/ARPage';
import { DropPage } from './pages/DropPage';
import { CardDetailPage } from './pages/CardDetailPage';
import { DropsProvider } from './state/drops';
import './index.css';

function App() {
  return (
    <DropsProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout showMicButton={false}>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/ar"
            element={
              <Layout showMicButton={true}>
                <ARPage />
              </Layout>
            }
          />
          <Route
            path="/drop"
            element={
              <Layout>
                <DropPage />
              </Layout>
            }
          />
          <Route
            path="/card/:id"
            element={
              <Layout>
                <CardDetailPage />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </DropsProvider>
  );
}

export default App;
