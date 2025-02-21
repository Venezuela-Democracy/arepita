import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { TelegramProvider } from './providers/TelegramProvider';
import { Layout } from './components/layout/Layout';
import { Loading } from './components/layout/Loading';
import { Home } from './pages/Home';
import { Packs } from './pages/Packs';
import Collection from './pages/Collection';
import { Market } from './pages/Market';
import { Register } from './pages/Register';
import { useUser } from './hooks/useUser';
import { theme } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Componente wrapper para el Layout
const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// Componente para manejar la lógica de autenticación
const AppRoutes = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Routes>
      {user ? (
        <Route element={<LayoutWrapper />}>
          <Route index element={<Home />} />
          <Route path="packs" element={<Packs />} />
          <Route path="collection" element={<Collection />} />
          <Route path="market" element={<Market />} />
        </Route>
      ) : (
        <Route path="/" element={<Register />} />
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <TelegramProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TelegramProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;