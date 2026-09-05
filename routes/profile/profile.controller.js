export const ProfileController = ({profileService}) => {
  return {
    getProfile: async (req, res) => {
      try {
        const result = await profileService.getProfile(req.auth.user.id);
        res.json(result);
      } catch (error) {
        console.error(error)
        res.sendStatus(500, error);
      }
    }
  }
}
