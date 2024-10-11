import {createBrowserRouter, RouterProvider} from "react-router-dom";
import PageInfo from './pageInfo/index.tsx'
import PageAuth from './pageAuth/index.tsx'
import PageStatistics from './pageStatistics/index.tsx'
import Header from "./general/header.tsx";
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
  const [isAuthorized, setAuthorized] = useState(true);

  const authorize = (value: boolean) => {
    setAuthorized(value);
    console.log('isAuthorized', isAuthorized)
  }

  return (
    <div>
      {isAuthorized ? <div>
        {/*<Header/>*/}
        <div style={{marginTop: '50px'}}>
          <RouterProvider router={router}/>
        </div>
      </div> : <PageAuth onAuthorize={authorize}/>}
    </div>
  );
};
