// get all restaurants with search and filters
// get / api / restaurants

import { Request, Response } from "express";
import { Restaurant } from "../models/Restaurant.js";
import  Jwt  from "jsonwebtoken";
import { User } from "../models/user.js";
import { Booking } from "../models/booking.js";

export const getRestaurants = async (req:Request,res:Response):Promise<void> => {
    try {
        const {search,priceRange,rating,location,sort} = req.query;

        // Build Quary Object 
        const queryObj:any = {status:"approved"};
        if(search){
            queryObj.$or = [
                {name:{$regex:search,$options : "i"}},
                {tags:{$regex:search,$options : "i"}},
                {location:{$regex:search,$options : "i"}},

            ]
        }

        if(priceRange){
            const prices = Array.isArray(priceRange) ? priceRange:[priceRange];
            queryObj.priceRange={$in:prices};
        }

        if(rating){
           queryObj.ragister = {$gte :parseFloat( rating as string)};
        }

         if(location){
           queryObj.location = {$regex : location as string,$options : "i"};
        }

        // Sorting 
        let sortOption:any = {createdAt :-1}
        if(sort === "rating"){
            sortOption = {rating: -1}
        }else if(sort === "price_low"){
            sortOption = {priceRange:1};
        } else if(sort === "price_high"){
            sortOption ={priceRange:-1};
        }

        const restaurant = await Restaurant.find(queryObj).sort(sortOption);
        res.json(restaurant)

    } catch (error:any) {
        console.error(error);
        res.status(400).json({message : error.message})
        
    }
}


// get featured and exclusive Restraants
// get / api / restaurants / featured


export const getFeaturedRestaurants = async (req:Request,res:Response):Promise<void> => {
    try {
        const featured  = await Restaurant.find({
            status: "approved",
            $or : [{featured: true},{exclusive :true}]
        }).limit(6)
        res.json(featured);
    } catch (error:any) {
        console.error("Get Featured Restaraunts Error" ,error);
        res.status(400).json({message :"Server Error"});
        
    }
}

// get single restaurant by slug 
// get / api / restaurants / :slug


export const getRestaurantBySlug = async (req:Request,res:Response):Promise<void> => {
    try {
        const restaurant = await Restaurant.findOne({slug : req.params.slug})
        if(!restaurant){
            res.status(404).json({message:"Restuarants not Found"});
            return ;
        }

        // if not approved verify authrization (onwer or admin)
        if(restaurant.status !== "approved"){
            let isAuthorized = false;
            if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
                try {
                    const token = req.headers.authorization.split(" ")[1];
                    const decoded = Jwt.verify(token,process.env.JWT_SECRECT as string) as {id:string};

                    const user = await User.findById(decoded.id);
                    if(user  && (user.role === "admin" || (user.role === "onwer"   && restaurant.onwer.toString() === user._id.toString()))){
                        isAuthorized = true 
                    }
                } catch (err) {
                    // ignore the error
                    
                }
            }
            if(!isAuthorized){
                res.status(404).json({message:"restaurants not found or pending for the approval "});
                return;
            }
        }
        res.json(restaurant);
    } catch (error:any) {
        console.error(error);
        res.status(400).json({message : error.message})
        
    }
}

// get dymamic seat avalibility for slots 
// get / api / restaurants / :id / availibility


export const getRestaurantAvailability = async (req:Request,res:Response):Promise<void> => {
    try {
        const {date} = req.query;
        if(!date){
            res.status(400).json({message : "Plese provide a date"});
            return;
        }

        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            res.status(404).json({message:"resturant not found"})
            return;
        }

        const bookingDate = new Date(date as string)

        // get all the active bookings on this date for the restaurants

        const bookings = await   Booking.find({
            restaurants: restaurant._id,
            date:bookingDate,
            status:"confirmed",
        })

        // map slots to available capacities

        const availibility = restaurant.availableSlots.map((slot)=>{
            const bookedSeats = bookings.filter((b)=>b.time === slot).reduce((sum,b)=> sum+ b.guests,0)

            const totalSeats = restaurant.totalSeats || 20;
            const availableSeates = Math.max(0,totalSeats - bookedSeats);

            return{
                time:slot,
                availableSeates,
                isAvailable:availableSeates >0 
            }
        })
        

        res.json(availibility)


    } catch (error:any) {
        console.error(error);
        res.status(400).json({message : error.message})
        
    }
}