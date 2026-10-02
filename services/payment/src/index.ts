import express from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import Razorpay  from 'razorpay';
import paymentRoutes from "./routes/payment.js";

dotenv.config();

export const instance=new Razorpay(
    {
        key_id:process.env.RazorPay_Key as string,
        key_secret:process.env.RazorPay_Secret as string,
    }
);

const app=express();

app.use(cors());
app.use(express.json());
app.use('/api/payment',paymentRoutes);

app.listen(process.env.PORT,()=>{
    console.log(`Payment service is rumming on ${process.env.PORT}`)
});


