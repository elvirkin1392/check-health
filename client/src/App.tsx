import {useEffect, useState} from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import PageStatistics from './pageStatistics/index.tsx'
import PageInfo from './pageInfo/index.tsx'
import PageAuth from './pageAuth/index.tsx'
import PageSettings from './pageSettings/index.tsx'
import {telegramLogin} from "./pageAuth/api";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PageInfo/>,
  },
  {
    path: "/statistics",
    element: <PageStatistics/>,
  },
  {
    path: "/settings",
    element: <PageSettings/>,
  },
], {basename: import.meta.env.BASE_URL});

export default function App() {
  const username = localStorage.getItem('username');

  const [isAuthorized, setAuthorized] = useState(Boolean(username));
  const authorize = (value: boolean) => {
    setAuthorized(value);
  }

  const tg = window.Telegram?.WebApp;
  const [isCheckingTelegram, setCheckingTelegram] = useState(!isAuthorized && Boolean(tg?.initData));

  useEffect(() => {
    if (!tg) {
      return;
    }
    tg.ready();
    tg.expand();

    if (isAuthorized || !tg.initData) {
      return;
    }

    telegramLogin(tg.initData)
      .then(({isCodeVerified}) => setAuthorized(isCodeVerified))
      .finally(() => setCheckingTelegram(false));
  }, []);

  if (isCheckingTelegram) {
    return null;
  }

  return (
    <div>
      {isAuthorized
        ? <RouterProvider router={router}/>
        : <PageAuth onAuthorize={authorize}/>}
    </div>
  );
}
;
