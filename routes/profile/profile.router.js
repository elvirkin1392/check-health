import {Router} from "express";
import {ProfileDb} from "./profile.db.js";
import {db} from "../../db/dbClient.js";
import auth from "../auth/auth.js";
import {ProfileController} from "./profile.controller.js";
import {ProfileService} from "./profile.service.js";

export const profileRouter = Router();

const profileDb = ProfileDb({db});
const profileService = ProfileService({profileDb});
const profileController = ProfileController({profileService});

profileRouter.get("/profile", auth.optional, profileController.getProfiles);
