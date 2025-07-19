"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  FileText, 
  BarChart3, 
  Settings, 
  Plus,
  Users,
  Clock,
  TrendingUp,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Space {
  id: string;
  name: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

interface AccessLog {
  id: string;
  event: string;
  created_at: string;
  user: {
    full_name: string;
    email: string;
  };
  space: {
    name: string;
  };
}

interface PartnerStats {
  totalSpaces: number;
  activeSpaces: number;
  totalAccesses: number;
  recentAccesses: number;
}

export default function PartnerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [recentLogs, setRecentLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState<PartnerStats>({
    totalSpaces: 0,
    activeSpaces: 0,
    totalAccesses: 0,
    recentAccesses: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUser(user);

        // Get partner info
        const { data: partner } = await supabase
          .from("partners")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!partner) return;

        // Fetch spaces
        const { data: spacesData } = await supabase
          .from("spaces")
          .select("*")
          .eq("partner_id", partner.id)
          .order("created_at", { ascending: false });

        if (spacesData) {
          setSpaces(spacesData);
        }

        // Get space IDs for access logs query
        const spaceIds = spacesData?.map(space => space.id) || [];

        // Fetch recent access logs
        const { data: logsData } = await supabase
          .from("access_logs")
          .select(`
            id,
            event,
            created_at,
            user:profiles!inner(full_name, email),
            space:spaces!inner(name)
          `)
          .in("space_id", spaceIds)
          .order("created_at", { ascending: false })
          .limit(10);

        if (logsData) {
          // Transform the data to match our interface
          const transformedData = logsData.map(log => ({
            ...log,
            user: Array.isArray(log.user) ? log.user[0] : log.user,
            space: Array.isArray(log.space) ? log.space[0] : log.space,
          }));
          setRecentLogs(transformedData);
        }

        // Calculate stats
        const activeSpaces = spacesData?.filter(s => s.is_active).length || 0;
        const totalAccesses = logsData?.length || 0;
        const recentAccesses = logsData?.filter(log => {
          const logDate = new Date(log.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return logDate > weekAgo;
        }).length || 0;

        setStats({
          totalSpaces: spacesData?.length || 0,
          activeSpaces,
          totalAccesses,
          recentAccesses,
        });

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

  const getEventColor = (event: string) => {
    switch (event) {
      case "granted":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "denied":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "unlocked":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
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
          Partner Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your spaces and monitor access activity.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSpaces}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Spaces</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeSpaces}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Spaces</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalAccesses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Accesses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.recentAccesses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/partner/spaces">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Spaces</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add and configure spaces
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/partner/logs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Access Logs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View detailed logs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/partner/analytics">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View insights and reports
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Spaces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>My Spaces</span>
              </div>
              <Link href="/dashboard/partner/spaces">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Space
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>
              Your registered spaces and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {spaces.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No spaces registered yet
                </p>
                <Link href="/dashboard/partner/spaces">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Space
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {spaces.slice(0, 5).map((space) => (
                  <div
                    key={space.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{space.name}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            space.is_active
                              ? "text-green-600 bg-green-100 dark:bg-green-900/20"
                              : "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
                          }`}
                        >
                          {space.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {space.address}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Added: {formatDate(space.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {spaces.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/dashboard/partner/spaces">
                      <Button variant="outline" size="sm">
                        View All Spaces ({spaces.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Access Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Access Activity</span>
            </CardTitle>
            <CardDescription>
              Latest access events across your spaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No recent access activity
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium">
                          {log.user?.full_name || log.user?.email || "Unknown User"}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(
                            log.event
                          )}`}
                        >
                          {log.event}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {log.space.name} • {formatDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
