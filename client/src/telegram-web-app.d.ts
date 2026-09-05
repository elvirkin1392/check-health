interface TelegramWebApp {
  initData: string;
  ready: () => void;
  expand: () => void;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
