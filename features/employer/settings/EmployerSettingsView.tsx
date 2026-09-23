"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/hooks/AuthContext";

/**
 * Local-only settings — nothing here is persisted or sent to a server, same
 * approach as the rest of the employer dashboard preview. Password changes
 * stay a placeholder rather than reaching into the real auth flow.
 */
export default function EmployerSettingsView() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [notifyApplicants, setNotifyApplicants] = useState(true);
  const [notifyJobExpiry, setNotifyJobExpiry] = useState(true);
  const [notifyProductUpdates, setNotifyProductUpdates] = useState(false);

  const saveProfile = () => toast.success("Profile updated (this preview doesn't persist changes).");
  const changePasswordNotReady = () =>
    toast.info("Password changes aren't available yet in this preview.");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <Link
          href="/employer/dashboard"
          className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Dashboard
        </Link>
        <h1 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Settings
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Profile</CardTitle>
          <CardDescription>Your name and email as shown to candidates and admins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="employer-name">Name</Label>
              <Input id="employer-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employer-email">Email</Label>
              <Input
                id="employer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
              label: "New applicants",
              description: "When a candidate applies to one of your postings",
              checked: notifyApplicants,
              onChange: setNotifyApplicants,
            },
            {
              label: "Job posting expiry",
              description: "Reminders before a published posting closes",
              checked: notifyJobExpiry,
              onChange: setNotifyJobExpiry,
            },
            {
              label: "Product updates",
              description: "News about new JobTrail employer features",
              checked: notifyProductUpdates,
              onChange: setNotifyProductUpdates,
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
          <CardDescription>Change your account password.</CardDescription>
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
