import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, MapPin, Briefcase, Camera, Save, X } from "lucide-react";

const Profile: React.FC = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: "", text: "" });

  // Form states
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    location: "",
    phone: "",
    avatarUrl: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [notificationSettings, setNotificationSettings] = useState({
    jobUpdates: true,
    interviewReminders: true,
    weeklySummary: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        jobTitle: user.jobTitle || "",
        location: user.location || "",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || ""
      });

      setNotificationSettings({
        jobUpdates: user.notifications?.jobUpdates ?? true,
        interviewReminders: user.notifications?.interviewReminders ?? true,
        weeklySummary: user.notifications?.weeklySummary ?? false
      });

      setSecuritySettings({
        twoFactorEnabled: user.security?.twoFactorEnabled ?? false
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSecurityChange = (name: string, checked: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      await updateProfile(profileData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setIsSubmitting(false);
      return;
    }

    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update password" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        jobTitle: user.jobTitle || "",
        location: user.location || "",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || ""
      });
    }
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile header */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
        <div className="flex-shrink-0 relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage src={profileData.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          {isEditing && (
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer">
              <Camera className="h-4 w-4 text-gray-700" />
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => console.log("File selected:", e.target.files?.[0])}
              />
            </label>
          )}
        </div>
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600 flex items-center mt-1"><Mail className="h-4 w-4 mr-2" />{user.email}</p>
          {user.jobTitle && <p className="text-gray-600 flex items-center mt-1"><Briefcase className="h-4 w-4 mr-2" />{user.jobTitle}</p>}
          {user.location && <p className="text-gray-600 flex items-center mt-1"><MapPin className="h-4 w-4 mr-2" />{user.location}</p>}
          <p className="text-sm text-gray-500 mt-3">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 dark:bg-gray-900">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" value={profileData.name} onChange={handleProfileChange} disabled={!isEditing} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" value={profileData.email} onChange={handleProfileChange} disabled={!isEditing} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" name="jobTitle" value={profileData.jobTitle} onChange={handleProfileChange} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" value={profileData.location} onChange={handleProfileChange} disabled={!isEditing} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" value={profileData.phone} onChange={handleProfileChange} disabled={!isEditing} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button type="button" variant="outline" onClick={handleCancelEdit}><X className="h-4 w-4 mr-2" /> Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}><Save className="h-4 w-4 mr-2" /> {isSubmitting ? "Saving..." : "Save Changes"}</Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure.</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update Password"}</Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Requires code from your authenticator app.</p>
                  </div>
                  <Switch id="twoFactor" checked={securitySettings.twoFactorEnabled} onCheckedChange={(checked) => handleSecurityChange("twoFactorEnabled", checked)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="jobUpdates">Job Updates</Label>
                  <p className="text-sm text-gray-500">Notify about job application updates.</p>
                </div>
                <Switch id="jobUpdates" checked={notificationSettings.jobUpdates} onCheckedChange={(checked) => handleNotificationChange("jobUpdates", checked)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="interviewReminders">Interview Reminders</Label>
                  <p className="text-sm text-gray-500">Receive reminders for interviews.</p>
                </div>
                <Switch id="interviewReminders" checked={notificationSettings.interviewReminders} onCheckedChange={(checked) => handleNotificationChange("interviewReminders", checked)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weeklySummary">Weekly Summary</Label>
                  <p className="text-sm text-gray-500">Weekly summary of job search activity.</p>
                </div>
                <Switch id="weeklySummary" checked={notificationSettings.weeklySummary} onCheckedChange={(checked) => handleNotificationChange("weeklySummary", checked)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
