export const ProfileService = ({profileDb}) => {
  return {
    getProfile: async (userId) => {
      return await profileDb.getProfileById(userId);
    }
  }
}
