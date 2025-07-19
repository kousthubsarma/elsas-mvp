"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Play, 
  Pause, 
  RefreshCw,
  Volume2,
  VolumeX,
  Maximize,
  Settings
} from "lucide-react";

interface CameraFeedProps {
  cameraUrl?: string;
  spaceName: string;
  isLive?: boolean;
  onRefresh?: () => void;
}

export function CameraFeed({ 
  cameraUrl, 
  spaceName, 
  isLive = false,
  onRefresh 
}: CameraFeedProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock camera URL if none provided
  const feedUrl = cameraUrl || process.env.NEXT_PUBLIC_MOCK_CAMERA_URL || "https://via.placeholder.com/640x480/1f2937/ffffff?text=Camera+Feed+Unavailable";

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [feedUrl]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    const videoElement = document.getElementById(`camera-${spaceName.replace(/\s+/g, '-')}`);
    if (videoElement) {
      if (!isFullscreen) {
        if (videoElement.requestFullscreen) {
          videoElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    setLoading(false);
    setError("Failed to load camera feed");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <CardTitle>{spaceName} Camera</CardTitle>
            {isLive && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {isLive ? "Live camera feed" : "Static camera feed"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Feed */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="flex items-center space-x-2 text-white">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading camera feed...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {feedUrl.startsWith("http") ? (
            <video
              id={`camera-${spaceName.replace(/\s+/g, '-')}`}
              src={feedUrl}
              className="w-full h-64 object-cover"
              autoPlay={isPlaying}
              muted={isMuted}
              loop
              onLoadStart={() => setLoading(true)}
              onLoadedData={handleLoad}
              onError={handleError}
              controls={false}
            />
          ) : (
            <img
              src={feedUrl}
              alt={`${spaceName} camera feed`}
              className="w-full h-64 object-cover"
              onLoad={handleLoad}
              onError={handleError}
            />
          )}

          {/* Overlay Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg p-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePlayPause}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMuteToggle}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Camera Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Camera className="h-4 w-4" />
            <span>Status: {error ? "Offline" : "Online"}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Settings className="h-4 w-4" />
            <span>Quality: HD</span>
          </div>
        </div>

        {/* Camera Settings */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Camera Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recording Mode
              </label>
              <select className="w-full px-3 py-1 border border-gray-300 rounded text-sm">
                <option>Motion Detection</option>
                <option>Continuous</option>
                <option>Scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sensitivity
              </label>
              <select className="w-full px-3 py-1 border border-gray-300 rounded text-sm">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Storage
              </label>
              <select className="w-full px-3 py-1 border border-gray-300 rounded text-sm">
                <option>Cloud</option>
                <option>Local</option>
                <option>Both</option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 