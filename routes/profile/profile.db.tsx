import {Db, ObjectId, WithId} from "mongodb";
import {UserDoc} from "../../db/templates/UserTemplate.tsx";

export type ProfileDbApi = {
  getProfileById: (id: string | ObjectId) => Promise<WithId<UserDoc> | null>
};

export const ProfileDb = ({db}: {db: Db}): ProfileDbApi => {
  const users = db.collection<UserDoc>('users');

  return {
    getProfileById: async (id) => {
      const result = await users.findOne({_id: new ObjectId(id)});

      return result;
    }
  }
};
