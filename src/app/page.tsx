"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import DiscoverySection from "@/components/DiscoverySection";
import InterviewSection from "@/components/InterviewSection";
import AnalyzerSection from "@/components/AnalyzerSection";
import DashboardSection from "@/components/DashboardSection";
import JobBoardSection from "@/components/JobBoardSection";
import ProjectsSection from "@/components/ProjectsSection";
import ProjectStudio from "@/components/ProjectStudio";
import SettingsSection from "@/components/SettingsSection";

export interface UserData {
  college: string;
  specialization: string;
  cgpa: string;
  techStack: string;
  experience: string;
  analysisResults?: any;
}

export default function Home() {
  const [appMode, setAppMode] = useState("discovery"); // logical state
  const [displayMode, setDisplayMode] = useState("discovery"); // render state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeProject, setActiveProject] = useState<{title: string, techStack: string} | null>(null);
  const [userData, setUserData] = useState<UserData>({
    college: "",
    specialization: "",
    cgpa: "",
    techStack: "",
    experience: "",
  });

  const navigate = (mode: string) => {
    if (mode === appMode) return;
    setIsTransitioning(true);
    setAppMode(mode);
    
    setTimeout(() => {
      setDisplayMode(mode);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const updateUserData = (data: Partial<UserData>) => {
    setUserData({ ...userData, ...data });
  };

  const restoreAnalysis = (analysis: any, profile: any) => {
    setUserData({
      college: profile?.college || "",
      specialization: profile?.specialization || "",
      cgpa: profile?.cgpa || "",
      techStack: profile?.techStack || "",
      experience: profile?.experience || "",
      analysisResults: analysis,
    });
  };

  const openStudio = (title: string, techStack: string) => {
    setActiveProject({ title, techStack });
    navigate("project-studio");
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden w-full">
      <Sidebar currentMode={appMode} navigate={navigate} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <TopNav navigate={navigate} />
        
        {/* Ambient background glow for content area */}
        <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none -z-10"></div>
        
        <div className={`flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 scroll-smooth transition-opacity duration-200 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {displayMode === "discovery" && <DiscoverySection navigate={navigate} />}
          {displayMode === "interview" && <InterviewSection navigate={navigate} userData={userData} updateUserData={updateUserData} />}
          {displayMode === "analyzer" && <AnalyzerSection navigate={navigate} userData={userData} updateUserData={updateUserData} />}
          {displayMode === "dashboard" && <DashboardSection navigate={navigate} restoreAnalysis={restoreAnalysis} />}
          {displayMode === "job-board" && <JobBoardSection />}
          {displayMode === "projects" && <ProjectsSection userData={userData} openStudio={openStudio} />}
          {displayMode === "project-studio" && activeProject && <ProjectStudio title={activeProject.title} techStack={activeProject.techStack} navigate={navigate} />}
          {displayMode === "settings" && <SettingsSection />}
        </div>
      </main>
    </div>
  );
}
