export const ProfileService = ({profileDb}) => {
  return {
    getProfiles: async () => {
      return await profileDb.getProfiles();
    }
  }
}
