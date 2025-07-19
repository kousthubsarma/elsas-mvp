"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SpaceCard } from "@/components/spaces/space-card";
import { 
  Search, 
  MapPin, 
  Filter,
  Building2,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Space {
  id: string;
  name: string;
  description?: string;
  address: string;
  is_active: boolean;
  open_hours: any;
  max_duration_minutes: number;
  partner: {
    company_name: string;
  };
}

export default function UserSpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSpaces();
  }, []);

  useEffect(() => {
    filterSpaces();
  }, [spaces, searchTerm, location]);

  const fetchSpaces = async () => {
    try {
      const { data, error } = await supabase
        .from("spaces")
        .select(`
          id,
          name,
          description,
          address,
          is_active,
          open_hours,
          max_duration_minutes,
          partner:partners!inner(company_name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(space => ({
        ...space,
        partner: Array.isArray(space.partner) ? space.partner[0] : space.partner,
      }));

      setSpaces(transformedData);
    } catch (error) {
      console.error("Error fetching spaces:", error);
      toast.error("Failed to load spaces");
    } finally {
      setLoading(false);
    }
  };

  const filterSpaces = () => {
    let filtered = spaces;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(space =>
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.partner.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by location
    if (location) {
      filtered = filtered.filter(space =>
        space.address.toLowerCase().includes(location.toLowerCase())
      );
    }

    setFilteredSpaces(filtered);
  };

  const handleRequestAccess = async (spaceId: string, type: "qr" | "otp") => {
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          space_id: spaceId,
          type,
          duration_minutes: 60,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to request access");
      }

      const result = await response.json();
      
      // Redirect to access page with the generated code
      window.location.href = `/dashboard/user/access?code=${result.access_code.id}`;
      
    } catch (error) {
      console.error("Error requesting access:", error);
      throw error;
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would reverse geocode this
          // For now, we'll just show a success message
          toast.success("Location detected");
        },
        (error) => {
          toast.error("Failed to get location");
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading spaces...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Find Spaces
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Discover and access available spaces near you
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Spaces</span>
          </CardTitle>
          <CardDescription>
            Find spaces by name, description, or partner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search spaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                onClick={getCurrentLocation}
                variant="outline"
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Use My Location
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Available Spaces
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Building2 className="h-4 w-4" />
            <span>{filteredSpaces.length} spaces found</span>
          </div>
        </div>

        {filteredSpaces.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No spaces found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || location 
                  ? "Try adjusting your search criteria"
                  : "No spaces are currently available"
                }
              </p>
              {(searchTerm || location) && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setLocation("");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onRequestAccess={handleRequestAccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
