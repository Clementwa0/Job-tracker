import AdminUserList from "@/features/admin/AdminUserList";
import AdminPageHeader from "@/features/admin/shell/AdminPageHeader";

export default function AdminEmployers() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Employers" description="Manage employer accounts and access" />
      <AdminUserList fixedRole="employer" showRoleFilter={false} />
    </div>
  );
}
