export const ProfileDb = ({db}) => {
  const users = db.collection('users');

  return {
    getProfiles: async (username) => {
      const result = await users.findOne({"bio.username": username },)

      return result;
    }
  }
};
