import {Router} from "express";
import {ProfileDb} from "./profile.db.tsx";
import {db} from "../../db/dbClient.tsx";
import auth from "../auth/auth.tsx";
import {ProfileController} from "./profile.controller.tsx";
import {ProfileService} from "./profile.service.tsx";

export const profileRouter = Router();

const profileDb = ProfileDb({db});
const profileService = ProfileService({profileDb});
const profileController = ProfileController({profileService});

profileRouter.get("/profile", auth.required, profileController.getProfile);
