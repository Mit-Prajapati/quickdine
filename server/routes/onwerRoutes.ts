import { Router } from "express";
import { createOwnerRestaurant, getOnwerBookings, getOwnerRestaurant, updateBookingStatus, updateOwnerRestaurant } from "../controllers/onwerController.js";
import upload from "../config/multer.js";
import { onwerOnly, protect } from "../middlwares/auth.js";

const onwerRouter = Router();
onwerRouter.use(protect)
onwerRouter.use(onwerOnly)

onwerRouter.get("/restaurants",getOwnerRestaurant)
onwerRouter.post("/restaurants",upload.single("image"),createOwnerRestaurant)
onwerRouter.put("/restaurants",upload.single("image"),updateOwnerRestaurant)
onwerRouter.get("/bookings",getOnwerBookings)
onwerRouter.put("/bookings/:id/status",updateBookingStatus)


export default onwerRouter;

