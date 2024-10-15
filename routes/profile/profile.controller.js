export const ProfileController = ({profileService}) => {
  return {
    getProfiles: async (req, res) => {
      try {
        const result = await profileService.getProfiles();
        res.json({result});
      } catch (error) {
        res.sendStatus(500);
      }
    }
  }
}
