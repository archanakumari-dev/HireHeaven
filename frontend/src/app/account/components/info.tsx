import { useAppData } from '@/app/context/AppContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AccountProps } from '@/type'
import { AlertTriangle, Briefcase, Camera, CheckCircle, CheckCircle2, Crown, Edit, FileText, Mail, NotepadText, Phone, PhoneIcon, RefreshCcw, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { ChangeEvent, use, useRef, useState } from 'react'

const Info:React.FC<AccountProps> = ({user,isYourAccount}) => {

  const inputRef=useRef<HTMLInputElement | null>(null);
  const editRef=useRef<HTMLButtonElement | null>(null);
  const resumeRef=useRef<HTMLInputElement | null>(null);
  const router=useRouter()

  const [name,setName]=useState("");
  const [phoneNumber,setPhoneNumber]=useState("");
  const [bio,setBio]=useState("");

  const {updateProfilePic,updateResume,btnLoading,updateUser}=useAppData();


  const handleClick=()=>{
    inputRef.current?.click();
  }

  const changeHandler=(e:ChangeEvent<HTMLInputElement>)=>{
       const file=e.target.files?.[0];
       if(file){
          const formData=new FormData();
          formData.append("file",file);
          updateProfilePic(formData);
       }
  }

  const handleEditClick=()=>{
    editRef.current?.click();
    setName(user.name);
    setPhoneNumber(user.phone_number);
    setBio(user.bio || "")
  }

  const handleResumeClick=()=>{
      resumeRef.current?.click()
  }

  const updateProfileHandler=()=>{
      updateUser(name,phoneNumber,bio);
  }

  const changeResume=(e:ChangeEvent<HTMLInputElement>)=>{
      const file=e.target.files?.[0];
      if(file){
        if(file.type!=='application/pdf'){
          alert("Please upload a pdf file.")
          return;
         }
         
       const formData=new FormData();
       formData.append("file",file);
       updateResume(formData);
      }

  }


  return (
    <div className='max-w-5xl mx-auto px-4 py-8'>
        <Card className='overflow-hidden shadow-lg border-2'>
           <div className="h-32 bg-blue-500 relative">
            <div className="absolute -bottom-16 left-8">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden shadow-xl bg-background">
                        <img
                          src={user.profile_pic ? user.profile_pic : "/user.png"}
                          className='w-full h-full object-cover'
                        />
                    </div>
                    {/* {edit option for profile pic} */}
                    {
                      isYourAccount &&(
                        <>
                        <Button variant={"secondary"}
                          className={"absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg cursor-pointer"}
                          size={"icon"}
                          onClick={handleClick}
                          >
                            <Camera size={18}/>
                          </Button>

                         <input type="file" className='hidden' accept="image/*" ref={inputRef} onChange={changeHandler}/>
                        </>  
                      )
                    }
                </div>
              </div>
             </div>
            {/* Main content */}
            <div className="pt-20 pb-8 px-8">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{user.name}</h1>

                    {/* edit button */}
                    {isYourAccount && (<Button 
                      variant={"ghost"}
                      size={"icon"}
                      className={"h-8 w-8 cursor-pointer"}
                      onClick={handleEditClick}
                    >
                     <Edit size={16}/>
                    </Button>)}
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-70">
                    <Briefcase size={16}/>
                    <span className="capitalize">{user.role}</span>
                  </div>
                </div>
              </div>

              {/* bio */}
              {
                user.role==="jobseeker" && user.bio &&
                (<div className='mt-6 p-4 rounded-lg border'>
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium opacity-70">
                      <FileText size={16}/>
                      <span className="">About</span>
                    </div>
                    <p className="text-base leading-relaxed">{user.bio}</p>
                </div>)
              }
              {/* contact info */}
              <div className="mt-8">
                <h2 className="tet-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail size={20} className='text-blue-600'/>
                  Contact Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Mail size={18} className='text-blue-600'/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm opacity-70 font-medium ">Email</p>
                      <p className="text-sm truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Phone size={18} className='text-blue-600'/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm opacity-70 font-medium ">Phone Number</p>
                      <p className="text-sm truncate">{user.phone_number}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* resume section */}

              {
                user.role==='jobseeker' && user.resume &&
                (
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold mt-4 flex items-center gap-2">
                      <NotepadText size={20} className="text-blue-600"/>
                      Resume
                    </h2>
                    <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors">
                      <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                        <NotepadText size={20} className="text-red-600"/>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Resume Document</p>
                        <Link href={user.resume}
                          className='text-sm text-blue-500 hover:underline' target="_blank"
                        >
                          View Resume PDF
                        </Link>
                      </div>

                      {/* Edit Resume*/}

                      {isYourAccount && (
                        <>
                        <Button variant={"secondary"} size={"sm"}
                        onClick={handleResumeClick}
                        className={"gap-2 cursor-pointer"}>
                          Update
                        </Button>

                        <input
                          type="file"
                          ref={resumeRef}
                          className='hidden'
                          accept='application/pdf'
                          onChange={changeResume}
                        />
                        </>
                        )}


                    </div>
                  </div>
                )
              }

              {/* Subscription */}

              {
                isYourAccount && 
                <>
                   {
                    user.role==='jobseeker' && 
                     <div className="mt-8 ">
                      <h2 className="text-lg font-semibold mt-4 flex items-center gap-4 ">
                         <Crown size={20} className='text-blue-600'/>
                         Subscription
                      </h2>

                      <div className={`p-6 rounded-lg bg-linear-to-br from-blue-50 to-purple-50
                       dark:from-blue-900/20 to-purple-900/20
                       `}>
                        {
                          !user.subscription ? <>
                              <div className="flex items-center justify-between flex-wrap gap-4">
                                  <div>
                                    <p className="font-semibold text-lg mb-1">
                                       No active subscription.
                                    </p>
                                    <p className="text-sm opacity-70"> 
                                      Subscribe to unlock premium features and benefits.
                                    </p>
                                  </div>
                                  <Button className={'gap-2'} onClick={()=>router.push('/subscribe')}>
                                      Subsribe Now
                                  </Button>
                              </div>
                          </> :
                          
                             new Date(user.subscription).getTime()>Date.now() ?
                             <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 size={20} className='text-green-600'/>
                                    <p className="font-semibold text-lg text-green-600">
                                      Active Subscription
                                    </p>
                                  </div>
                                  <p className="text-sm opacity-70">
                                    Valid until : {" "}
                                    {new Date(user.subscription).toLocaleDateString("en-US",
                                       {
                                          year:"numeric", month:"long",day:"numeric"
                                       })
                                    }
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-700 text-white font-medium">
                                   <CheckCircle2 size={18}/>
                                   Subscribed
                                </div>
                             </div>
                          :
                          <>
                           <div className="flex items-center justify-betweenflex-wrap gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={20} className='text-red-600'/>
                                <p className="font-semibold text-lg text-red-600 ">
                                  Subscription expired
                                </p>
                              </div>
                              <p className="text-sm opacity-70">
                                Expired on {
                                    
                                      new Date(user.subscription).toLocaleDateString("en-US",
                                       {
                                          year:"numeric", month:"long",day:"numeric"
                                       })
                                    
                                }
                              </p>
                            </div>
                            <Button onClick={()=>router.push('/subscribe')} 
                               className={'gap-2'} variant={'destructive'}>
                               <RefreshCcw size={18}/>
                               Renew Subscription
                            </Button>
                           </div>
                          </>
                        }

                       </div>
                     </div>
                   }
                </>
              }


            </div>   
        </Card>

        {/* Dialog box for editing */}
        <Dialog>
                <DialogTrigger
          render={
            <Button
              ref={editRef}
              variant="outline"
              className="hidden"
            >
              Edit Profile
            </Button>
          }
        />

          <DialogContent className={"sm:max-w-[500px]"}>
             <DialogHeader>
              <DialogTitle className={"text-2xl"}>
                 Edit Profile
              </DialogTitle>
             </DialogHeader>

             <div className='space-y-5 py-4'>
                 <div className="spce-y-2">
                  <Label htmlFor='name' className='text:sm font-medium flex items-center gap-2'>
                    <UserIcon size={16}/>
                    Full Name
                  </Label>
                  <Input 
                     id='name'
                     placeholder='Enter your name'
                     type="text"
                     className='h-11'
                     value={name}
                     onChange={(e)=>setName(e.target.value)}
                   />
                 </div>

                 <div className="spce-y-2">
                  <Label htmlFor='phone' className='text:sm font-medium flex items-center gap-2'>
                    <PhoneIcon size={16}/>
                    Phone
                  </Label>
                  <Input 
                     id='phone'
                     placeholder='123456789'
                     type="number"
                     className='h-11'
                     value={phoneNumber}
                     onChange={(e)=>setPhoneNumber(e.target.value)}
                   />
                 </div>

                 {
                  user.role==="jobseeker" &&
                  (
                    <div className="spce-y-2">
                  <Label htmlFor='bio' className='text:sm font-medium flex items-center gap-2'>
                    <FileText size={16}/>
                    Bio
                  </Label>
                  <Input 
                     id='bio'
                     type="text"
                     className='h-11'
                     value={bio}
                     onChange={(e)=>setBio(e.target.value)}
                   />
                 </div>
                  )
                 }
             </div>

             <DialogFooter>
                <Button disabled={btnLoading} onClick={updateProfileHandler} className={"w-full h-11 cursor-pointer"} type='submit'>
                     {btnLoading?"Saving changes...":"Save changes"}
                </Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}

export default Info