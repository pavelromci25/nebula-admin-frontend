import { useState, useEffect } from 'react';

interface TelegramUser {
  id?: number;
}

interface InitDataUnsafe {
  user?: TelegramUser;
}

interface TelegramWebApp {
  initDataUnsafe: InitDataUnsafe;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [userId, setUserId] = useState<string>('guest');
  const [isTelegram, setIsTelegram] = useState<boolean>(false);

  useEffect(() => {
    const loadUserData = () => {
      console.log('useTelegram: Checking for Telegram Web App...');
      if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        console.log('useTelegram: Telegram Web App found:', webApp);
        const initDataUnsafe = webApp.initDataUnsafe;
        console.log('useTelegram: initDataUnsafe=', initDataUnsafe);
        const user = initDataUnsafe?.user;

        if (user && user.id) {
          console.log('useTelegram: User found, userId=', user.id);
          setUserId(user.id.toString());
          setIsTelegram(true);
        } else {
          console.log('useTelegram: No user found in initDataUnsafe');
          setUserId('guest');
          setIsTelegram(false);
        }
      } else {
        console.log('useTelegram: Telegram Web App not found');
        setUserId('guest');
        setIsTelegram(false);
      }
    };

    loadUserData();

    const script = document.querySelector('script[src="https://telegram.org/js/telegram-web-app.js"]');
    if (script && !window.Telegram?.WebApp) {
      console.log('useTelegram: Waiting for Telegram Web App script to load...');
      const loadHandler = () => loadUserData();
      script.addEventListener('load', loadHandler);
      return () => script.removeEventListener('load', loadHandler);
    }
  }, []);

  console.log('useTelegram: Returning userId=', userId, 'isTelegram=', isTelegram);
  return {
    userId,
    isTelegram,
  };
}