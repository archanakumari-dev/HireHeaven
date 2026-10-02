"use client"
import CarrerGuide from "@/components/carrer-guide";
import Hero from "@/components/hero";
import ResumeAnalyzer from "@/components/resume-analyser";
import { useAppData } from "./context/AppContext";
import Loading from "@/components/loading";


export default function Home() {
  const {loading}=useAppData();
  if(loading) return <Loading/>
  
  return (
    <div>
        <Hero/>
        <CarrerGuide/>
        <ResumeAnalyzer/>
    </div>
  );
}
