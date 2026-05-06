"use client";

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Building2, Briefcase, Calendar, AlertCircle } from 'lucide-react';

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

  if (loading) {
    return (
      <section className="fade-in flex flex-col w-full h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-surface-container border-t-secondary-fixed rounded-full animate-spin"></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="fade-in flex flex-col w-full h-full items-center justify-center">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center flex flex-col items-center max-w-md">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <h3 className="font-bold text-red-600 mb-1">Access Denied</h3>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <p className="text-xs text-on-surface-variant">Please sign in to view your Job Board.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="fade-in flex flex-col w-full h-full pb-8">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">Application Tracker</p>
          <h2 className="text-3xl font-headline font-extrabold text-primary">Kanban Board</h2>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors text-sm"
        >
          <Plus size={16} /> Add Application
        </button>
      </div>

      {showAddForm && (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm mb-6 max-w-2xl">
          <h3 className="font-bold mb-4">New Application</h3>
          <form onSubmit={handleAddJob} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Company Name" 
                className="bg-surface p-3 rounded-lg border border-outline-variant/20 focus:border-secondary outline-none text-sm"
                value={newJob.company}
                onChange={e => setNewJob({...newJob, company: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder="Role (e.g. SDE I)" 
                className="bg-surface p-3 rounded-lg border border-outline-variant/20 focus:border-secondary outline-none text-sm"
                value={newJob.role}
                onChange={e => setNewJob({...newJob, role: e.target.value})}
                required
              />
            </div>
            <div className="flex gap-4 items-center">
              <select 
                className="bg-surface p-3 rounded-lg border border-outline-variant/20 focus:border-secondary outline-none text-sm flex-1"
                value={newJob.status}
                onChange={e => setNewJob({...newJob, status: e.target.value})}
              >
                {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button type="submit" className="bg-secondary-fixed text-on-secondary-fixed px-6 py-3 rounded-lg font-bold text-sm">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-on-surface-variant text-sm font-semibold hover:text-primary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full min-w-max pb-4">
            {COLUMNS.map(columnId => {
              const columnJobs = jobs.filter(j => j.status === columnId);
              
              return (
                <div key={columnId} className="w-80 flex flex-col bg-surface-container-lowest/50 rounded-2xl border border-outline-variant/10">
                  <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low rounded-t-2xl">
                    <h3 className="font-bold text-sm tracking-wide">{columnId}</h3>
                    <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded-full font-bold">{columnJobs.length}</span>
                  </div>
                  
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 flex flex-col gap-3 transition-colors ${snapshot.isDraggingOver ? 'bg-secondary-fixed/5' : ''}`}
                        style={{ minHeight: '150px' }}
                      >
                        {columnJobs.map((job, index) => (
                          <Draggable key={job.id} draggableId={job.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-surface p-4 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col gap-3 transition-all ${snapshot.isDragging ? 'shadow-lg border-secondary/50 rotate-1' : 'hover:border-primary/30'}`}
                              >
                                <div>
                                  <h4 className="font-bold text-[15px] leading-tight text-primary flex items-center gap-2">
                                    <Briefcase size={14} className="text-on-surface-variant" /> {job.role}
                                  </h4>
                                  <p className="text-sm font-semibold text-on-surface-variant flex items-center gap-2 mt-1">
                                    <Building2 size={13} /> {job.company}
                                  </p>
                                </div>
                                {job.appliedDate && (
                                  <div className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/70 flex items-center gap-1 border-t border-outline-variant/10 pt-2">
                                    <Calendar size={10} /> {new Date(job.appliedDate).toLocaleDateString()}
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
