import { Router } from "express";
import { protect } from "../middlwares/auth.js";
import { cancelBookings, createBooking, getMyBookings } from "../controllers/bookingController.js";


const bookingRouter = Router();
bookingRouter.post("/",protect,createBooking)
bookingRouter.get("/my",protect,getMyBookings)
bookingRouter.put("/:id/cancel",protect,cancelBookings)

export default bookingRouter;