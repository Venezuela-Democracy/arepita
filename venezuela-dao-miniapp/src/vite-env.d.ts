/// <reference types="vite/client" />

interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        [key: string]: any;
      };
    };
  }