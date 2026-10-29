import { Response } from "express";
import { AuthRequest } from "../middlwares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { v2 as cloudinary } from "cloudinary";
import { Booking } from "../models/Booking.js";

// Helpr functio to upload buffer to cloudnary 

const uploadToCloudinary = (fileBuffer: Buffer) : Promise<{secure_url: string}> =>{
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({folder : "Quickdine"}, (error,result) =>{
            if(error) return reject(error);
            if(!result) return reject(new Error("upload failed"));
            resolve ({secure_url:result.secure_url})
        })
        stream.end(fileBuffer)
    });
};




// get onwer resturants 
// GET / api / onwer / resturant
export const getOwnerRestaurant = async (req:AuthRequest,res:Response):Promise<void> => {
    try {
        const restaurant =await Restaurant.findOne({onwer:req.user?._id})
        if(!restaurant){
            res.status(200).json(null);
            return;
        }
        res.json(restaurant);
    } catch (error:any) {
        console.error(error);
        res.status(400).json({message: error.message});
    }
    
}

// --------------------------------------------------------------------------------------------------------------

//create onwer resturant
//POST /api/onwer/resturant

export const createOwnerRestaurant = async (req:AuthRequest,res:Response):Promise<void> => {
    try {
        const existing = await Restaurant.findOne({owner:req.user?._id})
        if(existing){
            res.status(400).json({message:"you  already have a resturant ragistred"});
            return;
        }

        const {name,description,cuisine,priceRange,location,address,chef,tags,availableSlots,totalSeats}= req.body;
        if(!name || !description || !cuisine || !priceRange || !location || !address || !chef){
            res.status(400).json({message:" Opps Something Wrong.Plsese provide the required details:) " })
            return;
        }
        // ganarate the slug from the name 

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace()
        
        const slugExists  = await Restaurant.findOne({slug});
        if(slugExists){
            res.status(400).json({message : " A restaurant with this name is already exists"})
            return ;
        }
        // Handle Imgae
        let imageUrl  = "";
        if(req.file){
            // handle image upload 
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }

        // setup passed tags and sloats  k


        const parsedTags = typeof tags === "string"? tags.split(",").map((t) =>t.trim()) : tags  || [];
        const parsedSlots = typeof availableSlots === "string" ? availableSlots.split(",").map((s) => s.trim()) : availableSlots  || ["17:00","18;00","19:00","20:00","21:00"];
        const restaurant = await Restaurant.create({
            name,
            slug,
            description,
            cuisine,
            priceRange,
            location,
            address,
            chef,
            image: imageUrl,
            tags: parsedTags,
            availableSlots: parsedSlots,
            totalSeats : totalSeats ? Number(totalSeats) :20,
            onwer : req.user?._id,
            status :"pending"
        })
        res.status(201).json(restaurant);

    } catch (error:any) {
        console.error(error);
        res.status(400).json({message: error.message});
    }
    
}

//--------------------------------------------------------------------------------------------------------------
// update onwers'resturants (submitted to pending)
//PUT/ api / onwer / resturant

export const updateOwnerRestaurant = async (req:AuthRequest,res:Response):Promise<void> => {
    try {
        const restaurant  = await Restaurant.findOne({onwer:req.user?._id})
        if(!restaurant){
            res.status(404).json({message : " Resturant Profil not found"});
            return;
        }

        const {name,description,cuisine,priceRange,location,address,chef,tags,availableSlots,totalSeats}= req.body;
        if(name) restaurant.name = name;
        if(description) restaurant.description =description;
        if(cuisine) restaurant.cuisine =cuisine;
        if(location) restaurant.location = location;
        if(address) restaurant.address = address;
        if(chef) restaurant.chef= chef;
        if(totalSeats)restaurant.totalSeats= Number(totalSeats);

        //update tags 
        if(tags){
            restaurant.tags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()) :tags;
        }
        if(availableSlots){
            restaurant.availableSlots = typeof availableSlots ==="string" ? availableSlots.split(",").map((s) => s.trim()):availableSlots;

        }
        // handle any new image if added .

        if(req.file){
            const result = await uploadToCloudinary(req.file.buffer);
            restaurant.image = result.secure_url;
        }

        const updtaed = await restaurant.save()
        res.json(updtaed)






    } catch (error:any) {
        console.error(error);
        res.status(400).json({message: error.message});
    }
    
}

//-------------------------------------------------------------------------------------------------------------

// get boking for  onwers restrants 
//GET/ api / onwer / bookings

export const getOnwerBookings = async (req:AuthRequest,res:Response):Promise<void> => {
    try {
         const restaurant  = await Restaurant.findOne({onwer:req.user?._id})
        if(!restaurant){
            res.status(404).json({message : " Resturant Profil not found"});
            return;
        }


        const bookings = await Booking.find({restaurant:restaurant._id}).populate("user","name email phone").sort({date: -1 , time: -1})
        res.json(bookings);
        
    } catch (error:any) {
        console.error(error);
        res.status(400).json({message: error.message});
    }
    
}

// ---------------------------------------------------------------------------------------------------------------


// update  status of bokings 
//PUT/ api / onwer / bookings/:id/status
export const updateBookingStatus = async (req:AuthRequest,res:Response):Promise<void> => {
    try {
        const {status} = req.body;
        if(!status || !["confirmed" , "canclled","completed"].includes(status)){
            res.status(400).json({messsage : "plese enter a valid booking status"});
            return;
        }

        const booking = await Booking.findById(req.params.id)
        if(!booking){
            res.status(404).json({message:"Booking not found"});
            return;
        }


        // verify bookings belongs to onwer resturants 
        const restaurant = await Restaurant.findById(booking.restaurants)
        if(!restaurant || restaurant.onwer.toString() !== req.user?._id.toString()){
            res.status(401).json({message : "not authorised to manage this booking"});
            return;

        }
        booking.status= status;
        await booking.save();
        res.json(booking);

    } catch (error:any) {
        console.error(error);
        res.status(400).json({message: error.message});
    }
    
}