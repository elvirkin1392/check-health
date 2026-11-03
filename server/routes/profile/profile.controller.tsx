import {RequestHandler, Response} from "express";
import {Request as JwtRequest} from "express-jwt";
import {ProfileServiceApi} from "./profile.service.tsx";

// Shape of the payload token.utils signs, as express-jwt hands it back on req.auth.
type AuthPayload = {user: {id: string}};

export const ProfileController = ({profileService}: {profileService: ProfileServiceApi}): {getProfile: RequestHandler, setLanguage: RequestHandler} => {
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
    },
    setLanguage: async (req: JwtRequest<AuthPayload>, res: Response) => {
      try {
        // Only the caller's own document: the id comes from the token, never the body.
        const lang = await profileService.setLanguage(req.auth.user.id, req.body?.lang);
        res.json({lang});
      } catch (error) {
        console.error(error)
        res.sendStatus(500);
      }
    }
  }
}
