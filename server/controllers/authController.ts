import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { User } from "../models/user.js"
import bcrypt from "bcrypt"
import { AuthRequest } from "../middlwares/auth.js"

// to ganarate the json webtoken 

const ganarateToken=(id: string)=>{
    return jwt.sign({id},process.env.JWT_SECRECT  as string,{expiresIn: "30d"})
}

// ragister to user 
//post is the type  API type and path 

export const ragisterUser = async (req:Request,res : Response):Promise<void> => {
    try {
        const{name,email,password,phone,role}   = req.body  ;
        if(!name || !email || !password || typeof password !== "string" || password.length < 8){
            res.status(400).json({message :" plese enter the details"})
            return ;
        }

        // check if the user exsist 

        const userExists = await User.findOne({email: String(email).trim().toLowerCase()})
        if(userExists){
             res.status(400).json({message :" plese enter the details"})
            return ;
        }

        // if user does not exists than Hash the table

        const salt =await bcrypt.genSalt(10)
        const hashpassword = await bcrypt.hash(password,salt)


        // creating the user 

        const user = await User.create({
            name,
            email,
            password: hashpassword,
            phone,
            role: role === "owner" || role === "onwer" ? "onwer" : "user",
        })
        if(user){
            res.status(201).json({
                _id : user._id,
                name : user.name,
                email : user.email,
                phone : user.phone,
                role : user.role === "onwer" ? "owner" : user.role,
                token:ganarateToken(user._id.toString())
            })
        }
        else{
            res.status(400).json({message :"Invalid User data"})
        }




    } catch (error : any) { 
        console.error(error);
        res.status(400).json({message:error.message});
        
    }
}

// login User  Autheticate and get token 
// post/api/auth/login

export const loginUser = async (req:Request,res : Response):Promise<void> => {
    try {

        const{email,password}   = req.body  ;
        if( !email || !password){
            res.status(400).json({message :" plese provide valid email and password"})
            return ;
        }

        // check for user

        const user = await User.findOne({email: String(email).trim().toLowerCase()})
        if(!user){
            res.status(401).json({message :"invalid email or password"});
            return ;
        }

        const isMatch= await bcrypt.compare(password,user.password || " ")

        if(!isMatch){
            res.status(401).json({message:"Invalid email or password"});
            return;
        }


        res.json({
                _id : user._id,
                name : user.name,
                email : user.email,
                phone : user.phone,
                role : user.role === "onwer" ? "owner" : user.role,
                token:ganarateToken(user._id.toString())
            })

 


        
    } catch (error:any) {
       console.error(error);
        res.status(400).json({message:error.message});
    }
}


//get user Profile 
// get/api/auth/me

// login User  Autheticate and get token 
// post/api/auth/login
// @access private 

export const getMe = async (req:AuthRequest,res : Response):Promise<void> => {
    try {
        if(!req.user){
            res.status(401).json({message:"Not Authrised"});
            return;
        }

        res.json({...req.user.toJSON(), role: req.user.role === "onwer" ? "owner" : req.user.role});
        
    } catch (error:any) {
        console.error(error);
        res.status(400).json({message:error.message});
    }
}