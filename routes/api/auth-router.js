import express from "express";

import authController from "../../controllers/auth-controller.js";

import {validateBody} from "../../decorators/index.js";

import usersSchemas from "../../schemas/users-schemas.js";

import {authenticate, upload, } from "../../middlewars/index.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(usersSchemas.userSignupSchema), authController.signup)

authRouter.get("/verify/:verificationToken", authController.verify);

authRouter.post("/verify", validateBody(usersSchemas.userEmailSchema), authController.resendVerifyEmail);

authRouter.post("/login", validateBody(usersSchemas.userSigninSchema), authController.signin)

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.signout);

authRouter.patch("/avatars", authenticate, upload.single("avatar"), authController.updateAvatar )

export default authRouter;