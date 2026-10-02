"use client";

import { AppContextType, Application, AppProviderProps, User } from "@/type";
import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from 'js-cookie';
import axios from "axios";

export const utils_service = "http://13.60.76.240:5001";
export const auth_service = "http://13.60.76.240:5000"
export const user_service = "http://13.60.76.240:5002"
export const job_service = "http://13.60.76.240:5003"
export const payment_service = "http://13.60.76.240:5004"

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);

    let token = Cookies.get("token");

    async function fetchUser() {
        try {
            const { data } = await axios.get(`${user_service}/api/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });


            setUser(data);
            setIsAuth(true);
        } catch (error) {
            console.log(error);
            setIsAuth(false);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfilePic(formData: any) {
        setLoading(true);
        try {
            const { data } = await axios.put(`${user_service}/api/user/update/profile_pic`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            toast.success(data.message);
            fetchUser();
        } catch (error: any) {
            toast.error(error.response.data.message)
        } finally {
            setLoading(false);
        }
    }

    async function updateResume(formData: any) {
        setLoading(true);
        try {
            const { data } = await axios.put(`${user_service}/api/user/update/resume`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            toast.success(data.message);
            fetchUser();
        } catch (error: any) {
            toast.error(error.response.data.message)
        } finally {
            setLoading(false);
        }
    }    

    
  async function updateUser(name:string,phoneNumber:string,bio:string){
      setLoading(true);
      const token1 = Cookies.get("token");
      try {
        const {data}=await axios.put(`${user_service}/api/user/update/profile`,
        {name,phone_number:phoneNumber,bio},
        {
            headers:{
                Authorization:`Bearer ${token1}`
            }
        });

        toast.success(data.message);
        fetchUser();
      } catch (error:any) {
        toast.error(error.response.data.message)
      } finally {
            setLoading(false);
        }
  }


    async function logoutUser() {
        Cookies.set("token", "");
        setUser(null);
        setIsAuth(false);
        toast.success("Logged out successfully.")
    }

    async function removeSkill(skill:string){
       setLoading(true);
       try {
        const {data}=await axios.put(`${user_service}/api/user/skill/delete`,{skillName:skill},{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        toast.success(data.message);
        fetchUser();
        
       } catch (error:any) {
        toast.error(error.response.data.message)
       } finally {
            setLoading(false);
        }
    }

     async function addSkill(skill:string,setSkill:React.Dispatch<React.SetStateAction<string |"">>){
       setLoading(true);
       try {
        const {data}=await axios.post(`${user_service}/api/user/skill/add`,{skillName:skill},{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        toast.success(data.message);
        setSkill("");
        fetchUser();
        
       } catch (error:any) {
        toast.error(error.response.data.message)
       } finally {
            setLoading(false);
        }
    }

    async function applyJob(job_id:number){
        setBtnLoading(true);
        try {
            const {data}=await axios.post(`${user_service}/api/user/apply/job`,{job_id},{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            toast.success(data.message);
            fetchApplications();
        } catch (error:any) {
            toast.error(error.response.data.message)
        }finally{
           setBtnLoading(false);
        }
    }

    const [applications,setApplications]=useState<Application[] |null>(null);
    async function fetchApplications(){
        setBtnLoading(true);
        try {
            const {data}=await axios.get(`${user_service}/api/user/application/all`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            setApplications(data);
        } catch (error:any) {
             toast.error(error.response.data.message)
        }finally{
            setBtnLoading(false);
        }
    }


    useEffect(() => {
        fetchUser();
        fetchApplications();
    }, [])

    return <AppContext.Provider value={
    { user, loading, btnLoading, isAuth, 
    setUser, setIsAuth, setLoading, 
    logoutUser, updateProfilePic,updateResume,
     updateUser,addSkill,removeSkill,applyJob,fetchApplications,applications }}
    >
        {children}
        <Toaster />
    </AppContext.Provider>

}


export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useAppData must be used within provider.")
    }

    return context;

}