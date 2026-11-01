// get all resturants for admin managment 
// GET / api / admin/ resturants

import { Response } from "express";
import { AuthRequest } from "../middlwares/auth.js";  
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/user.js";
import { Booking } from "../models/Booking.js";


// get all resturants for admin managment 
// GET / api / admin/ resturants

export const getAllRestaurants = async (req:AuthRequest,res:Response):Promise<void> =>{
    try {
        const resturants = await Restaurant.find({}).populate("onwer", "name email phone").sort({createdAt : -1})
        res.json(resturants)
    } catch (error:any) {
        console.error(error);
        res.status(400).json({message : error.message}) 
        
    }
}

// --------------------------------------------------------------------------------

// approve or reject the resturant 
// PUT / api / admin/ resturants /:id /approve

export const approveRestaurants = async (req:AuthRequest,res:Response):Promise<void> =>{
    try {
        const { status } = req.body;
        if(!status || !["approved","rejected","pending"].includes(status)){
            res.status(400).json({message:"Plese provide a valid approval status"});
            return;
        }

        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            res.status(404).json({message:"Restaurants Profile not found"})
            return;
        }
        restaurant.status = status;
        await restaurant.save();
        res.json(restaurant);
    } catch (error:any) {
        console.error(error);
        res.status(400).json({message : error.message}) 
        
    }
}

// -------------------------------------------------------------------------------------------------------

// get systems statistics
// GET / api / admin/ stats 

export const getAdminStats = async (req:AuthRequest,res:Response):Promise<void> =>{
    try {
        const totalUsers = await User.countDocuments({role : "user"});
        const totalOnwers = await User.countDocuments({role:"onwer"});
        const totalBookings = await Booking.countDocuments({});
        const totalRestaurants = await Restaurant.countDocuments({})
         
        // Get latest 10 bookings
        const  latestBookings = await Booking.find({}).populate("user","name email").populate("restaurants","name").sort({createdAt : -1}).limit(10)

        res.json({
            users:{
                totalUsers,
                totalOwners: totalOnwers,
                total : totalOnwers + totalUsers,
            },
            restaurants:{
            total : totalRestaurants,
            },
            bookings: {
                total: totalBookings,
            },

            latestBookings
        });
       
    } catch (error:any) {
        console.error(error); 
        res.status(400).json({message : error.message}) 
        
    }
}