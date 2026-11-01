import { Document,model,Schema } from "mongoose";

export interface IUser extends Document {
    name:string;
    email:string;
    password?:string;
    phone?:string;
    role: "user" | "admin" | "onwer";
    createdAt:Date;
    updatedAt:Date;
}

const UserSchema = new Schema<IUser> (
    {
        name :{type:String , required: true,trim:true},
        email:{type:String , required: true,unique:true,lowercase:true,trim:true},
        password :{type:String , required: true,minlength:8,trim:true},
        phone :{type:String , minlength:10,trim:true},
        role:{type:String,enum:["user","onwer","admin"],default:"user"},

        
    },{
        timestamps:true
    }
)

UserSchema.set("toJSON",{
    transform:(doc,ret)=>{
        delete ret.password;
        return ret;
    }
})

export const User = model<IUser>("User",UserSchema)