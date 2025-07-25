"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
  Users,
  MapPin,
  Clock,
  Download,
  Eye,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface AccessLog {
  id: string;
  event: string;
  created_at: string;
  metadata: any;
  user: {
    full_name: string;
    email: string;
  };
  space: {
    name: string;
    address: string;
  };
}

export default function PartnerLogsPage() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, selectedEvent, selectedSpace, dateRange]);

  const fetchLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: partner } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!partner) return;

      // Get all spaces for this partner
      const { data: spaces } = await supabase
        .from("spaces")
        .select("id")
        .eq("partner_id", partner.id);

      if (!spaces || spaces.length === 0) {
        setLogs([]);
        setLoading(false);
        return;
      }

      const spaceIds = spaces.map(s => s.id);

      // Get access logs for all partner spaces
      const { data, error } = await supabase
        .from("access_logs")
        .select(`
          id,
          event,
          created_at,
          metadata,
          user:profiles!inner(full_name, email),
          space:spaces!inner(name, address)
        `)
        .in("space_id", spaceIds)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(log => ({
        ...log,
        user: Array.isArray(log.user) ? log.user[0] : log.user,
        space: Array.isArray(log.space) ? log.space[0] : log.space,
      }));

      setLogs(transformedData);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load access logs");
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.space?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.space?.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by event type
    if (selectedEvent) {
      filtered = filtered.filter(log => log.event === selectedEvent);
    }

    // Filter by space
    if (selectedSpace) {
      filtered = filtered.filter(log => log.space?.name === selectedSpace);
    }

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter(log => 
        new Date(log.created_at) >= new Date(dateRange.start)
      );
    }

    if (dateRange.end) {
      filtered = filtered.filter(log => 
        new Date(log.created_at) <= new Date(dateRange.end + "T23:59:59")
      );
    }

    setFilteredLogs(filtered);
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case "granted":
      case "unlocked":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "denied":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "requested":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "expired":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case "granted":
      case "unlocked":
        return "🔓";
      case "denied":
        return "❌";
      case "requested":
        return "📋";
      case "expired":
        return "⏰";
      default:
        return "📝";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ["Date", "Event", "User", "Email", "Space", "Address", "Metadata"],
      ...filteredLogs.map(log => [
        formatDate(log.created_at),
        log.event,
        log.user?.full_name || "Unknown",
        log.user?.email || "Unknown",
        log.space?.name || "Unknown",
        log.space?.address || "Unknown",
        JSON.stringify(log.metadata || {})
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Logs exported successfully");
  };

  const getUniqueEvents = () => {
    return [...new Set(logs.map(log => log.event))];
  };

  const getUniqueSpaces = () => {
    return [...new Set(logs.map(log => log.space?.name).filter(Boolean))];
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
            Access Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and analyze access activity across your spaces
          </p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
          <CardDescription>
            Filter logs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Type
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Events</option>
                {getUniqueEvents().map(event => (
                  <option key={event} value={event}>
                    {event.charAt(0).toUpperCase() + event.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Space
              </label>
              <select
                value={selectedSpace}
                onChange={(e) => setSelectedSpace(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Spaces</option>
                {getUniqueSpaces().map(space => (
                  <option key={space} value={space}>
                    {space}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedEvent("");
                  setSelectedSpace("");
                  setDateRange({ start: "", end: "" });
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Access Logs
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <FileText className="h-4 w-4" />
            <span>{filteredLogs.length} logs found</span>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No logs found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || selectedEvent || selectedSpace || dateRange.start || dateRange.end
                  ? "Try adjusting your filters"
                  : "No access activity recorded yet"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">
                        {getEventIcon(log.event)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold">
                            {log.event.charAt(0).toUpperCase() + log.event.slice(1)} Access
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(
                              log.event
                            )}`}
                          >
                            {log.event}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {log.user?.full_name || "Unknown User"} ({log.user?.email || "No email"})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{log.space?.name} - {log.space?.address}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(log.created_at)}</span>
                          </div>
                        </div>

                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Additional Details:</p>
                            <pre className="text-xs text-gray-700 dark:text-gray-300">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
