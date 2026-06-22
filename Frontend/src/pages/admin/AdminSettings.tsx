import { Link } from "react-router-dom";
import { Users, Briefcase, ScrollText, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminPageHeader from "@/features/admin/shell/AdminPageHeader";

const LINKS = [
  {
    to: "/admin/users",
    icon: Users,
    title: "Users",
    description: "Manage job seeker and admin accounts",
  },
  {
    to: "/admin/employers",
    icon: Briefcase,
    title: "Employers",
    description: "Employer accounts and access",
  },
  {
    to: "/admin/audit-logs",
    icon: ScrollText,
    title: "Audit logs",
    description: "Full platform activity history",
  },
];

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="User management, employers, and audit trail"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map(({ to, icon: Icon, title, description }) => (
          <Link key={to} to={to} className="group block">
            <Card className="h-full shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="mt-1">{description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
