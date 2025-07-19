"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  QrCode, 
  MapPin, 
  Clock, 
  Building2, 
  Plus,
  Calendar,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AccessCode {
  id: string;
  code: string;
  type: "qr" | "otp";
  expires_at: string;
  status: "pending" | "active" | "used" | "expired";
  space: {
    name: string;
    address: string;
  };
}

interface RecentActivity {
  id: string;
  event: string;
  created_at: string;
  space: {
    name: string;
  };
}

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeAccessCodes, setActiveAccessCodes] = useState<AccessCode[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUser(user);

        // Fetch active access codes
        const { data: accessCodes } = await supabase
          .from("access_codes")
          .select(`
            id,
            code,
            type,
            expires_at,
            status,
            space:spaces(name, address)
          `)
          .eq("user_id", user.id)
          .in("status", ["pending", "active"])
          .order("created_at", { ascending: false })
          .limit(5);

        if (accessCodes) {
          // Transform the data to match our interface
          const transformedCodes = accessCodes.map(code => ({
            ...code,
            space: Array.isArray(code.space) ? code.space[0] : code.space,
          }));
          setActiveAccessCodes(transformedCodes);
        }

        // Fetch recent activity
        const { data: activity } = await supabase
          .from("access_logs")
          .select(`
            id,
            event,
            created_at,
            space:spaces!inner(name)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (activity) {
          // Transform the data to match our interface
          const transformedActivity = activity.map(entry => ({
            ...entry,
            space: Array.isArray(entry.space) ? entry.space[0] : entry.space,
          }));
          setRecentActivity(transformedActivity);
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.user_metadata?.full_name || "User"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's what's happening with your spaces today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/user/spaces">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Find Spaces</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Discover available spaces
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/user/access">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <QrCode className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">My Access</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View active codes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/user/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Profile</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your account
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Access Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Active Access Codes</span>
            </CardTitle>
            <CardDescription>
              Your current access codes and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeAccessCodes.length === 0 ? (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No active access codes
                </p>
                <Link href="/dashboard/user/spaces">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Access
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeAccessCodes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{code.space.name}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            code.status
                          )}`}
                        >
                          {code.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {code.space.address}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {formatDate(code.expires_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {code.type === "qr" ? "QR Code" : code.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest access events and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No recent activity
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.event.charAt(0).toUpperCase() + activity.event.slice(1)} access
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activity.space.name} • {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>This Month</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activeAccessCodes.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Codes
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {recentActivity.filter(a => a.event === "granted").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Successful Accesses
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {recentActivity.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Activities
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
