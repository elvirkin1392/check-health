import {useEffect, useState} from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import PageStatistics from './pageStatistics/index.tsx'
import PageInfo from './pageInfo/index.tsx'
import PageAuth from './pageAuth/index.tsx'
import {instance as axios} from "./axios";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PageInfo/>,
  },
  {
    path: "/statistics",
    element: <PageStatistics/>,
  },
]);

export default function App() {
  const username = localStorage.getItem('username');
  const accessToken = localStorage.getItem('accessToken');

  if(accessToken) {
    axios.interceptors.request.use(config => {
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    });
  }

  const [isAuthorized, setAuthorized] = useState(Boolean(username));
  const authorize = (value: boolean) => {
    setAuthorized(value);
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
