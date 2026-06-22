import AdminUserList from "@/features/admin/AdminUserList";
import AdminPageHeader from "@/features/admin/shell/AdminPageHeader";

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Users" description="Manage accounts, roles, and access" />
      <AdminUserList showRoleFilter />
    </div>
  );
}
