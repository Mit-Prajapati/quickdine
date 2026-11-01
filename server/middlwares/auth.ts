import { NextFunction, Request, Response } from "express";
import { IUser, User } from "../models/user.js";

import jwt from "jsonwebtoken";



export interface AuthRequest extends Request{
    user?:IUser
}

export const protect = async (req:AuthRequest,res:Response,next:NextFunction):Promise<void> => {
    let token;
    
    if(req.headers.authorization  && req.headers.authorization.startsWith("Bearer")){
        try {
            // get token from header 
            token = req.headers.authorization.split(" ")[1];

            // verify token 
            const decoded = jwt.verify(token,process.env.JWT_SECRECT!) as {id:string};
            // get user form token exclude password 

            const user = await User.findById(decoded.id).select(" -password");
            if(!user){
                res.status(401).json({message:"Not Aythorized User not found"})
                return;
            }

            req.user = user;
            next()

        } catch (error:any) {
            console.error("Auth Mddleware error:", error);
            res.status(401).json({message:"Not Aythorized User not found"});
            return;
        }
    }

    if(!token){
        res.status(401).json({message:"Not authorized not token"});
    }
}

// for the admin 

export const adminOnly = (req:AuthRequest,res:Response,next:NextFunction): void=>{
    if(req.user && req.user.role === "admin"){
        next()
    }else{
        res.status(403).json({message : "Acess denied, admin role required"});
    }
}

// for the onwer 

export const onwerOnly = (req:AuthRequest,res:Response,next:NextFunction): void=>{
    if(req.user && (req.user.role === "onwer" || req.user.role === "admin")){
        next()
    }else{
        res.status(403).json({message : "Acess denied, admin role required"});
    }
}
