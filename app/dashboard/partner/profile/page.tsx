"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Settings,
  Users,
  Activity,
  Globe
} from "lucide-react";
import { toast } from "sonner";

interface PartnerProfile {
  id: string;
  company_name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  created_at: string;
  preferences: {
    notifications: boolean;
    email_alerts: boolean;
    sms_alerts: boolean;
    auto_approve: boolean;
  };
}

export default function PartnerProfilePage() {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    phone: "",
    address: "",
    website: "",
  });
  const [preferences, setPreferences] = useState({
    notifications: true,
    email_alerts: true,
    sms_alerts: false,
    auto_approve: false,
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      setFormData({
        company_name: data.company_name || "",
        phone: data.phone || "",
        address: data.address || "",
        website: data.website || "",
      });
      setPreferences(data.preferences || {
        notifications: true,
        email_alerts: true,
        sms_alerts: false,
        auto_approve: false,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("partners")
        .update({
          company_name: formData.company_name,
          phone: formData.phone,
          address: formData.address,
          website: formData.website,
          preferences,
        })
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setEditing(false);
      fetchProfile();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setFormData({
        company_name: profile.company_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        website: profile.website || "",
      });
      setPreferences(profile.preferences || {
        notifications: true,
        email_alerts: true,
        sms_alerts: false,
        auto_approve: false,
      });
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("partners")
        .update({ logo_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) {
        throw updateError;
      }

      fetchProfile();
      toast.success("Logo updated successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Profile not found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Unable to load your partner profile information
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Partner Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your company information and settings
          </p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
              <CardDescription>
                Your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      type="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter company address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="font-medium">{profile.company_name || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{profile.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{profile.address || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <p className="font-medium">{profile.website || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Partner Since</p>
                      <p className="font-medium">{formatDate(profile.created_at)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Business Preferences</span>
              </CardTitle>
              <CardDescription>
                Manage your notification and access settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Access Notifications</p>
                      <p className="text-sm text-gray-500">Get notified when users access your spaces</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Email Alerts</p>
                      <p className="text-sm text-gray-500">Receive email notifications</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.email_alerts}
                    onChange={(e) => setPreferences({ ...preferences, email_alerts: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">SMS Alerts</p>
                      <p className="text-sm text-gray-500">Receive SMS notifications</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.sms_alerts}
                    onChange={(e) => setPreferences({ ...preferences, sms_alerts: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Auto-approve Access</p>
                      <p className="text-sm text-gray-500">Automatically approve access requests</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.auto_approve}
                    onChange={(e) => setPreferences({ ...preferences, auto_approve: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logo and Stats */}
        <div className="space-y-6">
          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Company Logo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.logo_url} alt={profile.company_name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(profile.company_name || "C")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <Button variant="outline" asChild>
                    <span>
                      <Camera className="h-4 w-4 mr-2" />
                      Change Logo
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Login History
              </Button>
            </CardContent>
          </Card>

          {/* Business Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Business Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spaces</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Access</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue</span>
                <span className="font-medium">$2,450</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 