import {createBrowserRouter, RouterProvider} from "react-router-dom";
import PageInfo from './pageInfo/index.tsx'
import PageAuth from './pageAuth/index.tsx'
import PageStatistics from './pageStatistics/index.tsx'
import {useState} from "react";

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
  const [isAuthorized, setAuthorized] = useState(false);

  const authorize = (value: boolean) => {
    setAuthorized(value);
    console.log('isAuthorized', isAuthorized)
  }

  return (
    <div>
      {isAuthorized ?
        <RouterProvider router={router}/>
        : <PageAuth onAuthorize={authorize}/>}
    </div>
  );
}
;
