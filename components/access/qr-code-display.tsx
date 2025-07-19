"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Share2, 
  Copy, 
  Clock, 
  MapPin,
  Building2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  accessCode: string;
  spaceName: string;
  spaceAddress: string;
  partnerName: string;
  expiresAt: string;
  onRefresh?: () => void;
}

export function QRCodeDisplay({
  qrCodeUrl,
  accessCode,
  spaceName,
  spaceAddress,
  partnerName,
  expiresAt,
  onRefresh,
}: QRCodeDisplayProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr-code-${spaceName.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Access Code for ${spaceName}`,
          text: `Use this QR code to access ${spaceName} at ${spaceAddress}`,
          url: window.location.href,
        });
        toast.success("Shared successfully");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback to copying to clipboard
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accessCode);
      toast.success("Access code copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy access code");
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success("QR code refreshed");
    } catch (error) {
      toast.error("Failed to refresh QR code");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatExpiryTime = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins <= 0) {
      return "Expired";
    } else if (diffMins < 60) {
      return `${diffMins} minutes`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      return `${diffHours}h ${remainingMins}m`;
    }
  };

  const isExpired = new Date(expiresAt) <= new Date();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span>{spaceName}</span>
        </CardTitle>
        <CardDescription>
          Scan this QR code to access the space
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-48 h-48 border-4 border-gray-200 rounded-lg"
            />
            {isExpired && (
              <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-red-700 font-bold text-lg">EXPIRED</span>
              </div>
            )}
          </div>
        </div>

        {/* Space Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Building2 className="h-4 w-4" />
            <span>{partnerName}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{spaceAddress}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              Expires in: {formatExpiryTime(expiresAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isExpired}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={isExpired}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={isExpired}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>

        {/* Access Code Display */}
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Access Code:
          </p>
          <p className="font-mono text-sm break-all">{accessCode}</p>
        </div>

        {isExpired && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-700 dark:text-red-300 text-sm text-center">
              This access code has expired. Please request a new one.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 