import express, { urlencoded } from "express";
import router from "./routes/job.js";
import cors from 'cors'

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use('/api/job',router);

export default app;
