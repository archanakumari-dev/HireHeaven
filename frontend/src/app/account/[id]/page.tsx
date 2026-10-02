"use client"

import { user_service } from "@/app/context/AppContext";
import { User } from "@/type";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie'
import Loading from "@/components/loading";
import Info from "../components/info";
import Skills from "../components/skills";
import Company from "../components/company";

const UserAccount = () => {
    const[user,setUser]=useState<User | null>(null);

    const [loading,setLoading]=useState(true);
    const {id}=useParams();

    async function fetchUser(){
        const token=Cookies.get("token");
        try {
           const {data}=await axios.get(`${user_service}/api/user/${id}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
           }) 

           setUser(data);
        } catch (error) {
            console.log(error);
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchUser();
    },[]);

    if(loading) return <Loading/>

    return (
      <>
         {
         user &&
         <div className="w-[90%] md:w-[60%] m-auto">
             <Info user={user} isYourAccount={false}/>
             {
                user.role==='jobseeker' && <Skills user={user} isYourAccount={false}/>  
             }
         </div>
         }
         </>
    )
}

export default UserAccount