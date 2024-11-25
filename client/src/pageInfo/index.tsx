import {useEffect, useState} from "react";

import {instance as axios} from "../axios";
import {useMediaQuery} from "../hooks/useMediaQuery";
import PcVersion from "./PcVersion";
import MobileVersion from "./MobileVersion";

type UserData = {
  bio: {};
  ill_periods: [];
};

const PageInfo = () => {
  const [isMobile] = useMediaQuery();
  const [data, setData] = useState<UserData>({bio: {}, ill_periods: []});

  useEffect(() => {
    const fetchProfile = async () => {
      const username = localStorage.getItem('username');
      const result = await axios.get('api/profile', {params: {username}});
      setData(result.data);
    }

    fetchProfile().catch(() => {
      axios.interceptors.request.use(config => {
        config.headers.Authorization = null;
        return config;
      });
      localStorage.clear();
    });
  }, [])

  return isMobile ? <MobileVersion data={data}/> : <PcVersion data={data}/>;
};
export default PageInfo;