"use client"
import { Job } from '@/type';
import React, { useEffect, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import axios from 'axios';
import { job_service } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Briefcase, Filter, Map, MapPin, Search, X } from 'lucide-react';
import Loading from '@/components/loading';
import toast from 'react-hot-toast';
import JobCard from '@/components/job-card';
import { Dialog ,DialogContent,DialogFooter,DialogHeader,DialogTitle,DialogTrigger} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


const JobsPage = () => {
    const locations:string[] = [
        "Bengaluru",
        "Hyderabad",
        "Pune",
        "Gurugram",
        "Noida",
        "Mumbai",
        "Chennai",
        "Delhi",
        "Kolkata",
        "Ahmedabad"
        ];
    const [loading,setLoading]=useState(true);
    const [jobs,setJobs]=useState<Job[]>([]);
    const [title,setTitle]=useState("");
    const [location,setLocation]=useState("");

    const token=Cookies.get("token");
    const ref=useRef<HTMLButtonElement>(null);

    async function fetchJobs(){
        setLoading(true)
        try {
           const {data}= await axios.get(`${job_service}/api/job/all?title=${title}&location=${location}`,{headers:{
            Authorization:`Bearer ${token}`
           }}) ;
           setJobs(data.jobs);
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{fetchJobs()},[title ,location]);

    const clickEvent=()=>{
        ref.current?.click();
    }

    const clearFilter=()=>{
        setTitle("");
        setLocation("");
        fetchJobs();
        ref.current?.click();
    }

    const hasActiveFilter= title || location;

  return (
    <div className='min-h-screen bg-secondary/30'>
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header section */}
            <div className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-medium mb-2">Explore Opportunities</h1>
                        <p className="text-base opacity-70">{jobs.length} Jobs</p>
                    </div>

                    <Button className={"gap-2 h-11"} onClick={clickEvent}>
                      <Filter size={18}/> Filters
                      {
                        hasActiveFilter && <span className="ml-1 px-2 py-05 rounded-full bg-red-500 text-white text-sm">
                            Active
                        </span>
                      }
                    </Button>
                </div>

                {
                    hasActiveFilter && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm opacity-70">
                                Active Filters:
                            </span>
                            {
                                title && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full ng-blue-100 dark:ng-blue-900/30 text-blue-600 text-sm">
                                        <Search size={14}/>
                                        {title}
                                        <button onClick={()=>setTitle("")} 
                                        className='hover:bg-blue-200  dark:bg-blue-800 rounded-full p-0.5'
                                        >
                                         <X size={14}/>    
                                        </button>
                                    </div>
                                )
                            }

                            {
                                location && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full ng-blue-100 dark:ng-blue-900/30 text-blue-600 text-sm">
                                        <Map size={14}/>
                                        {location}
                                        <button onClick={()=>setLocation("")} 
                                        className='hover:bg-blue-200  dark:bg-blue-800 rounded-full p-0.5'
                                        >
                                         <X size={14}/>    
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    )
                }

                {
                    loading ? <Loading/> :<>
                      {
                        jobs && jobs.length>0 ?
                        (<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
                         {
                            jobs.map((job)=>(
                                <JobCard key={job.job_id} job={job}/>
                                
                            ))
                         }
                        </div>) :
                        (
                            <div className='text-center py-16'>
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                    <Briefcase size={40} className='opacity-40 '/>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No jobs found.</h3>
                            </div>
                        )
                      }
                    </>
                }
            </div>

            <Dialog>
                <DialogTrigger
                    render={
                        <Button ref={ref} className="hidden" />
                    }
                />

                <DialogContent className={'sm:max-w-[500px]'}>
                    <DialogHeader>
                        <DialogTitle className={"text-2xl flex items-center gap-2"}>
                            <Filter className='text-blue-600'/>
                            Filter Jobs
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor='title' className='text-sm font-medium flex items-center gap-2'>
                                            <Search size={16}/>
                                             Search by job title
                                        </Label>
                                        <Input id="title" type="text" placeholder='software intern...'
                                        className='h-11'
                                        value={title}
                                        onChange={(e)=>setTitle(e.target.value)}/>
                                    </div>

                                     <div className="space-y-2">
                                        <Label htmlFor='location' className='text-sm font-medium flex items-center gap-2'>
                                            <MapPin size={16}/>
                                             Search by job location
                                        </Label>
                                        <select id='location' value={location}
                                         onChange={(e)=>setLocation(e.target.value)}
                                         className='w-full h-11 px-3 border-2 border-gray-300 
                                         rounded-md bg-transparent focus:ouline-none focus:ring-2'
                                         >
                                            <option value="">
                                                All locations
                                            </option>
                                            {
                                                locations.map((e)=>(
                                                    <option value={e} key={e}>
                                                        {e}
                                                    </option>
                                                ))
                                            }

                                        </select>
                                    </div>
                    
                                    <DialogFooter className='gap-2'>
                                        <Button 
                                        variant={'outline'}
                                          onClick={clearFilter}
                                          className={"flex-1"}
                                        >
                                            Clear All
                                        </Button>
                                    </DialogFooter>
                                </div>
                </DialogContent>
            </Dialog>
        </div>
    </div>
  )
}

export default JobsPage