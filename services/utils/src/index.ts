import express from 'express';
import dotenv from 'dotenv';
import router from './routes.js'
import cors from "cors";
import { v2 as cloudinary } from 'cloudinary';
import { startSendMailConsumer } from './consumer.js';


dotenv.config();
startSendMailConsumer();

cloudinary.config({ 
        cloud_name:`${process.env.CLOUD_NAME}`, 
        api_key: `${process.env.API_KEY}`, 
        api_secret: `${process.env.API_SECRET}` // Click 'View API Keys' above to copy your API secret
})

const app=express();
app.use(cors());
app.use(express.json({limit:'50mb'})); // for setting the limit of uploaded file
app.use(express.urlencoded({limit:'50mb',extended:true})) // used to parse from data

app.use('/api/utils',router)

app.listen(process.env.PORT,()=>{
    console.log(`Utils service is running on http://localhost:${process.env.PORT}`)
})
