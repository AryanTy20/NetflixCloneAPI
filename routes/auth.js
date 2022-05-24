import { Router } from "express";
const router = Router();

import { AuthHandler } from "../controller/auth";
import { Otp, Auth, Email } from "../middleware";

//join
router.post("/register", AuthHandler.register);
router.post("/activate", Otp, AuthHandler.activate);

//auth
router.post("/login", AuthHandler.login);
router.get("/logout", Auth, AuthHandler.logout);

//reset
router.post("/forgot", Email, AuthHandler.forgot);
router.post("/reset", AuthHandler.reset);

//refreshToken
router.get("/refresh", AuthHandler.refresh);

//users
router.get("/users", Auth, AuthHandler.users);
router.put("/user", Auth, AuthHandler.addUsers);
router.patch("/updateuser/:userid", Auth, AuthHandler.updateUser);
router.delete("/deleteuser/:userid", Auth, AuthHandler.deleteUser);

//profile
router.get("/profile", Auth, AuthHandler.profile);
router.patch("/updateprofile", Auth, AuthHandler.updateProfile);
router.delete("/deleteprofile", Auth, AuthHandler.deleteProfile);

//OTP REQUEST
router.post("/resetotp", Email, AuthHandler.resetOTP);
router.post("/activateotp", AuthHandler.activateOTP);
router.post("/emailotp", Auth, AuthHandler.emailOTP);

//verify OTP
router.post("/verifyotp", Otp, AuthHandler.verifyOTP);

export default router;
