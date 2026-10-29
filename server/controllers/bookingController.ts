

// Create a new booking
// post / api / bookings
// @acess private 

import { Response } from "express";
import { AuthRequest } from "../middlwares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { Booking } from "../models/Booking.js";

export const createBooking = async (req:AuthRequest,res:Response):Promise<void> => {
    try {
        const {restaurantId,date,time,guests,occasion,specialRequests}= req.body;

        if(!restaurantId || !date || !guests  || !time){
            res.status(400).json({message:"Plese Provide all Required reservation Details"});
            return;
        }

        // check if the restarant exist 

        const resturant = await Restaurant.findById(restaurantId)
        if(!resturant){
            res.status(400).json({message:"Resturant not found Sorry We will look forward to add it :)"})
            return;
        }

        // Verification for the resturants
        if(resturant.status !== "approved"){
            res.status(404).json({message:"reservation for this resturant id not opened yet."})
            return;
        }

        // verify seat availibilty 
        const requestedguest= Number(guests);
        const existingBookings = await Booking.find({
            resturant :restaurantId,
            date :new Date(date),
            time,
            status:"confirmed",
        })

        const bookedSeats = existingBookings.reduce((sum,b)=> sum +b.guests,0)

        const totalSeats  = resturant.totalSeats || 20;
        const  availableSeates = totalSeats - bookedSeats;
        if(requestedguest > availableSeates){
            res.status(400).json({
                message: `Unable to reverse . Only ${availableSeates} seats are available for this time slot`,
            })
        }

        // create booking.

        const booking = await Booking.create({
            user:req.user?._id,
            restaurants:restaurantId,
            date :new Date(date),
            time,
            guests:Number(guests),
            occasion,
            specialRequests,
            status: "confirmed",

        })

        // Populate resturant info before returning 

        const populatedBooking = await booking.populate("restaurant","name location image address");

        res.status(201).json({populatedBooking});

    } catch (error:any) {
        console.error(error);
        res.status(400).json({message: error.massage});
    }
}

// get user bookings.
// get / api / bookings/my
// @acess private 


export const getMyBookings = async (req:AuthRequest,res:Response):Promise<void> => {
    try {
        const  bookings = await Booking.find({user:req.user?._id}).populate ("restaurant","name location image address slug").sort({date:-1,time:-1})
        res.json(bookings);
    } catch (error:any) {
        console.error(error);
        res.status(400).json({message: error.massage});
    }
}

// cencalation of bookings 
// put/api/bookings/:id/cencel 
// @acess private 


export const cancelBookings = async (req:AuthRequest,res:Response):Promise<void> => {
    try {
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            res.status(404).json({message :"Bookig not found"});
            return;
        }

        // verify if user onws the booking
        if(booking.user.toString() !== req.user?._id.toString()){
            res.status(401).json({message : "Not authrized to cencle Booking"});
            return;
        }
        // forthe cencle

        booking.status = "cancelled";
        await booking.save();

        const populatedBooking = await booking.populate("restuarant"," name  location image address")
        res.json(populatedBooking);
    } catch (error:any) {
        console.error(error);
        res.status(400).json({message: error.massage});
    }
}