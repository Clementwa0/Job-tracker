import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Eye, FileStack, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AdminPageHeader from "@/features/admin/shell/AdminPageHeader";
import StatCard from "@/features/admin/shell/StatCard";
import { adminService } from "@/services/adminService";
import type { AdminAnalytics } from "@/types/admin";
import { getApiErrorMessage } from "@/lib/apiError";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAnalytics()
      .then(setData)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Dashboard" description="Platform overview at a glance" />
        <DashboardSkeleton />
      </div>
    );
  }

  if (!data) return null;

  const activeJobs = data.jobPostings.byStatus?.published || 0;
  const pending = data.jobPostings.pendingReview + (data.companies.pending || 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Platform overview at a glance"
        actions={
          pending > 0 ? (
            <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
              {pending} need review
            </Badge>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total jobs"
          value={data.jobPostings.total}
          icon={Briefcase}
          accent="blue"
        />
        <StatCard
          title="Active jobs"
          value={activeJobs}
          description="Published on the board"
          icon={Sparkles}
          accent="green"
        />
        <StatCard
          title="Applications tracked"
          value={data.trackerJobs}
          description="User CRM entries"
          icon={FileStack}
          accent="violet"
        />
        <StatCard
          title="Total views"
          value={data.jobPostings.totalViews}
          icon={Eye}
          accent="amber"
        />
      </div>

      {(data.jobPostings.pendingReview > 0 || data.companies.pending > 0) && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Needs attention</CardTitle>
            <CardDescription>Items waiting for admin review</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {data.jobPostings.pendingReview > 0 && (
                <li>{data.jobPostings.pendingReview} job(s) pending review</li>
              )}
              {data.companies.pending > 0 && (
                <li>{data.companies.pending} company(ies) pending approval</li>
              )}
            </ul>
            <div className="flex flex-col gap-2 sm:flex-row">
              {data.jobPostings.pendingReview > 0 && (
                <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                  <Link to="/admin/jobs?status=pending_review">Review jobs</Link>
                </Button>
              )}
              {data.companies.pending > 0 && (
                <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                  <Link to="/admin/companies?status=pending">Review companies</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Latest admin actions</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/audit-logs">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {data.recentAuditLogs.length === 0 ? (
            <p className="px-6 pb-4 text-sm text-muted-foreground">No audit logs yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead className="hidden sm:table-cell">Target</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentAuditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.action}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {log.targetType} · {log.targetId.slice(-8)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
