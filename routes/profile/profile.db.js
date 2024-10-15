export const ProfileDb = ({db}) => {
  const users = db.collection('users');

  return {
    getProfiles: async () => {
      const cursor = await users.find({}, {limit: 10})
      const result = await cursor.toArray()

      return result;
    }
  }
};
