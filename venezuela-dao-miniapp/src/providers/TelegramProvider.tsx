import { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramContextType {
  webApp: typeof WebApp;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Inicializar la WebApp
    WebApp.ready();
    // Configurar el tema
    WebApp.setHeaderColor('secondary_bg_color');
    WebApp.setBackgroundColor('bg_color');
    setIsReady(true);
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp: WebApp, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};