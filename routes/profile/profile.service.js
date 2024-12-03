export const ProfileService = ({profileDb}) => {
  return {
    getProfile: async (username) => {
      return await profileDb.getProfile(username);
    }
  }
}
