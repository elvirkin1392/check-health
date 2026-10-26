import {ObjectId, WithId} from "mongodb";
import {UserDoc} from "../../db/templates/UserTemplate.tsx";
import {ProfileDbApi} from "./profile.db.tsx";
import {Lang} from "../../../shared/lang.tsx";

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
    setLanguage: async (_userId, _lang) => {
      throw new Error('not implemented');
    }
  }
}
