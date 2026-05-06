"use client";

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Building2, Briefcase, Calendar, AlertCircle, Trash2 } from 'lucide-react';

const COLUMNS = ['WISHLIST', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'];

interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string | null;
  notes: string | null;
}

export default function JobBoardSection() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New Job Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({ company: '', role: '', status: 'WISHLIST' });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJobs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistic UI Update
    const updatedJobs = Array.from(jobs);
    const draggedJobIndex = updatedJobs.findIndex(j => j.id === draggableId);
    if (draggedJobIndex > -1) {
      updatedJobs[draggedJobIndex].status = destination.droppableId;
      setJobs(updatedJobs);
    }

    // Backend Sync
    try {
      await fetch(`/api/jobs/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId })
      });
    } catch (err) {
      console.error("Failed to update job status", err);
      fetchJobs(); // Revert on failure
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.company || !newJob.role) return;

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setJobs([data, ...jobs]);
      setShowAddForm(false);
      setNewJob({ company: '', role: '', status: 'WISHLIST' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job application?')) return;

    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete job');
      
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <section className="fade-in flex flex-col w-full h-full items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="fade-in flex flex-col w-full h-full items-center justify-center">
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-3xl border border-red-200 shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-headline font-bold text-primary mb-3">Access Denied</h3>
          <p className="text-on-surface-variant text-[15px] mb-8">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="fade-in flex flex-col w-full h-full pb-8 overflow-hidden">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 slide-up">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">Application Tracker</p>
          <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary tracking-tight">Kanban Board</h2>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-on-primary-fixed px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-fixed hover:shadow-lg transition-all text-sm w-fit"
        >
          <Plus size={18} /> Add Application
        </button>
      </div>

      {showAddForm && (
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-md mb-8 max-w-2xl slide-up gradient-border relative z-20">
          <h3 className="font-headline font-bold text-lg mb-6">New Application Record</h3>
          <form onSubmit={handleAddJob} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <input 
                type="text" 
                placeholder="Company Name" 
                className="bg-surface p-4 rounded-xl border border-transparent focus:border-secondary/30 outline-none text-[15px] focus-ring transition-all"
                value={newJob.company}
                onChange={e => setNewJob({...newJob, company: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder="Role (e.g. SDE I)" 
                className="bg-surface p-4 rounded-xl border border-transparent focus:border-secondary/30 outline-none text-[15px] focus-ring transition-all"
                value={newJob.role}
                onChange={e => setNewJob({...newJob, role: e.target.value})}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-5 items-stretch sm:items-center">
              <select 
                className="bg-surface p-4 rounded-xl border border-transparent focus:border-secondary/30 outline-none text-[15px] focus-ring transition-all flex-1 appearance-none"
                value={newJob.status}
                onChange={e => setNewJob({...newJob, status: e.target.value})}
              >
                {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-3">
                <button type="submit" className="bg-primary text-on-primary-fixed px-8 py-4 rounded-xl font-bold text-[15px] hover:shadow-lg transition-all">Save</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="bg-surface-container-low text-primary px-6 py-4 rounded-xl font-semibold hover:bg-surface-container-high transition-all">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden slide-up" style={{ animationDelay: '100ms' }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full min-w-max pb-4 px-1">
            {COLUMNS.map(columnId => {
              const columnJobs = jobs.filter(j => j.status === columnId);
              
              // Map column to color accent
              let accentColor = "bg-outline-variant";
              if(columnId === 'OFFER') accentColor = "bg-secondary-fixed shadow-[0_0_10px_rgba(95,251,214,0.4)]";
              if(columnId === 'REJECTED') accentColor = "bg-red-400";
              if(columnId === 'INTERVIEWING') accentColor = "bg-blue-400";
              
              return (
                <div key={columnId} className="w-[320px] flex flex-col bg-surface-container-low/50 rounded-3xl border border-outline-variant/10 overflow-hidden shrink-0">
                  <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest relative">
                    <div className={`absolute top-0 left-0 w-full h-1 ${accentColor}`}></div>
                    <h3 className="font-headline font-bold text-[13px] tracking-widest uppercase text-primary mt-1">{columnId}</h3>
                    <span className="text-[10px] bg-surface-container-low px-2.5 py-1 rounded-full font-bold text-on-surface-variant mt-1">{columnJobs.length}</span>
                  </div>
                  
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-4 flex flex-col gap-4 overflow-y-auto transition-colors duration-300 ${snapshot.isDraggingOver ? 'bg-secondary-fixed/5' : ''}`}
                        style={{ minHeight: '200px' }}
                      >
                        {columnJobs.map((job, index) => (
                          <Draggable key={job.id} draggableId={job.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-surface-container-lowest p-5 rounded-2xl border transition-all duration-200 ${snapshot.isDragging ? 'shadow-xl border-secondary scale-105 rotate-2 z-50' : 'shadow-sm border-outline-variant/15 hover:border-outline-variant/40 hover:shadow-md'}`}
                              >
                                <div>
                                  <h4 className="font-headline font-bold text-[16px] leading-tight text-primary flex items-start gap-2 mb-2">
                                    <Briefcase size={16} className="text-secondary shrink-0 mt-0.5" /> 
                                    <span className="flex-1">{job.role}</span>
                                    <button 
                                      onClick={() => handleDeleteJob(job.id)}
                                      className="p-1 text-on-surface-variant/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-20"
                                      title="Delete Application"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </h4>
                                  <p className="text-[14px] font-medium text-on-surface-variant flex items-center gap-2">
                                    <Building2 size={14} className="opacity-70" /> {job.company}
                                  </p>
                                </div>
                                {job.appliedDate && (
                                  <div className="text-[9px] uppercase font-bold tracking-widest text-on-surface-variant/60 flex items-center gap-1.5 border-t border-surface-container-low pt-3 mt-4">
                                    <Calendar size={11} /> {new Date(job.appliedDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </section>
  );
}
