"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import DiscoverySection from '@/components/DiscoverySection';
import InterviewSection from '@/components/InterviewSection';
import AnalyzerSection from '@/components/AnalyzerSection';
import ProjectsSection from '@/components/ProjectsSection';
import DashboardSection from '@/components/DashboardSection';

export interface UserData {
  college: string;
  specialization: string;
  cgpa: string;
  techStack: string;
  experience: string;
  analysisResults: any | null;
}

export default function Home() {
  const [currentMode, setCurrentMode] = useState<string>('discovery');
  const [userData, setUserData] = useState<UserData>({
    college: '',
    specialization: 'Software Engineering',
    cgpa: '',
    techStack: '',
    experience: '',
    analysisResults: null
  });

  const navigate = (mode: string) => {
    setCurrentMode(mode);
  };

  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const restoreAnalysis = (analysis: any, profile: any) => {
    setUserData({
      college: profile?.college || '',
      specialization: profile?.specialization || 'Software Engineering',
      cgpa: profile?.cgpa || '',
      techStack: profile?.techStack || '',
      experience: profile?.experience || '',
      analysisResults: analysis
    });
  };

  return (
    <div className="bg-surface text-primary h-screen flex text-sm overflow-hidden font-body">
      <Sidebar currentMode={currentMode} navigate={navigate} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-surface relative">
        <TopNav navigate={navigate} />
        
        <div className="flex-1 overflow-y-auto w-full no-scrollbar px-4 md:px-12 pb-12 pt-4 relative">
          {currentMode === 'discovery' && <DiscoverySection navigate={navigate} />}
          {currentMode === 'dashboard' && <DashboardSection navigate={navigate} restoreAnalysis={restoreAnalysis} />}
          {currentMode === 'interview' && (
            <InterviewSection 
              navigate={navigate} 
              userData={userData} 
              updateUserData={updateUserData} 
            />
          )}
          {currentMode === 'analyzer' && (
            <AnalyzerSection 
              navigate={navigate} 
              userData={userData} 
              updateUserData={updateUserData} 
            />
          )}
          {currentMode === 'projects' && (
            <ProjectsSection 
              userData={userData} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
