import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileStack, Info, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AdminPageHeader from "@/features/admin/shell/AdminPageHeader";
import StatCard from "@/features/admin/shell/StatCard";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/lib/apiError";

export default function AdminApplications() {
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAnalytics()
      .then((d) => {
        setTotal(d.trackerJobs);
        setUsers(d.users.total);
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Applications" description="User-tracked job applications" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Applications"
        description="Applications tracked in users' personal CRM (not employer ATS)"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total applications tracked"
          value={total}
          icon={FileStack}
          accent="violet"
        />
        <StatCard
          title="Active users"
          value={users}
          description="May be tracking applications"
          icon={Users}
          accent="blue"
        />
      </div>

      <Card className="border-dashed shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">How applications work</CardTitle>
              <CardDescription className="mt-1">
                JobTrail does not host employer application pipelines. Users track their own
                applications in the personal CRM. External apply links are used on the public job board.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link to="/admin/analytics">View analytics</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
