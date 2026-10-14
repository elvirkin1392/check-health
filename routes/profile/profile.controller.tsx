import {RequestHandler, Response} from "express";
import {Request as JwtRequest} from "express-jwt";
import {ProfileServiceApi} from "./profile.service.tsx";

// Shape of the payload token.utils signs, as express-jwt hands it back on req.auth.
type AuthPayload = {user: {id: string}};

export const ProfileController = ({profileService}: {profileService: ProfileServiceApi}): {getProfile: RequestHandler} => {
  return {
    getProfile: async (req: JwtRequest<AuthPayload>, res: Response) => {
      try {
        const result = await profileService.getProfile(req.auth.user.id);
        res.json(result);
      } catch (error) {
        console.error(error)
        // sendStatus takes only a status; the error argument here was always ignored.
        res.sendStatus(500);
      }
    }
  }
}
