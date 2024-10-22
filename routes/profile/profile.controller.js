export const ProfileController = ({profileService}) => {
  return {
    getProfile: async (req, res) => {
      try {
        const result = await profileService.getProfile(req.query.username);
        res.json(result);
      } catch (error) {
        console.error(error)
        res.sendStatus(500, error);
      }
    }
  }
}
