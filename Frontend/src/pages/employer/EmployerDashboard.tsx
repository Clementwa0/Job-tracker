import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Eye, FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PostingStatusBadge from "@/features/employer/PostingStatusBadge";
import { employerService } from "@/services/employerService";
import type { EmployerDashboardData } from "@/types/employer";
import { getApiErrorMessage } from "@/lib/apiError";
import { useAuth } from "@/hooks/AuthContext";

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function EmployerDashboard() {
  const { refresh } = useAuth();
  const [data, setData] = useState<EmployerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
    industry: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      const dashboard = await employerService.getDashboard();
      setData(dashboard);
    } catch (err) {
      toast.error("Failed to load dashboard", { description: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.name.trim()) {
      toast.error("Company name is required");
      return;
    }
    try {
      setCreatingCompany(true);
      await employerService.createCompany(companyForm);
      await refresh();
      toast.success("Company profile created");
      await load();
    } catch (err) {
      toast.error("Could not create company", { description: getApiErrorMessage(err) });
    } finally {
      setCreatingCompany(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.hasCompany) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold">Set up your company</h1>
        <p className="mt-2 text-muted-foreground">
          Create a company profile before posting jobs to the public board.
        </p>
        <form onSubmit={handleCreateCompany} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company name *</Label>
            <Input
              id="name"
              value={companyForm.name}
              onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={companyForm.industry}
              onChange={(e) => setCompanyForm((f) => ({ ...f, industry: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={companyForm.location}
              onChange={(e) => setCompanyForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={companyForm.website}
              onChange={(e) => setCompanyForm((f) => ({ ...f, website: e.target.value }))}
              placeholder="https://company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={companyForm.description}
              onChange={(e) => setCompanyForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={creatingCompany}>
            {creatingCompany && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create company
          </Button>
        </form>
      </div>
    );
  }

  const { stats, company, recentPostings } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employer dashboard</h1>
          <p className="text-muted-foreground">{company?.name}</p>
          {company?.status !== "approved" && (
            <p className="mt-1 text-sm text-amber-600">
              Company status: {company?.status} — publishing may be restricted until approved.
            </p>
          )}
        </div>
        <Button asChild>
          <Link to="/employer/jobs/create">
            <Plus className="mr-2 h-4 w-4" />
            New job posting
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total jobs" value={stats.totalJobs} icon={Briefcase} />
        <StatCard label="Published" value={stats.published} icon={FileText} />
        <StatCard label="Drafts" value={stats.drafts} icon={FileText} />
        <StatCard label="Pending review" value={stats.pendingReview} icon={FileText} />
        <StatCard label="Closed" value={stats.closed} icon={FileText} />
        <StatCard label="Total views" value={stats.totalViews} icon={Eye} />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent postings</h2>
          <Link to="/employer/jobs" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {recentPostings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No job postings yet.</p>
        ) : (
          <div className="space-y-2">
            {recentPostings.map((job) => (
              <Link
                key={job.id}
                to={`/employer/jobs/edit/${job.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition hover:border-primary/30"
              >
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.viewCount} views</p>
                </div>
                <PostingStatusBadge status={job.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
