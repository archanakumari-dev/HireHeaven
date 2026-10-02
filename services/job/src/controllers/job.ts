import axios from "axios";
import type { authenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { applicationStatusUpdateTemplate } from "../utils/template.js";
import { publishToTopic } from "../producer.js";

export const createCompany=TryCatch(async(req:authenticatedRequest,res)=>{
    const user=req.user;

    if(!user){
        throw new ErrorHandler(400,"Not authorized to create a company.")
    }
    if(user.role!=='recruiter'){
        throw new ErrorHandler(401,"Forbidden! Only recruiter are allowed to create company.")
       
    }
    const {name,description,website}=req.body;

    if(!name || !description || !website){
        throw new ErrorHandler(401,"All fields are required.");
    }

    const existingCompany=await sql `
     SELECT company_id from companies where name=${name}
    `

    if(existingCompany.length>0){
        throw new ErrorHandler(409,`Company with name ${name} already exists.`)
    }

    const file=req.file; // logo 

    if(!file){
        throw new ErrorHandler(401,"Logo is required.")
    }

    const fileBuffer=getBuffer(file);

    if(!fileBuffer || !fileBuffer.content){
        throw new ErrorHandler(500,"Failed to generate buffer.")
    }

    const {data} = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`,
        {buffer:fileBuffer.content}
    )

    const [newCompany]=await sql `
       INSERT INTO companies (name,description,website,logo,logo_public_id,recruiter_id)
       VALUES (${name},${description},${website},${data.url},${data.public_id},${req.user?.user_id}) 
       Returning *;
    `
    res.json({
        message:"Company created successfully.",
        company:newCompany
    })
})

export const deleteCompany=TryCatch(async(req:authenticatedRequest,res)=>{
    const user=req.user;
    const {companyId}=req.params;

    if(!user){
        throw new ErrorHandler(404,"Not authorized to delete company.")
    }

    if(user.role!=='recruiter'){
        throw new ErrorHandler(404,"Forbidden! Only recruiter can delete.")
    }

    const [company]=await sql `Select logo_public_id from companies where company_id=${companyId} and recruiter_id=${user.user_id}`

    if(!company){
        throw new ErrorHandler(400,"Company does not exist or you are not allowed to delete it.")
    }

    await sql `DELETE from companies where company_id=${companyId}`;

    res.json({
        message:"Company and all associated jobs deleted successfully."
    })
})

export const createJob=TryCatch(async(req:authenticatedRequest,res)=>{
     const user=req.user;
     if(!user){
        throw new ErrorHandler(404,"Authorized users are allowed to create jobs.")
     }
    
     if(user.role!=='recruiter'){
        throw new ErrorHandler(404,"Forbidden! Only recruiter can create jobs.")
    }

     const {title,description,salary,location,job_type,openings,role,work_location,companyId}=req.body;

     if(!title || !description || !salary || !location || !openings || !role ){
        throw new ErrorHandler(401,"All fields are required.")
     }

     const [company]=await sql `Select * from companies where company_id=${companyId} and recruiter_id=${user.user_id}`

     if(!company){
        throw new ErrorHandler(404,"Company not found.")
     }

     const [newjob]=await sql `Insert into jobs (title,description,salary,location,job_type,openings,role,work_location,company_id,posted_by_recruiter_id) Values (${title},${description},${salary},${location},${job_type},${openings},${role},${work_location},${companyId},${user.user_id}) Returning *`

    res.json({
        message:"Job posted successfully.",
        newjob
    })
})

export const updateJob=TryCatch(async(req:authenticatedRequest,res)=>{
     const user=req.user;
     if(!user){
        throw new ErrorHandler(404,"Authorized users are allowed to create jobs.")
     }
    
     if(user.role!=='recruiter'){
        throw new ErrorHandler(404,"Forbidden! Only recruiter can create jobs.")
    }

     const {title,description,salary,location,job_type,openings,role,work_location,companyId,is_active}=req.body;
     const jobId=req.params.jobId

     const [existingJob]=await sql` 
       SELECT posted_by_recruiter_id FROM jobs WHERE job_id=${jobId}
     `
     if(!existingJob){
        throw new ErrorHandler(401,"Job does not exist.")
     }
     if(existingJob.posted_by_recruiter_id!==user.user_id){
        throw new ErrorHandler(401,"Forbidden! Not allowed to update the job.")
     }

     const [updatedJob]=await sql`
     UPDATE jobs  SET title=${title} ,description=${description},salary=${salary},location=${location},job_type=${job_type},openings=${openings},role=${role},work_location=${work_location},is_active=${is_active}
     WHERE job_id=${jobId} Returning *;
     `
    
    res.json({
        message:"Job updated successfully.",
        job:updatedJob
    })
})

export const getAllCompany=TryCatch(async(req:authenticatedRequest,res)=>{
    const companies=await sql ` SELECT * FROM companies WHERE recruiter_id=${req.user?.user_id}`
    res.json(companies);
})

export const getCompanyDetails=TryCatch(async(req:authenticatedRequest,res)=>{
    const {id}=req.params;  // comapnyId

    if(!id){
        throw new ErrorHandler(401,"Company id is required.")
    }

   const [companyData] = await sql`
    SELECT c.*,
        COALESCE(
            (SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id),
            '[]'::json
        ) AS jobs
    FROM companies c
    WHERE c.company_id = ${id}
    GROUP BY c.company_id
`
    if(!companyData){
        throw new ErrorHandler(404,"Company not found.")
    }

    res.json(companyData);
})

export const getALlActiveJobs=TryCatch(async(req:authenticatedRequest,res)=>{
     const {title,location}=req.query as {
        title?:string,
        location?:string
     }

     let queryString=`
        SELECT j.job_id,j.title,j.description,j.salary,j.location,j.job_type,j.role,j.work_location,j.created_at,c.name as company_name,c.logo as comapny_logo, c.company_id as company_id from jobs j JOIN companies c on j.company_id=c.company_id where j.is_active=true
     `
     //all this for preventing the sql injection 
     const values=[];
     let paramIndex=1;
    
     if(title){
        queryString+=` AND j.title ILIKE $${paramIndex}`;
        values.push(`%${title}%`)
        paramIndex++;
     }

     if(location){
        queryString+=` AND j.location ILIKE $${paramIndex}`;
        values.push(`%${location}%`);
        paramIndex++;
     }

     queryString+=` Order by j.created_at desc`

     const jobs=(await sql.query(queryString,values)) as any[];

     res.json({
        message:"All active jobs fetched successfully.",
        jobs
     })

})

export const getSingleJob=TryCatch(async(req,res)=>{
    const [job]=await sql` Select * from jobs where job_id=${req.params.jobId}`;

    res.json(job);
})

export const getALlApplicationsForJob=TryCatch(async(req:authenticatedRequest,res)=>{
     const user=req.user;
     if(!user){
        throw new ErrorHandler(404,"Authorized users are allowed to create jobs.")
     }
    
     if(user.role!=='recruiter'){
        throw new ErrorHandler(404,"Forbidden! Only recruiter can create jobs.")
    } 

    const {jobId}=req.params;

    const [job]=await sql `
      SELECT posted_by_recruiter_id from jobs where job_id=${jobId};
    `

    if(!job){
        throw new ErrorHandler(404,"Job not found.")
    }

    if(job.posted_by_recruiter_id!==user.user_id){
        throw new ErrorHandler(401,"Forbidden! you are not allowed.")
    }

    const applications=await sql`
     select * from applications where job_id=${jobId} Order by subscribed DESC,applied_at ASC;
    `

    res.json(applications);
})

export const updateApplication=TryCatch(async(req:authenticatedRequest,res)=>{
     const user=req.user;
     if(!user){
        throw new ErrorHandler(404,"Authorized users are allowed to create jobs.")
     }
    
     if(user.role!=='recruiter'){
        throw new ErrorHandler(404,"Forbidden! Only recruiter can create jobs.")
    } 

    const {id}=req.params // apllication id

    const [application]=await sql `
      SELECT * FROM applications where application_id=${id}
    `

    if(!application){
        throw new ErrorHandler(404,"Application not found.")
    }


    const [job]=await sql `Select posted_by_recruiter_id,title from jobs where job_id=${application.job_id}`

    if(!job){
        throw new ErrorHandler(404,"Job not found.")
    }
    
    if(job.posted_by_recruiter_id!==user.user_id){
        throw new ErrorHandler(401,"Forbidden! You are not allowed.")
    }

    const [updatedApplication]=await sql `UPDATE applications SET  status=${req.body.status} where application_id=${id} Returning *;`

    const message={
        to:application.applicant_email,
        subject:"Application Update - Job Portal",
        html:applicationStatusUpdateTemplate
    }

    publishToTopic('send-mail',message).catch((error)=>{
        console.error("Failed to publish message to kafka.",error)
    })

    res.json({
        message:'Job updated successfully.',
        job,
        updatedApplication
    })
})
