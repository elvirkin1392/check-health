import {Db, ObjectId, WithId} from "mongodb";
import {UserDoc} from "../../db/templates/UserTemplate.tsx";

export type ProfileDbApi = {
  getProfileById: (id: string | ObjectId) => Promise<WithId<UserDoc> | null>
  saveLanguage: (id: string | ObjectId, lang: string) => Promise<void>
};

export const ProfileDb = ({db}: {db: Db}): ProfileDbApi => {
  const users = db.collection<UserDoc>('users');

  return {
    getProfileById: async (id) => {
      const result = await users.findOne({_id: new ObjectId(id)});

      return result;
    },
    saveLanguage: async (id, lang) => {
      // The same `lang` field the bot reads and writes: one value for both (FR-4).
      await users.updateOne({_id: new ObjectId(id)}, {$set: {lang}});
    }
  }
};
