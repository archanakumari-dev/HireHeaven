import axios from "axios";
import type { authenticatedRequest } from "../middlewares/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const myProfile=TryCatch(async(req:authenticatedRequest,res,next)=>{
   const user=req.user;
   res.json(user);
})

export const getUserProfile=TryCatch(async(req,res,next)=>{
    const {userId}=req.params;

    const users=await sql `
       SELECT u.user_id,u.name,u.email,u.phone_number,u.role,u.bio,u.resume,u.resume_public_id,u.profile_pic,u.profile_pic_public_id,u.subscription, ARRAY_AGG(s.name) FIlter(where s.name is not null) as skills from users u LEFT JOIN user_skills us ON u.user_id=us.user_id LEFT JOIN skills s on us.skill_id=s.skill_id where u.user_id=${userId}
       GROUP BY u.user_id;
     `
     if(users.length===0){
        throw new ErrorHandler(401,"User not found.")
     }

     const user=users[0];
     if (!user) throw new ErrorHandler(401, "User not found.")
     user.skills=user.skills||[];
     res.json(user);
})

export const updateUserProfile=TryCatch(async(req:authenticatedRequest,res,next)=>{
     const user=req.user;
     if(!user){
      throw new ErrorHandler(401,"Authenticated users are allowed.")
     }

     const {name,phone_number,bio}=req.body;
     const newName=name|| user.name
     const newPhoneNumber=phone_number || user.phone_number;
     const newBio=bio || user.bio;


     const [updatedUser]=await sql `UPDATE users set name=${newName}, phone_number=${newPhoneNumber},bio=${newBio} where user_id=${user.user_id} returning name,email,phone_number,bio`;

     res.json({
      message:"Profile updated successfully.",
      updatedUser
     })
})


export const updateProfilePic=TryCatch(async(req:authenticatedRequest,res,next)=>{
   const user=req.user;
   if(!user){
      throw new ErrorHandler(401,'Authenticated users allowed.');
   }
   const file=req.file;

   if(!file){
      throw new ErrorHandler(401,"No image file provided.")
   }

   const oldPublicId=user.profile_pic_public_id;

   const fileBuffer=getBuffer(file); // this is for converting image into a base64 encoded url

   if(!fileBuffer || !fileBuffer.content){
      throw new ErrorHandler(500,"Failed to generate file buffer.");
   }
   
   const {data:uplaodResult}=await axios.post(
   `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
   {  
      buffer:fileBuffer.content,
      public_id:oldPublicId
   }
   );

   const [updatedUser]=await sql `UPDATE users SET profile_pic=${uplaodResult.url},profile_pic_public_id=${uplaodResult.public_id} where user_id=${user.user_id} Returning user_id,name,profile_pic;`
 

   res.json({
      message:"Profile pic updated successfully.",
      updatedUser
   })

})


export const updateResume=TryCatch(async(req:authenticatedRequest,res,next)=>{
   const user=req.user;
   if(!user){
      throw new ErrorHandler(401,"User not found")
   }
   const file=req.file;
   if(!file){
      throw new ErrorHandler(401,"No resume is provided.")
   }

   const oldPublicId=user.resume_public_id;

   const fileBuffer=getBuffer(file); // this is for converting image into a base64 encoded url

   if(!fileBuffer || !fileBuffer.content){
      throw new ErrorHandler(500,"Failed to generate file buffer.");
   }
   
   const {data:uplaodResult}=await axios.post(
   `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
   {  
      buffer:fileBuffer.content,
      public_id:oldPublicId
   }
   );

   const [updatedUser]=await sql `UPDATE users SET resume=${uplaodResult.url},resume_public_id=${uplaodResult.public_id} where user_id=${user.user_id} Returning user_id,name,resume;`

   res.json({
      message:"Resume updated successfully.",
      updatedUser
   })
})

export const addSkillToUser=TryCatch(async(req:authenticatedRequest,res)=>{
   const userId=req.user?.user_id
   const {skillName}=req.body;

   if(!skillName || skillName.trim()===""){
      throw new ErrorHandler(401,"Please enter a skill.")
   }

   let wasSkillAdded=false;

   try {
       await sql `BEGIN`
        const users=await sql `SELECT user_id from users where user_id=${userId};`
        if(users.length===0){
         throw new ErrorHandler(404,"User not found.")
        }

        const [skill]=await sql `Insert into skills (name) Values (${skillName.trim()}) ON CONFLICT (name) do update set name=EXCLUDED.name returning skill_id `

        const skillId=skill?.skill_id;

        const insertionResult=await sql ` Insert into user_skills (user_id,skill_id) Values (${userId},${skillId}) on conflict (user_id,skill_id) do nothing returning user_id;`

        if(insertionResult.length>0){
           wasSkillAdded=true;
        }
        
        await sql `commit;`
   } catch (error) {
       await sql `rollback;`
       throw error;
   }

   if(!wasSkillAdded){
      res.json({
         message:"User posses this skill already."
      })
      return;
   }

   res.json({
      message:`Skill ${skillName.trim()} added successfully.`
   })
})

export const deleteSkillFromUser=TryCatch(async(req:authenticatedRequest,res)=>{
   const user=req.user;
   if(!user){
      throw new ErrorHandler(401,'Authentication required.')
   }
   const {skillName}=req.body;

   if(!skillName || skillName.trim()===""){
      throw new ErrorHandler(401,"Please enter a skill.")
   }

   const result=await sql ` Delete from user_skills where user_id=${user.user_id} and skill_id=(Select skill_id from skills where name=${skillName.trim()}) returning user_id`
  
   if(result.length===0){
      throw new ErrorHandler(401,`Skill ${skillName.trim()} not found.`)
   }

   res.json({
      message:"Skill deleted successfully."
   })
   
})

export const applyForJob=TryCatch(async(req:authenticatedRequest,res)=>{
   const user=req.user;

   if(!user){
      throw new ErrorHandler(404,"Authenticated user is required.")
   }

   if(user.role!=='jobseeker'){
      throw new ErrorHandler(401,"Forbidden! Only jobseekers are allowed.")
   }
   const applicant_id=user.user_id;
   const resume=user.resume;
   const {job_id}=req.body;

   if(!job_id){
      throw new ErrorHandler(401,"JobId is required.")
   }
   
   const [job]=await sql`SELECT * from jobs where job_id=${job_id}`
   if(!job){
      throw new ErrorHandler(401,"Job not found.")
   }

  const now=Date.now();

  const subTime=req.user?.subscription ? new Date(req.user.subscription).getTime() : 0;

  const isSubscribed=subTime>now;

  let newApplication;

  try {
    await sql `INSERT INTO applications (job_id,applicant_id,applicant_email,resume,subscribed) VALUES (${job_id},${applicant_id},${user.email},${resume},${isSubscribed})`
  } catch (error:any) {
    if(error.code==="23505"){
       throw new ErrorHandler(409,"You have already applied for this job.")
    }
    throw error;
  }

  res.json({
   message:"You have applied for this job successfully.",
   application:newApplication
  })

})


export const getAllApllications=TryCatch(async(req:authenticatedRequest,res)=>{

   const applications=await sql `SELECT j.*,j.title as job_title,j.salary as job_salary,j.location as job_location from applications a JOIN jobs j on a.job_id=j.job_id where a.applicant_id=${req.user?.user_id}`

   res.json(applications);
})


