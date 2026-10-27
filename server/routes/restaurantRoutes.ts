import { Router } from "express";
import { getFeaturedRestaurants, getRestaurantAvailability, getRestaurantBySlug, getRestaurants } from "../controllers/RestaurantController.js";


const restaurantRouter = Router();
restaurantRouter.get('/',getRestaurants);
restaurantRouter.get('/featured',getFeaturedRestaurants);
restaurantRouter.get('/slug',getRestaurantBySlug);
restaurantRouter.get('/:id/availibility',getRestaurantAvailability);

export default restaurantRouter;