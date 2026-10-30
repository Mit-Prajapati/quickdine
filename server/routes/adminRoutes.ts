import { Router } from "express";
import { approveRestaurants, getAdminStats, getAllRestaurants } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middlwares/auth.js";

const adminRouter = Router()

adminRouter.use(protect)
adminRouter.use(adminOnly)


adminRouter.get("/restaurants",getAllRestaurants)
adminRouter.put("/restaurants/:id/approve",approveRestaurants)
adminRouter.get("/stats",getAdminStats)


export default adminRouter;

