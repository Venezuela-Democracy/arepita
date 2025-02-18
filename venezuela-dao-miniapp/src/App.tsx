import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramProvider } from './providers/TelegramProvider';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Packs } from './pages/Packs';
import Collection from './pages/Collection';
import { Market } from './pages/Market';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/packs" element={<Packs />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/market" element={<Market />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TelegramProvider>
    </QueryClientProvider>
  );
}

export default App;