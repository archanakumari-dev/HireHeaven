"use client"
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import { job_service, useAppData } from '@/app/context/AppContext'
import axios from 'axios'
import Loading from '@/components/loading'
import { Card } from '@/components/ui/card'
import { Company, Job } from '@/type'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Briefcase, Building2, CheckCircle, Clock, DollarSign, Eye, FileText, Globe, Laptop, MapPin, Pencil, Plus, Trash2, Users, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CompanyPage = () => {
    const {id}=useParams();
    const token=Cookies.get("token");

    const {user,isAuth}=useAppData();
    const [loading,setLoading]=useState(false);
    const [btnLoading,setBtnLoading]=useState(false);
    const [company,setCompany]=useState<Company |null>(null);

    async function fetchCompany(){
        setLoading(true);
        try {
            const {data}=await axios.get(`${job_service}/api/job/company/${id}`)
            setCompany(data);
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
       fetchCompany();
    },[])

    
    const isRecruiterOwner=user && company && user.user_id===company.recruiter_id;

    const [isUpdatedModalOpen,setIsUpdatedModalOpen]=useState(false);
    const [selectedJob,setSelectedJob]=useState<Job |null>(null);

    const addModalRef=useRef<HTMLButtonElement>(null);
    const updateModalRef=useRef<HTMLButtonElement>(null);

    const [title,setTitle]=useState("");
    const [description,setDescription]=useState("");
    const [role,setRole]=useState("");

    const [salary,setSalary]=useState("");
    const [location,setLocation]=useState("");
    const [openings,setOpenings]=useState("");
    const [job_type,setJob_Type]=useState("");
    const [work_location,setWork_Location]=useState("");
    const [isActive,setIsActive]=useState(true);

    const clearInput=()=>{
        setTitle('');
        setSalary("")
        setLocation("")
        setOpenings("")
        setJob_Type("")
        setWork_Location("")
        setIsActive(true);
    }

    const addJobHandler=async()=>{
        setBtnLoading(true);
         try {
            const jobData={title,description,salary:Number(salary),role,location,openings:Number(openings),job_type,work_location,companyId:id}

            await axios.post(`${job_service}/api/job/new`,jobData,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            toast.success("New job posted successfully.")
            fetchCompany();
            clearInput();
            addModalRef.current?.click();
         } catch (error:any) {
            console.log(error.response.data.message);
         }finally{
            setBtnLoading(false);
         }
    }

    const deleteHandler=async(jobId:number)=>{
        if(confirm("Are you sure to delete this job?")){
            try {
                await axios.delete(`${job_service}/api/job`,{
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                })
                toast.success("Job has been deleted.")
                fetchCompany()
            } catch (error:any) {
                toast.error(error.response.data.message)
            }finally{
                setBtnLoading(false);
            }
        }
    }

    const handleOpenUpdateModal=(job:Job)=>{
       setSelectedJob(job);
       setTitle(job.title);
       setDescription(job.description);
       setRole(job.role)
       setSalary(String(job.salary || ""));
       setLocation(job.location ||"");
       setOpenings(String(job.openings));
       setJob_Type(job.job_type)
       setWork_Location(job.work_location)
       setIsActive(job.is_active)
       setIsUpdatedModalOpen(true);
    }

    const handleCloseUpdateModal=()=>{
        setIsUpdatedModalOpen(false);
        setSelectedJob(null);
        clearInput();
    }

    const updateJobHandler=async()=>{
        if(!selectedJob){
            return;
        }
        setBtnLoading(true);
        try {
            const updatedData={title,description,salary:Number(salary),role,location,openings:Number(openings),job_type,work_location,is_active:isActive}
            
            await axios.put(`${job_service}/api/job/${selectedJob.job_id}`,updatedData,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            toast.success("Job updated successfully.")
            fetchCompany()
            handleCloseUpdateModal();
        } catch (error) {
           console.log(error) 
        }finally{
            setBtnLoading(false);
        }
    }

    
    if(loading) return <Loading/>



  return (
    <div className="min-h-screen bg-secondary/30">
        {
            company && <div
               className="max-w-6xl mx-auto px-4 py-8"
            >
                <Card className='overflow-hidden shadow-lg border-2 mb-8 p-0 gap-0'>
                    <div
                        className='h-32 bg-blue-600'
                        ></div>
                        <div className="px-8 pb-8"> 
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
                                <div className="w-32 h-32 rounded-3xl border-4 border-background overflow-hidden shadow-xl bg-background shrink-0">
                                    <img src={company.logo} alt="" className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 md:mb-4">
                                    <h1 className="text-3xl font-bold mb-2">
                                      {company.name}  
                                    </h1>
                                    <p className="text-base leading-relaxed opacity-80 max-w-3xl">{company.description}</p>
                                </div>
                                <Link href={company.website}
                                  target='_blank' className='md:mb-4'>
                                    <Button className={"gap-2"}>
                                        <Globe size={18}/>
                                         Visit Website
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    
                </Card>

                <Dialog>
                    {/* Job section */}
                    <Card className='shadow-lg border-2 overflow-hidden '>
                        <div className="bg-blue-600 border-b p-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-white dark:bg-blue-900 flex items-center justify-center ">
                                        <Briefcase size={20} className='text-blue-600 '/>
                                    </div>
                                </div>
                                {/* Open positions */}
                                <h2 className="text-2xl font-bold text-white">Open position</h2>
                                <p className="text-sm opacity-70 text-white">
                                    {company.jobs?.length || 0} active job
                                    {company.jobs?.length!=1?"s":""}
                                </p>
                            </div>
                        </div>

                        {
                            isRecruiterOwner &&
                            <>
                              <DialogTrigger
                                    render={
                                        <Button className="gap-2">
                                            <Plus size={18} />
                                            Post new job
                                        </Button>
                                    }
                                />

                              <DialogContent className={"sm:max-w-[600px] max-h-[90vh] overflow-y-auto"}>
                                <DialogHeader >
                                    <DialogTitle className={"text-2xl flex items-center gap-2"}>
                                        Post new job
                                    </DialogTitle>
                                </DialogHeader>

                                   <div className="space-y-5 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor='title' className='text-sm font-medium flex items-center gap-2'>
                                                        <Briefcase size={16}/>
                                                         Job Title
                                                    </Label>
                                                    <Input id="title" type="text" placeholder='Enter Job Title'
                                                    className='h-11'
                                                    value={title}
                                                    onChange={(e)=>setTitle(e.target.value)}/>
                                                </div>
                                
                                                <div className="space-y-2">
                                                    <Label htmlFor='description' className='text-sm font-medium flex items-center gap-2'>
                                                        <FileText size={16}/>
                                                         Description
                                                    </Label>
                                                    <Input id="description" type="text" placeholder='Describe your company'
                                                    className='h-11'
                                                    value={description}
                                                    onChange={(e)=>setDescription(e.target.value)}/>
                                                </div>
                                
                                                <div className="space-y-2">
                                                    <Label htmlFor='role' className='text-sm font-medium flex items-center gap-2'>
                                                        <Building2 size={16}/>
                                                         Role
                                                    </Label>
                                                    <Input id="role" type="text" placeholder='Enter job role.'
                                                    className='h-11'
                                                    value={role}
                                                    onChange={(e)=>setRole(e.target.value)}/>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor='salary' className='text-sm font-medium flex items-center gap-2'>
                                                        <DollarSign size={16}/>
                                                         Salary
                                                    </Label>
                                                    <Input id="salary" type="text"
                                                     value={salary} 
                                                    className='h-11 cursor-pointer'
                                                    onChange={(e)=>setSalary(e.target.value)}/>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor='openings' className='text-sm font-medium flex items-center gap-2'>
                                                        <DollarSign size={16}/>
                                                         Openings
                                                    </Label>
                                                    <Input id="openings" type="number"
                                                     value={openings} 
                                                    className='h-11 cursor-pointer'
                                                    onChange={(e)=>setOpenings(e.target.value)}/>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor='location' className='text-sm font-medium flex items-center gap-2'>
                                                        <DollarSign size={16}/>
                                                         Location
                                                    </Label>
                                                    <Input id="location" type="text"
                                                     value={location} 
                                                    className='h-11 cursor-pointer'
                                                    onChange={(e)=>setLocation(e.target.value)}/>
                                                </div>

                                                <div className="grid md:grid-col-2 gap-4">
                                                    <div className="space-y-2 ">
                                                        <Label htmlFor='job_type'
                                                         className='text-sm font-medium flex items-center gap-1'>
                                                            <Clock size={16}/>
                                                            Job type
                                                        </Label>
                                                        <Select value={job_type} onValueChange={(value)=>setJob_Type(value ?? "")}>
                                                        <SelectTrigger className={"h-11"}>
                                                            <SelectValue placeholder='Select job type'/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={"Full-time"}>
                                                                Full-time
                                                            </SelectItem>
                                                            <SelectItem value={"Part-time"}>
                                                                Part-time
                                                            </SelectItem>
                                                            <SelectItem value={"Contract"}>
                                                                Contract
                                                            </SelectItem>
                                                            <SelectItem value={"Internship"}>
                                                                Internship
                                                            </SelectItem>
                                                        </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2 ">
                                                        <Label htmlFor='work_location'
                                                         className='text-sm font-medium flex items-center gap-1'>                                                          <Laptop size={16}/>
                                                            Select Work Location
                                                        </Label>
                                                        <Select value={work_location} onValueChange={(value)=>setWork_Location(value ?? "")}>
                                                        <SelectTrigger className={"h-11"}>
                                                            <SelectValue placeholder='Select job type'/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={"On-site"}>
                                                                On-site
                                                            </SelectItem>
                                                            <SelectItem value={"Remote"}>
                                                                Remote
                                                            </SelectItem>
                                                            <SelectItem value={"Hybrid"}>
                                                                Hybrid
                                                            </SelectItem>
                                                        </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                
                                                <DialogFooter>
                                                    <DialogClose >
                                                        <Button ref={addModalRef} variant={"outline"}>
                                                            Cancel
                                                        </Button>
                                                   </DialogClose>

                                                   <Button 
                                                   disabled={btnLoading}
                                                   onClick={addJobHandler}
                                                   className={'gap-2'}
                                                   >
                                                      {btnLoading?"Posting job...":"Post Job"}
                                                   </Button>
                                                </DialogFooter>
                                            </div>
                              </DialogContent>
                            </>
                        }

                        <div className="p-6">
                            {
                                company.jobs && company.jobs?.length>0 ? <div>
                                      {
                                        company.jobs.map((j)=>(
                                            <div className='p-5 rounded-lg border-2 hover:border-blue-500 transtion-all bg-background '>
                                                <div className="flex items-start justify-center gap-4 flex-wrap">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                            <h3 className="text-xl font-semibold">{j.title}</h3>
                                                            <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 
                                                                ${j.is_active?"bg-green-100 dark:bg-green-900/30 text-green-600":
                                                                "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}>
                                                                {
                                                                    j.is_active ? <CheckCircle size={14}/> : <XCircle size={14}/>
                                                                }
                                                                {
                                                                    j.is_active ? "Active" : "Inactive"
                                                                }
                                                                
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                                                            <div className="flex items-center gap-2 opacity-70">
                                                                <Building2 size={16} />
                                                                <span className="">
                                                                    {
                                                                        j.role
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 opacity-70">
                                                                <DollarSign size={16} />
                                                                <span className="">
                                                                    {
                                                                        j.salary?`₹ ${j.salary.toLocaleString()}`:"Not disclosed"
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 opacity-70">
                                                                <MapPin size={16} />
                                                                <span className="">
                                                                    {j.location}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 opacity-70">
                                                                <Laptop size={16} />
                                                                <span className="">
                                                                    {j.work_location}: {j.job_type}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 opacity-70">
                                                                <Users size={16} />
                                                                <span className="">
                                                                    {j.openings} openings
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/jobs/${j.job_id}`}>
                                                           <Button
                                                            variant={"outline"}
                                                            size='sm'
                                                            className={"gap-2"}
                                                           >
                                                            <Eye size={16}/> View
                                                           </Button>
                                                        </Link>

                                                        {
                                                            isRecruiterOwner && <>
                                                             <Button onClick={()=>handleOpenUpdateModal(j)}
                                                                variant={'outline'}
                                                                size={'sm'}
                                                                className={"gap-2"}
                                                             >
                                                                    <Pencil size={16}/> Edit
                                                             </Button>
                                                            </>
                                                        }
                                                    </div>
                                                </div>

                                            </div>
                                        ))
                                      }
                                </div>:
                                (
                                <>
                                  <div className="text-center py-12">
                                    <div className="inline-flex items-cemter justify-center
                                     w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                        <Briefcase size={32} className='opacity-40'/>
                                     </div>
                                     <p className="text-base opacity-70 mb-2">
                                        No jobs posted yet
                                     </p>
                                  </div>
                                </>
                                )
                            }
                        </div>

                    </Card>
                </Dialog>

                <Dialog open={isUpdatedModalOpen} onOpenChange={setIsUpdatedModalOpen}>
                        <DialogContent className={"sm:max-w-[600px] max-h-[90vh] overflow-y-auto"}>
                                <DialogHeader >
                                    <DialogTitle className={"text-2xl flex items-center gap-2"}>
                                        Update job
                                    </DialogTitle>
                                </DialogHeader>

                                   <div className="space-y-5 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor='title' className='text-sm font-medium flex items-center gap-2'>
                                                        <Briefcase size={16}/>
                                                         Job Title
                                                    </Label>
                                                    <Input id="title" type="text" placeholder='Enter Job Title'
                                                    className='h-11'
                                                    value={title}
                                                    onChange={(e)=>setTitle(e.target.value)}/>
                                                </div>
                                
                                                <div className="space-y-2">
                                                    <Label htmlFor='description' className='text-sm font-medium flex items-center gap-2'>
                                                        <FileText size={16}/>
                                                         Description
                                                    </Label>
                                                    <Input id="description" type="text" placeholder='Describe your company'
                                                    className='h-11'
                                                    value={description}
                                                    onChange={(e)=>setDescription(e.target.value)}/>
                                                </div>
                                
                                                <div className="space-y-2">
                                                    <Label htmlFor='role' className='text-sm font-medium flex items-center gap-2'>
                                                        <Building2 size={16}/>
                                                         Role
                                                    </Label>
                                                    <Input id="role" type="text" placeholder='Enter job role.'
                                                    className='h-11'
                                                    value={role}
                                                    onChange={(e)=>setRole(e.target.value)}/>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor='salary' className='text-sm font-medium flex items-center gap-2'>
                                                        <DollarSign size={16}/>
                                                         Salary
                                                    </Label>
                                                    <Input id="salary" type="text"
                                                     value={salary} 
                                                    className='h-11 cursor-pointer'
                                                    onChange={(e)=>setSalary(e.target.value)}/>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor='openings' className='text-sm font-medium flex items-center gap-2'>
                                                        <DollarSign size={16}/>
                                                         Openings
                                                    </Label>
                                                    <Input id="openings" type="number"
                                                     value={openings} 
                                                    className='h-11 cursor-pointer'
                                                    onChange={(e)=>setOpenings(e.target.value)}/>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor='location' className='text-sm font-medium flex items-center gap-2'>
                                                        <DollarSign size={16}/>
                                                         Location
                                                    </Label>
                                                    <Input id="location" type="text"
                                                     value={location} 
                                                    className='h-11 cursor-pointer'
                                                    onChange={(e)=>setLocation(e.target.value)}/>
                                                </div>

                                                <div className="grid md:grid-col-2 gap-4">
                                                    <div className="space-y-2 ">
                                                        <Label htmlFor='job_type'
                                                         className='text-sm font-medium flex items-center gap-1'>
                                                            <Clock size={16}/>
                                                            Job type
                                                        </Label>
                                                        <Select value={job_type} onValueChange={(value)=>setJob_Type(value ?? "")}>
                                                        <SelectTrigger className={"h-11"}>
                                                            <SelectValue placeholder='Select job type'/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={"Full-time"}>
                                                                Full-time
                                                            </SelectItem>
                                                            <SelectItem value={"Part-time"}>
                                                                Part-time
                                                            </SelectItem>
                                                            <SelectItem value={"Contract"}>
                                                                Contract
                                                            </SelectItem>
                                                            <SelectItem value={"Internship"}>
                                                                Internship
                                                            </SelectItem>
                                                        </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2 ">
                                                        <Label htmlFor='work_location'
                                                         className='text-sm font-medium flex items-center gap-1'>                                                          <Laptop size={16}/>
                                                            Select Work Location
                                                        </Label>
                                                        <Select value={work_location} onValueChange={(value)=>setWork_Location(value ?? "")}>
                                                        <SelectTrigger className={"h-11"}>
                                                            <SelectValue placeholder='Select job type'/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={"On-site"}>
                                                                On-site
                                                            </SelectItem>
                                                            <SelectItem value={"Remote"}>
                                                                Remote
                                                            </SelectItem>
                                                            <SelectItem value={"Hybrid"}>
                                                                Hybrid
                                                            </SelectItem>
                                                        </SelectContent>
                                                        </Select>

                                                        <div className="space-y-2">
                                                            <Label className='text-sm font-medium 
                                                            flex items-center gap-2' htmlFor='update-is_active'>
                                                                {
                                                                    isActive?<CheckCircle size={16}/>:<XCircle size={16}/>
                                                                }
                                                            </Label>
                                                            <Select value={isActive} onValueChange={(value)=>setIsActive(value===true)}>
                                                                <SelectTrigger className={"h-11"}>
                                                                    <SelectValue placeholder='Select status'/>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value={"true"}>
                                                                    Active
                                                                    </SelectItem>
                                                                    <SelectItem value={"false"}>
                                                                    Inactive
                                                                    </SelectItem>
                                                                
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <DialogFooter>
                                                    <DialogClose >
                                                        <Button ref={addModalRef} variant={"outline"}>
                                                            Cancel
                                                        </Button>
                                                   </DialogClose>

                                                   <Button 
                                                   disabled={btnLoading}
                                                   onClick={updateJobHandler}
                                                   className={'gap-2'}
                                                   >
                                                      {btnLoading?"Updating job...":"Update Job"}
                                                   </Button>
                                                </DialogFooter>
                                            </div>
                              </DialogContent>
                </Dialog>

            </div>
        }
    </div>
  )
}

export default CompanyPage