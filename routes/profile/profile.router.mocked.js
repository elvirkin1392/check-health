import {Router} from "express";
import {db} from "../../db/dbClient.js";
import auth from "../auth/auth.js";
import {ProfileController} from "./profile.controller.js";
import {ProfileService} from "./profile.service.js";
import {ProfileDbMocked} from "./profile.db.mocked.js";

export const profileRouterMocked = Router();

const profileDb = ProfileDbMocked({db});
const profileService = ProfileService({profileDb})
const profileController = ProfileController({profileService});

profileRouterMocked.get("/test/profile", auth.optional, profileController.getProfiles);
