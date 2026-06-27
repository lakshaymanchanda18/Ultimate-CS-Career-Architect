"use client";

import { useState, Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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
import LandingPage from "@/components/LandingPage";

export interface UserData {
  name: string;
  college: string;
  specialization: string;
  cgpa: string;
  techStack: string;
  experience: string;
  analysisResults?: any;
}

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-on-surface-variant animate-pulse font-body">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-surface">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-on-surface-variant animate-pulse font-body">Loading console...</p>
          </div>
        </div>
      }>
        <DashboardApp />
      </Suspense>
    );
  }

  return <LandingPage />;
}

function DashboardApp() {
  const searchParams = useSearchParams();
  const querySection = searchParams.get("section");
  const initialSection = ["discovery", "interview", "analyzer", "dashboard", "job-board", "projects", "settings"].includes(querySection || "") ? querySection! : "discovery";

  const [appMode, setAppMode] = useState(initialSection); // logical state
  const [displayMode, setDisplayMode] = useState(initialSection); // render state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [exploreProjects, setExploreProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<{title: string, techStack: string} | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    college: "",
    specialization: "",
    cgpa: "",
    techStack: "",
    experience: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const profile = await res.json();
          setUserData(prev => ({
            ...prev,
            name: profile.name || "",
            college: profile.college || "",
            specialization: profile.specialization || "",
            cgpa: profile.cgpa || "",
            techStack: profile.techStack || "",
            experience: profile.experience || "",
          }));
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

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
      name: profile?.name || userData.name || "",
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
      <Sidebar 
        currentMode={appMode} 
        navigate={navigate} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        <TopNav navigate={navigate} onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        {/* Ambient background glow for content area */}
        <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none -z-10"></div>
        
        <div className={`flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 scroll-smooth transition-opacity duration-200 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {loadingProfile ? (
            <div className="flex h-full w-full items-center justify-center py-20 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-on-surface-variant animate-pulse font-body">Loading your profile...</p>
              </div>
            </div>
          ) : (
            <>
              {displayMode === "discovery" && <DiscoverySection navigate={navigate} />}
              {displayMode === "interview" && <InterviewSection navigate={navigate} userData={userData} updateUserData={updateUserData} />}
              {displayMode === "analyzer" && <AnalyzerSection navigate={navigate} userData={userData} updateUserData={updateUserData} />}
              {displayMode === "dashboard" && <DashboardSection navigate={navigate} restoreAnalysis={restoreAnalysis} />}
              {displayMode === "job-board" && <JobBoardSection />}
              {displayMode === "projects" && (
                <ProjectsSection 
                  userData={userData} 
                  openStudio={openStudio} 
                  exploreProjects={exploreProjects}
                  setExploreProjects={setExploreProjects}
                />
              )}
              {displayMode === "project-studio" && activeProject && <ProjectStudio title={activeProject.title} techStack={activeProject.techStack} navigate={navigate} />}
              {displayMode === "settings" && <SettingsSection userData={userData} updateUserData={updateUserData} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
