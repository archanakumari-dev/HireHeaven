import { instance } from "../index.js";
import type { authenticatedRequest } from "../middleware/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import crypto from 'crypto';

export const checkOut=TryCatch(async(req:authenticatedRequest,res)=>{
    if(!req.user){
        throw new ErrorHandler(401,"Invalid User.")
    }
    const user_id=req.user.user_id;

    const [user]=await sql `Select * from Users where user_id=${user_id}`;

    const subTime=user?.subscription ? new Date(user.subscription).getTime() : 0;
    const now=Date.now();

    const isSubsrcibed=subTime>now;

    if(isSubsrcibed){
        throw new ErrorHandler(400,"You already have a subscription.");
    }

    const options={
        amount:Number(119*100),
        currency:"INR",
        notes:{
            user_id:user_id.toString(),
        }
    }

    const order=await instance.orders.create(options);

    res.status(201).json({
        order
    });
})


export const paymentVerification=TryCatch(async(req:authenticatedRequest,res)=>{
    const user=req.user;

    const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;
    const body=razorpay_order_id+" "+razorpay_payment_id;

    const expectedSignature=crypto.createHmac("sha256",process.env.RazorPay_Secret as string).update(body).digest('hex');

    const isAuthentic=expectedSignature===razorpay_signature

    if(isAuthentic){
        const now=new Date();
        const thirtyDays=30*24*60*60*1000;

        const expiryDate=new Date(now.getTime()*thirtyDays);

        const [updatedUser]=await sql `UPDATE users set subscription=${expiryDate} where user_id=${user?.user_id} RETURNING *`;

        res.json({
            message:"Subscription purchased successfully.",
            updatedUser
        })

    }else{
        return res.status(400).json({
            message:"Payment failed."
        })
    }

})