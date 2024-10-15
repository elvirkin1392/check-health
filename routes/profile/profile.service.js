export const ProfileService = ({profileDb}) => {
  return {
    getProfiles: async (username) => {
      return await profileDb.getProfiles(username);
    }
  }
}
