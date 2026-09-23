"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import AdminPageHeader from "@/features/admin/shell/PageHeader";
import { useAuth } from "@/features/auth/hooks/AuthContext";

/**
 * Local-only settings — nothing here is persisted or sent to a server.
 * The account's real password change already has a working endpoint
 * (features/admin/services/adminAuthService.ts), but wiring it up here is a
 * real account mutation outside this preview's dummy-data scope, so that
 * section stays a placeholder like the rest of this build.
 */
export default function AdminSettingsView() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [notifyModeration, setNotifyModeration] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(true);
  const [notifySecurity, setNotifySecurity] = useState(true);

  const saveProfile = () => toast.success("Profile updated (this preview doesn't persist changes).");
  const changePasswordNotReady = () =>
    toast.info("Password changes aren't available yet in this preview.");

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" description="Update your admin account settings." />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Profile</CardTitle>
          <CardDescription>Your name and email as shown across the admin console.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Name</Label>
              <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Button size="sm" onClick={saveProfile}>
            Save changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
          <CardDescription>Choose what you want to be notified about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            {
              label: "Moderation queue",
              description: "New jobs or companies awaiting review",
              checked: notifyModeration,
              onChange: setNotifyModeration,
            },
            {
              label: "Weekly digest",
              description: "A summary of platform activity every week",
              checked: notifyWeeklyDigest,
              onChange: setNotifyWeeklyDigest,
            },
            {
              label: "Security alerts",
              description: "Suspicious sign-ins or account changes",
              checked: notifySecurity,
              onChange: setNotifySecurity,
            },
          ].map((row, i, arr) => (
            <div key={row.label}>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.description}</p>
                </div>
                <Switch checked={row.checked} onCheckedChange={row.onChange} />
              </div>
              {i < arr.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Password</CardTitle>
          <CardDescription>Change your admin account password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={changePasswordNotReady}>
            Update password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
