"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  Building2, 
  QrCode, 
  Smartphone,
  Calendar,
  Users,
  Star
} from "lucide-react";
import { toast } from "sonner";

interface SpaceCardProps {
  space: {
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
  };
  onRequestAccess: (spaceId: string, type: "qr" | "otp") => Promise<void>;
}

export function SpaceCard({ space, onRequestAccess }: SpaceCardProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestType, setRequestType] = useState<"qr" | "otp">("qr");

  const handleRequestAccess = async () => {
    setIsRequesting(true);
    try {
      await onRequestAccess(space.id, requestType);
      toast.success("Access requested successfully!");
    } catch (error) {
      toast.error("Failed to request access");
    } finally {
      setIsRequesting(false);
    }
  };

  const isCurrentlyOpen = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
    const currentTime = now.toLocaleTimeString("en-US", { 
      hour12: false, 
      hour: "2-digit", 
      minute: "2-digit" 
    });

    const openHours = space.open_hours;
    if (openHours && openHours[currentDay]) {
      const { start, end } = openHours[currentDay];
      return currentTime >= start && currentTime <= end;
    }
    return false;
  };

  const getOperatingHours = () => {
    const openHours = space.open_hours;
    if (!openHours) return "24/7";

    const days = Object.keys(openHours);
    if (days.length === 0) return "24/7";

    const firstDay = days[0];
    const { start, end } = openHours[firstDay];
    return `${start} - ${end}`;
  };

  const getStatusColor = () => {
    if (!space.is_active) return "text-red-600 bg-red-100 dark:bg-red-900/20";
    if (isCurrentlyOpen()) return "text-green-600 bg-green-100 dark:bg-green-900/20";
    return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
  };

  const getStatusText = () => {
    if (!space.is_active) return "Inactive";
    if (isCurrentlyOpen()) return "Open";
    return "Closed";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>{space.name}</span>
            </CardTitle>
            <CardDescription className="mt-2">
              {space.description || "Secure digital access space"}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Space Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{space.address}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Building2 className="h-4 w-4" />
            <span>{space.partner.company_name}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Hours: {getOperatingHours()}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Max duration: {space.max_duration_minutes} minutes</span>
          </div>
        </div>

        {/* Access Type Selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Access Method:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRequestType("qr")}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                requestType === "qr"
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"
              }`}
            >
              <QrCode className="h-5 w-5 mx-auto mb-2" />
              QR Code
            </button>
            <button
              onClick={() => setRequestType("otp")}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                requestType === "otp"
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"
              }`}
            >
              <Smartphone className="h-5 w-5 mx-auto mb-2" />
              OTP
            </button>
          </div>
        </div>

        {/* Request Access Button */}
        <Button
          onClick={handleRequestAccess}
          disabled={!space.is_active || isRequesting}
          className="w-full"
        >
          {isRequesting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Requesting...
            </>
          ) : (
            <>
              <QrCode className="h-4 w-4 mr-2" />
              Request Access
            </>
          )}
        </Button>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>Verified users only</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3" />
            <span>Secure access</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
