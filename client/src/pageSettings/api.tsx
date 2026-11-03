import {instance as axios} from "../axios";
import {Lang, resolveLang} from "../i18n";

export const saveLanguage = async (lang: Lang): Promise<Lang> => {
  const response = await axios.put('/api/profile/language', {lang});
  return resolveLang(response.data?.lang);
}
