import express from "express"
import { isAuth } from "../middleware/auth.js";
import { createCompany, createJob, deleteCompany, getALlActiveJobs, getALlApplicationsForJob, getAllCompany, getCompanyDetails, getSingleJob, updateApplication, updateJob } from "../controllers/job.js";
import uploadFile from "../middleware/multer.js";

const router=express.Router();

router.post('/company/new',isAuth,uploadFile, createCompany);
router.delete('/company/:companyId',isAuth,deleteCompany);
router.post('/new',isAuth,createJob);
router.put('/:jobId',isAuth,updateJob);
router.get('/company/all',isAuth,getAllCompany);
router.get('/company/:id',getCompanyDetails);
router.get('/all',getALlActiveJobs);
router.get('/:jobId',getSingleJob);
router.get('/application/all/:jobId',isAuth,getALlApplicationsForJob);
router.post('/application/update/:id',isAuth,updateApplication);


export default router;
