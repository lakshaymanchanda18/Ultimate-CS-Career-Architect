"use client";

import React, { forwardRef } from 'react';
import { UserData } from '../app/page';
import { useSession } from 'next-auth/react';

interface Props {
  userData: UserData;
}

const ResumeTemplate = forwardRef<HTMLDivElement, Props>(({ userData }, ref) => {
  const { data: session } = useSession();
  const name = session?.user?.name || "Candidate Name";
  const email = session?.user?.email || "candidate@example.com";

  // Destructure analysis results
  const fixedBullet = userData.analysisResults?.fixedBullet || userData.experience;
  const keywords = userData.analysisResults?.keywords || [];

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
      <div 
        ref={ref} 
        className="bg-white text-black p-10 font-sans"
        style={{ width: '800px', minHeight: '1120px' }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">{name}</h1>
          <p className="text-sm">
            {email} • {userData.college || "University Name"}
          </p>
        </div>

        {/* Education */}
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-2 pb-1">Education</h2>
          <div className="flex justify-between font-semibold">
            <span>{userData.college || "University Name"}</span>
            <span>CGPA: {userData.cgpa || "N/A"}</span>
          </div>
          <p className="italic text-gray-700">{userData.specialization || "Degree Specialization"}</p>
        </div>

        {/* Experience / Projects */}
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-2 pb-1">Experience & Projects</h2>
          <div className="mb-4">
            <div className="flex justify-between font-semibold">
              <span>Software Engineering Role / Project</span>
              <span>Present</span>
            </div>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li>{fixedBullet}</li>
              {/* Add a few placeholder bullets for structure if needed */}
              <li>Engineered scalable backend solutions resulting in improved processing time.</li>
              <li>Collaborated with cross-functional teams to define architectural requirements.</li>
            </ul>
          </div>
        </div>

        {/* Technical Skills */}
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-2 pb-1">Technical Skills</h2>
          <p className="text-sm">
            <span className="font-bold">Languages & Frameworks: </span>
            {userData.techStack || "JavaScript, React, Node.js, Python"}
          </p>
          {keywords.length > 0 && (
            <p className="text-sm mt-1">
              <span className="font-bold">Key Competencies: </span>
              {keywords.join(', ')}
            </p>
          )}
        </div>

      </div>
    </div>
  );
});

ResumeTemplate.displayName = 'ResumeTemplate';

export default ResumeTemplate;
