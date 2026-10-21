import {ObjectId, WithId} from "mongodb";
import {UserDoc} from "../../db/templates/UserTemplate.tsx";
import {ProfileDbApi} from "./profile.db.tsx";

export type ProfileServiceApi = {
  getProfile: (userId: string | ObjectId) => Promise<WithId<UserDoc> | null>
};

export const ProfileService = ({profileDb}: {profileDb: ProfileDbApi}): ProfileServiceApi => {
  return {
    getProfile: async (userId) => {
      return await profileDb.getProfileById(userId);
    }
  }
}
