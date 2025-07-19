"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CameraFeed } from "@/components/camera/camera-feed";
import { 
  Camera, 
  Eye, 
  Activity,
  AlertTriangle,
  Users,
  Clock,
  RefreshCw,
  Grid,
  List,
  MapPin
} from "lucide-react";
import { toast } from "sonner";

interface Space {
  id: string;
  name: string;
  address: string;
  camera_url?: string;
  is_active: boolean;
  current_occupants?: number;
  last_activity?: string;
}

export default function PartnerMonitoringPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSpaces();
    // Set up real-time subscription for space updates
    const channel = supabase
      .channel('space_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'spaces' },
        () => {
          fetchSpaces();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSpaces = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: partner } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!partner) return;

      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .eq("partner_id", partner.id)
        .eq("is_active", true)
        .order("name");

      if (error) {
        throw error;
      }

      // Add mock data for demonstration
      const spacesWithMockData = (data || []).map(space => ({
        ...space,
        current_occupants: Math.floor(Math.random() * 3),
        last_activity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      }));

      setSpaces(spacesWithMockData);
    } catch (error) {
      console.error("Error fetching spaces:", error);
      toast.error("Failed to load spaces");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSpaces();
    toast.success("Monitoring data refreshed");
  };

  const formatLastActivity = (dateString: string) => {
    const now = new Date();
    const activity = new Date(dateString);
    const diffMs = now.getTime() - activity.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} hours ago`;
    }
  };

  const getActivityStatus = (dateString: string) => {
    const now = new Date();
    const activity = new Date(dateString);
    const diffMs = now.getTime() - activity.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 5) {
      return "text-green-600";
    } else if (diffMins < 30) {
      return "text-yellow-600";
    } else {
      return "text-red-600";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Space Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time monitoring and camera feeds for your spaces
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Cameras</p>
                <p className="text-2xl font-bold">{spaces.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Occupants</p>
                <p className="text-2xl font-bold">
                  {spaces.reduce((sum, space) => sum + (space.current_occupants || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recent Activity</p>
                <p className="text-2xl font-bold">
                  {spaces.filter(space => {
                    if (!space.last_activity) return false;
                    const diffMs = new Date().getTime() - new Date(space.last_activity).getTime();
                    return diffMs < 300000; // 5 minutes
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alerts</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Feeds */}
      {spaces.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No active spaces to monitor
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add spaces with camera feeds to start monitoring
            </p>
            <Button onClick={() => window.location.href = "/dashboard/partner/spaces"}>
              Manage Spaces
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-6"}>
          {spaces.map((space) => (
            <div key={space.id} className="space-y-4">
              <CameraFeed
                cameraUrl={space.camera_url}
                spaceName={space.name}
                isLive={true}
                onRefresh={fetchSpaces}
              />
              
              {/* Space Status */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{space.name}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Online
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{space.current_occupants || 0} occupants</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{space.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className={getActivityStatus(space.last_activity || "")}>
                        {space.last_activity ? formatLastActivity(space.last_activity) : "No activity"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>Motion detected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common monitoring tasks and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              View All Alerts
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Occupancy Report
            </Button>
            <Button variant="outline" className="justify-start">
              <Activity className="h-4 w-4 mr-2" />
              Activity Timeline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 