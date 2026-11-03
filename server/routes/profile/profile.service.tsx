import {ObjectId, WithId} from "mongodb";
import {UserDoc} from "../../db/templates/UserTemplate.tsx";
import {ProfileDbApi} from "./profile.db.tsx";
import {Lang, resolveLang} from "../../../shared/lang.tsx";

export type ProfileServiceApi = {
  getProfile: (userId: string | ObjectId) => Promise<WithId<UserDoc> | null>
  // Выбор языка в Mini App пишется в то же поле, что и выбор в боте (FR-4).
  setLanguage: (userId: string | ObjectId, lang: string) => Promise<Lang>
};

export const ProfileService = ({profileDb}: {profileDb: ProfileDbApi}): ProfileServiceApi => {
  return {
    getProfile: async (userId) => {
      return await profileDb.getProfileById(userId);
    },
    setLanguage: async (userId, lang) => {
      // The value comes from the client, so it is narrowed before it is written (§13).
      const resolved = resolveLang(lang);
      await profileDb.saveLanguage(userId, resolved);

      return resolved;
    }
  }
}
