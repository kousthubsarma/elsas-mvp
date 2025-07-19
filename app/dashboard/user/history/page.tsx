"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Search, 
  Filter,
  Calendar,
  MapPin,
  Clock,
  Download,
  Eye,
  FileText,
  TrendingUp,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface AccessHistory {
  id: string;
  event: string;
  created_at: string;
  metadata: any;
  space: {
    name: string;
    address: string;
    partner: {
      company_name: string;
    };
  };
}

export default function UserHistoryPage() {
  const [history, setHistory] = useState<AccessHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<AccessHistory[]>([]);
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
    fetchHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, searchTerm, selectedEvent, selectedSpace, dateRange]);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("access_logs")
        .select(`
          id,
          event,
          created_at,
          metadata,
          space:spaces!inner(
            name,
            address,
            partner:partners!inner(company_name)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(entry => {
        const space = Array.isArray(entry.space) ? entry.space[0] : entry.space;
        const partner = Array.isArray(space.partner) ? space.partner[0] : space.partner;
        
        return {
          ...entry,
          space: {
            ...space,
            partner,
          },
        };
      });

      setHistory(transformedData);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load access history");
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = history;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.space?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.space?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.space?.partner?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by event type
    if (selectedEvent) {
      filtered = filtered.filter(entry => entry.event === selectedEvent);
    }

    // Filter by space
    if (selectedSpace) {
      filtered = filtered.filter(entry => entry.space?.name === selectedSpace);
    }

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter(entry => 
        new Date(entry.created_at) >= new Date(dateRange.start)
      );
    }

    if (dateRange.end) {
      filtered = filtered.filter(entry => 
        new Date(entry.created_at) <= new Date(dateRange.end + "T23:59:59")
      );
    }

    setFilteredHistory(filtered);
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

  const exportHistory = () => {
    const csvContent = [
      ["Date", "Event", "Space", "Address", "Partner", "Metadata"],
      ...filteredHistory.map(entry => [
        formatDate(entry.created_at),
        entry.event,
        entry.space?.name || "Unknown",
        entry.space?.address || "Unknown",
        entry.space?.partner?.company_name || "Unknown",
        JSON.stringify(entry.metadata || {})
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("History exported successfully");
  };

  const getUniqueEvents = () => {
    return [...new Set(history.map(entry => entry.event))];
  };

  const getUniqueSpaces = () => {
    return [...new Set(history.map(entry => entry.space?.name).filter(Boolean))];
  };

  const getStats = () => {
    const total = history.length;
    const successful = history.filter(entry => 
      entry.event === "granted" || entry.event === "unlocked"
    ).length;
    const denied = history.filter(entry => entry.event === "denied").length;
    const uniqueSpaces = new Set(history.map(entry => entry.space?.name)).size;

    return { total, successful, denied, uniqueSpaces };
  };

  const stats = getStats();

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
            Access History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View your past access events and activity
          </p>
        </div>
        <Button onClick={exportHistory} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
                <p className="text-2xl font-bold">{stats.successful}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Denied</p>
                <p className="text-2xl font-bold">{stats.denied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unique Spaces</p>
                <p className="text-2xl font-bold">{stats.uniqueSpaces}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
          <CardDescription>
            Filter history by various criteria
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
                  placeholder="Search history..."
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
            Access History
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <FileText className="h-4 w-4" />
            <span>{filteredHistory.length} events found</span>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No history found
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
            {filteredHistory.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">
                        {getEventIcon(entry.event)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold">
                            {entry.event.charAt(0).toUpperCase() + entry.event.slice(1)} Access
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(
                              entry.event
                            )}`}
                          >
                            {entry.event}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{entry.space?.name} - {entry.space?.address}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Partner: {entry.space?.partner?.company_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(entry.created_at)}</span>
                          </div>
                        </div>

                        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Additional Details:</p>
                            <pre className="text-xs text-gray-700 dark:text-gray-300">
                              {JSON.stringify(entry.metadata, null, 2)}
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