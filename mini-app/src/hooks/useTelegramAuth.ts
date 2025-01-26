import { useEffect, useState } from 'react';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

type UserData = {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
};

export const useTelegramAuth = () => {
  const webApp = useWebApp();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (webApp?.initDataUnsafe?.user) {
      const { id, first_name, username, photo_url } = webApp.initDataUnsafe.user;
      setUser({
        id,
        first_name,
        username,
        photo_url
      });
    }
  }, [webApp]);

  return { user, initData: webApp?.initData };
};