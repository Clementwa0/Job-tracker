
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageLayout from '../components/layouts/PageLayout';
import { useJobs, JobStatus, Interview } from '../context/JobsContext';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';
import { Edit, Trash2, Plus, X } from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, updateJob, deleteJob, isLoading, addInterview } = useJobs();
  
  const job = getJobById(id || '');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState(job);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Interview state
  const [isAddingInterview, setIsAddingInterview] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);
  const [interviewForm, setInterviewForm] = useState<{
    date: string;
    time: string;
    type: 'phone' | 'video' | 'in-person' | 'other';
    notes: string;
  }>({
    date: '',
    time: '',
    type: 'video',
    notes: '',
  });
  
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }
  
  if (!job) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Job not found</h2>
          <p className="mt-2 text-gray-600">The job you are looking for does not exist or has been removed.</p>
          <Link to="/jobs" className="mt-6 inline-block text-primary hover:underline">
            Back to Jobs
          </Link>
        </div>
      </PageLayout>
    );
  }
  
  const handleEditToggle = () => {
    if (isEditing) {
      // If we're currently editing, save changes
      setIsEditing(false);
      updateJob(editedJob!);
    } else {
      // Start editing
      setEditedJob(job);
      setIsEditing(true);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedJob(prev => ({ ...prev!, [name]: value }));
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteJob(job.id);
      navigate('/jobs');
    } catch (error) {
      console.error('Error deleting job:', error);
      setIsDeleting(false);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Interview handlers
  const handleInterviewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInterviewForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddInterviewToggle = () => {
    setIsAddingInterview(!isAddingInterview);
    setEditingInterviewId(null);
    setInterviewForm({
      date: '',
      time: '',
      type: 'video',
      notes: '',
    });
  };
  
  const handleEditInterviewToggle = (interview: Interview) => {
    if (editingInterviewId === interview.id) {
      // Cancel editing
      setEditingInterviewId(null);
    } else {
      // Start editing this interview
      setEditingInterviewId(interview.id);
      setIsAddingInterview(false);
      setInterviewForm({
        date: interview.date,
        time: interview.time,
        type: interview.type,
        notes: interview.notes,
      });
    }
  };
  
  const handleSaveInterview = async () => {
    if (!interviewForm.date || !interviewForm.time) return;
    
    try {
      if (editingInterviewId) {
        // Update existing interview
        const updatedInterviews = job.interviews?.map(interview => 
          interview.id === editingInterviewId 
            ? { ...interview, ...interviewForm }
            : interview
        ) || [];
        
        await updateJob({
          ...job,
          interviews: updatedInterviews,
        });
        
        setEditingInterviewId(null);
      } else {
        // Add new interview
        await addInterview(job.id, interviewForm);
        setIsAddingInterview(false);
      }
      
      // Reset form
      setInterviewForm({
        date: '',
        time: '',
        type: 'video',
        notes: '',
      });
    } catch (error) {
      console.error('Error saving interview:', error);
    }
  };
  
  const handleDeleteInterview = async (interviewId: string) => {
    try {
      const updatedInterviews = job.interviews?.filter(
        interview => interview.id !== interviewId
      ) || [];
      
      await updateJob({
        ...job,
        interviews: updatedInterviews,
      });
    } catch (error) {
      console.error('Error deleting interview:', error);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <Link 
              to="/jobs"
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Jobs
            </Link>
          </div>
          <div className="flex space-x-3 mt-3 sm:mt-0">
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {isEditing ? 'Save Changes' : 'Edit Job'}
            </button>
            <button
              onClick={() => handleDelete()}
              disabled={isDeleting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Job'}
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden border border-border">
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-200">
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editedJob?.title}
                onChange={handleChange}
                className="text-xl font-bold w-full border-gray-300 rounded-md focus:border-primary focus:ring-primary"
              />
            ) : (
              <h1 className="text-xl font-bold">{job.title}</h1>
            )}
            
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="company"
                    value={editedJob?.company}
                    onChange={handleChange}
                    className="w-full sm:w-auto border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  />
                  <span>•</span>
                  <input
                    type="text"
                    name="location"
                    value={editedJob?.location}
                    onChange={handleChange}
                    className="w-full sm:w-auto border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  />
                </>
              ) : (
                <>
                  <span>{job.company}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{job.location}</span>
                </>
              )}
            </div>
          </div>

          {/* Content Sections */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content - Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Status */}
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Status</h2>
                {isEditing ? (
                  <select
                    name="status"
                    value={editedJob?.status}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>
                ) : (
                  <StatusBadge status={job.status} />
                )}
              </div>
              
              {/* Description */}
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Job Description</h2>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={editedJob?.description}
                    onChange={handleChange}
                    rows={6}
                    className="block w-full border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  />
                ) : (
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {job.description || 'No description provided.'}
                  </div>
                )}
              </div>
              
              {/* Notes */}
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Notes</h2>
                {isEditing ? (
                  <textarea
                    name="notes"
                    value={editedJob?.notes}
                    onChange={handleChange}
                    rows={4}
                    className="block w-full border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  />
                ) : (
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {job.notes || 'No notes added.'}
                  </div>
                )}
              </div>
              
              {/* Interviews */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-medium text-gray-500">Interviews</h2>
                  <button 
                    onClick={handleAddInterviewToggle}
                    className="text-sm text-primary flex items-center font-medium"
                  >
                    {isAddingInterview ? (
                      <>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" /> Add Interview
                      </>
                    )}
                  </button>
                </div>
                
                {/* Add/Edit Interview Form */}
                {(isAddingInterview || editingInterviewId) && (
                  <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <h3 className="text-sm font-medium mb-3">
                      {editingInterviewId ? 'Edit Interview' : 'Add Interview'}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={interviewForm.date}
                          onChange={handleInterviewFormChange}
                          className="w-full border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Time
                        </label>
                        <input
                          type="time"
                          name="time"
                          value={interviewForm.time}
                          onChange={handleInterviewFormChange}
                          className="w-full border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Type
                        </label>
                        <select
                          name="type"
                          value={interviewForm.type}
                          onChange={handleInterviewFormChange}
                          className="w-full border-gray-300 rounded-md text-sm"
                        >
                          <option value="phone">Phone</option>
                          <option value="video">Video</option>
                          <option value="in-person">In-Person</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          value={interviewForm.notes}
                          onChange={handleInterviewFormChange}
                          rows={2}
                          className="w-full border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={handleSaveInterview}
                        className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
                      >
                        {editingInterviewId ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Interview List */}
                {job.interviews && job.interviews.length > 0 ? (
                  <div className="space-y-3">
                    {job.interviews.map((interview) => (
                      <div key={interview.id} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {formatDate(interview.date)} at {interview.time}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {interview.type}
                            </div>
                            <p className="text-sm mt-1">{interview.notes}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditInterviewToggle(interview)}
                              className="text-gray-400 hover:text-primary p-1"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteInterview(interview.id)}
                              className="text-gray-400 hover:text-destructive p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No interviews scheduled.</p>
                )}
              </div>
            </div>
            
            {/* Sidebar - Right Column */}
            <div className="space-y-6">
              {/* Job URL */}
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Job URL</h2>
                {isEditing ? (
                  <input
                    type="url"
                    name="url"
                    value={editedJob?.url}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  />
                ) : (
                  <div className="text-sm">
                    {job.url ? (
                      <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Job Listing
                      </a>
                    ) : (
                      <span className="text-gray-500">No URL provided</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Salary */}
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Salary</h2>
                {isEditing ? (
                  <input
                    type="text"
                    name="salary"
                    value={editedJob?.salary}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  />
                ) : (
                  <div className="text-sm text-gray-700">
                    {job.salary || 'Not specified'}
                  </div>
                )}
              </div>
              
              {/* Contact */}
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Contact</h2>
                {isEditing ? (
                  <input
                    type="text"
                    name="contact"
                    value={editedJob?.contact}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  />
                ) : (
                  <div className="text-sm text-gray-700">
                    {job.contact || 'No contact information'}
                  </div>
                )}
              </div>
              
              {/* Date Applied */}
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Date Applied</h2>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateApplied"
                    value={editedJob?.dateApplied || ''}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md focus:border-primary focus:ring-primary"
                  />
                ) : (
                  <div className="text-sm text-gray-700">
                    {job.dateApplied ? formatDate(job.dateApplied) : 'Not applied yet'}
                  </div>
                )}
              </div>
              
              {/* Metadata */}
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Metadata</h2>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Created: {formatDate(job.dateCreated)}</div>
                  <div>Last Modified: {formatDate(job.dateModified)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default JobDetail;
