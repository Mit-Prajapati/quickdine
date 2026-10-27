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
        if(!name || !email || !password){
            res.status(400).json({massage :" plese enter the details"})
            return ;
        }

        // check if the user exsist 

        const userExists = await User.findOne({email})
        if(userExists){
             res.status(400).json({massage :" plese enter the details"})
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
            role,
        })
        if(user){
            res.status(201).json({
                _id : user._id,
                name : user.name,
                email : user.email,
                phone : user.phone,
                role : user.role,
                token:ganarateToken(user._id.toString())
            })
        }
        else{
            res.status(400).json({massage :"Invalid User data"})
        }




    } catch (error : any) { 
        console.error(error);
        res.status(400).json({massage:error.massage});
        
    }
}

// login User  Autheticate and get token 
// post/api/auth/login

export const loginUser = async (req:Request,res : Response):Promise<void> => {
    try {

        const{email,password}   = req.body  ;
        if( !email || !password){
            res.status(400).json({massage :" plese provide valid email and password"})
            return ;
        }

        // check for user

        const user = await User.findOne({email})
        if(!user){
            res.status(401).json({massage :"invalid email or password"});
            return ;
        }

        const isMatch= await bcrypt.compare(password,user.password || " ")

        if(!isMatch){
            res.status(401).json({massage:"Invalid email or password"});
            return;
        }


        res.json({
                _id : user._id,
                name : user.name,
                email : user.email,
                phone : user.phone,
                role : user.role,
                token:ganarateToken(user._id.toString())
            })

 


        
    } catch (error:any) {
       console.error(error);
        res.status(400).json({massage:error.massage});
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

        res.json(req.user);
        
    } catch (error:any) {
        console.error(error);
        res.status(400).json({message:error.message});
    }
}