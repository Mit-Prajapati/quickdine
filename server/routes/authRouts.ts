import { Router } from "express";
import { getMe, loginUser, ragisterUser } from "../controllers/authcontroller.js";
import { protect } from "../middlwares/auth.js";

const authRouter = Router()

authRouter.post("/ragister",ragisterUser)
authRouter.post("/login",loginUser)
authRouter.get("/me",protect,getMe)


export default authRouter;