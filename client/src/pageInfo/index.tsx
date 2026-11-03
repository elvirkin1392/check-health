import {useEffect, useState} from "react";

import {instance as axios} from "../axios";
import {useMediaQuery} from "../hooks/useMediaQuery";
import PcVersion from "./PcVersion";
import MobileVersion from "./MobileVersion";
import {UserData} from "./types";
import {storeLang} from "../i18n/currentLang";

const PageInfo = () => {
  const [isMobile] = useMediaQuery();
  const [data, setData] = useState<UserData>({
    bio: {first_name: '', second_name: '', username: ''},
    ill_periods: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await axios.get('api/profile');
      setData(result.data);
      // The bot may have changed it since the last visit (FR-4); the document is the source.
      storeLang(result.data.lang);
    }

    fetchProfile().catch(() => {
      axios.interceptors.request.use(config => {
        config.headers.Authorization = null;
        return config;
      });
      // Сбрасывается вход, а не язык: выбор языка переживает выход и
      // продолжает действовать на экране входа (FR-8).
      localStorage.removeItem('accessToken');
      localStorage.removeItem('username');
    });
  }, [])

  return isMobile ? <MobileVersion data={data}/> : <PcVersion data={data}/>;
};
export default PageInfo;