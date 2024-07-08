import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser)
//router.route("/login").post(loginUser) example

//http://localhost:3000/api/v1/users/register this is how the route will look

export default router