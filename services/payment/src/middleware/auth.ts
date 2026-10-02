import type { Request,Response, NextFunction } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { sql } from "../utils/db.js";
import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";

 interface User{
    user_id:number;
    name:string;
    email:string;
    phone_number:string;
    role:"jobseeker" | "recruiter"
    bio:string | null;
    resume:string | null;
    resume_public_id:string | null;
    profile_pic:string | null;
    profile_pic_public_id:string | null;
    skills:string[];
    subscription:string | null
}

export interface authenticatedRequest extends Request{
    user?:User
}


export const isAuth=async(req:authenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{
   try {
     const authHeader=req.headers.authorization;
     if(!authHeader || !authHeader.startsWith('Bearer')){
        res.status(401).json({
            message:"Auth Header is missing."
        })
        return;
     }

     const token=authHeader.split(" ")[1];
     if(!token){
        res.status(401).json({
            message:"Token not found."
        })
        return;
     }
     const decodedPayload=jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload ;
     if(!decodedPayload || !decodedPayload.id){
        res.status(401).json({
            message:"Token invalid."
        })
        return;
     }

     const users=await sql `
       SELECT u.user_id,u.name,u.email,u.phone_number,u.role,u.bio,u.resume,u.resume_public_id,u.profile_pic,u.profile_pic_public_id,u.subscription, ARRAY_AGG(s.name) FIlter(where s.name is not null) as skills from users u LEFT JOIN user_skills us ON u.user_id=us.user_id LEFT JOIN skills s on us.skill_id=s.skill_id where u.user_id=${decodedPayload.id}
       GROUP BY u.user_id;
     `

     if(users.length===0){
        res.status(401).json({
            message:"User associated with this token does not exist."
        })
        return;
     }

     const user=users[0] as User;

     user.skills=user.skills || [];
     req.user=user;
     next();

   } catch (error) {
       res.status(401).json({
            message:"Authentication Failed. Please login again."
        })
        console.log(error);
        return;
   }
}


