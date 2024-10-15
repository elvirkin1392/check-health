export const ProfileController = ({profileService}) => {
  return {
    getProfiles: async (req, res) => {
      try {
        const result = await profileService.getProfiles(req.query.username);
        res.json(result);
      } catch (error) {
        console.error(error)
        res.sendStatus(500, error);
      }
    }
  }
}
