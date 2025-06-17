
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JobsTable, { type Job } from './Jobs/JobsTable';
import JobsFilter from './Jobs/JobsFilter';
import JobCard from '@/components/ui/JobCard';
import { useJobs } from '@/hooks/JobContext';
// import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

const Jobs: React.FC = () => {
  const { jobs, deleteJob } = useJobs();
  const navigate = useNavigate();
  // const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(isMobile ? 'grid' : 'table');
  
  useEffect(() => {
    let result = [...jobs];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (job) => 
          job.title.toLowerCase().includes(searchLower) || 
          job.company.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter((job) => job.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter) {
      result = result.filter((job) => job.priority === priorityFilter);
    }
    
    setFilteredJobs(result);
  }, [jobs, searchTerm, statusFilter, priorityFilter]);
  
  const handleEdit = (id: string) => {
    navigate(`/edit-job/${id}`);
  };
  
  const handleDelete = (id: string) => {
    deleteJob(id);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Manage your job applications and track their status
          </p>
        </div>
        <Button 
          onClick={() => navigate('/add-job')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Job
        </Button>
      </div>
      
      <JobsFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
      />
      
      <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'grid')}>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="table" className="mt-6">
          {filteredJobs.length > 0 ? (
            <JobsTable 
              jobs={filteredJobs}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className="text-center py-10 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">No jobs found matching your filters.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="grid" className="mt-6">
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  date={job.date}
                  status={job.status}
                  priority={job.priority}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">No jobs found matching your filters.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Jobs;