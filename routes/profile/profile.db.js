import {ObjectId} from "mongodb";

export const ProfileDb = ({db}) => {
  const users = db.collection('users');

  return {
    getProfileById: async (id) => {
      const result = await users.findOne({_id: new ObjectId(id)});

      return result;
    }
  }
};
