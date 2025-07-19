"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeDisplay } from "@/components/access/qr-code-display";
import { 
  QrCode, 
  Clock, 
  MapPin, 
  Building2,
  RefreshCw,
  Copy,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";

interface AccessCode {
  id: string;
  code: string;
  type: "qr" | "otp";
  expires_at: string;
  status: "pending" | "active" | "used" | "expired";
  qr_code_url?: string;
  space: {
    id: string;
    name: string;
    address: string;
    partner: {
      company_name: string;
    };
  };
}

export default function UserAccessPage() {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState<AccessCode | null>(null);
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAccessCodes();
  }, []);

  useEffect(() => {
    const codeId = searchParams.get("code");
    if (codeId && accessCodes.length > 0) {
      const code = accessCodes.find(c => c.id === codeId);
      if (code) {
        setSelectedCode(code);
      }
    }
  }, [searchParams, accessCodes]);

  const fetchAccessCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("access_codes")
        .select(`
          id,
          code,
          type,
          expires_at,
          status,
          space:spaces!inner(
            id,
            name,
            address,
            partner:partners!inner(company_name)
          )
        `)
        .in("status", ["pending", "active"])
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(code => {
        const space = Array.isArray(code.space) ? code.space[0] : code.space;
        const partner = Array.isArray(space.partner) ? space.partner[0] : space.partner;
        
        return {
          ...code,
          space: {
            ...space,
            partner,
          },
        };
      });

      // Generate QR codes for QR type access codes
      const codesWithQR = await Promise.all(
        transformedData.map(async (code) => {
          if (code.type === "qr") {
            try {
              const QRCode = (await import("qrcode")).default;
              const qrCodeUrl = await QRCode.toDataURL(code.code, {
                width: 200,
                margin: 2,
                color: {
                  dark: "#000000",
                  light: "#FFFFFF"
                }
              });
              return { ...code, qr_code_url: qrCodeUrl };
            } catch (error) {
              console.error("Error generating QR code:", error);
              return code;
            }
          }
          return code;
        })
      );

      setAccessCodes(codesWithQR);
    } catch (error) {
      console.error("Error fetching access codes:", error);
      toast.error("Failed to load access codes");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCode = async (codeId: string) => {
    try {
      const response = await fetch(`/api/access/${codeId}/refresh`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh code");
      }

      await fetchAccessCodes();
      toast.success("Access code refreshed");
    } catch (error) {
      toast.error("Failed to refresh access code");
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy code");
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Access Codes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your active access codes and QR codes
        </p>
      </div>

      {selectedCode ? (
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => setSelectedCode(null)}
            className="mb-4"
          >
            ← Back to All Codes
          </Button>

          {/* QR Code Display */}
          {selectedCode.type === "qr" && selectedCode.qr_code_url && (
            <QRCodeDisplay
              qrCodeUrl={selectedCode.qr_code_url}
              accessCode={selectedCode.code}
              spaceName={selectedCode.space.name}
              spaceAddress={selectedCode.space.address}
              partnerName={selectedCode.space.partner.company_name}
              expiresAt={selectedCode.expires_at}
              onRefresh={() => handleRefreshCode(selectedCode.id)}
            />
          )}

          {/* OTP Display */}
          {selectedCode.type === "otp" && (
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <span>{selectedCode.space.name}</span>
                </CardTitle>
                <CardDescription>
                  Use this OTP code to access the space
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      OTP Code:
                    </p>
                    <p className="font-mono text-2xl font-bold tracking-wider">
                      {selectedCode.code}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{selectedCode.space.partner.company_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedCode.space.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Expires in: {formatExpiryTime(selectedCode.expires_at)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCopyCode(selectedCode.code)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRefreshCode(selectedCode.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {accessCodes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No active access codes
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Request access to a space to get started
                </p>
                <Button onClick={() => window.location.href = "/dashboard/user/spaces"}>
                  Find Spaces
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessCodes.map((code) => (
                <Card
                  key={code.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCode(code)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {code.space.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {code.space.address}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {code.type === "qr" ? (
                          <QrCode className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Smartphone className="h-5 w-5 text-green-600" />
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            code.status
                          )}`}
                        >
                          {code.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>{code.space.partner.company_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Expires: {formatExpiryTime(code.expires_at)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500 mb-2">Access Code:</p>
                      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                        {code.type === "qr" ? "QR Code" : code.code}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 