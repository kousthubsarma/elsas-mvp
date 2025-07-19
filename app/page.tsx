import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Key, 
  Building2, 
  Smartphone, 
  Shield, 
  Clock, 
  MapPin,
  QrCode,
  Camera,
  Users,
  Zap
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">ELSAS</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Digital Access for
          <span className="text-blue-600"> Every Space</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Transform any physical space into a smart, digitally-managed asset. 
          Secure access through QR codes and OTP, with real-time monitoring and comprehensive logging.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register?type=user">
            <Button size="lg" className="text-lg px-8 py-4">
              <Smartphone className="mr-2 h-5 w-5" />
              Access Spaces
            </Button>
          </Link>
          <Link href="/auth/register?type=partner">
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              <Building2 className="mr-2 h-5 w-5" />
              List Your Space
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Choose ELSAS?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <QrCode className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Instant Access</CardTitle>
              <CardDescription>
                Generate QR codes and OTP for immediate access to any space
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Secure & Verified</CardTitle>
              <CardDescription>
                Multi-step identity verification with comprehensive security logging
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Camera className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>
                Live camera feeds and access logs for complete visibility
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Clock className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Flexible Scheduling</CardTitle>
              <CardDescription>
                Set operating hours and duration limits for controlled access
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <MapPin className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Location Discovery</CardTitle>
              <CardDescription>
                Find nearby available spaces using geolocation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle>Smart Integration</CardTitle>
              <CardDescription>
                Connect with existing smart locks and security systems
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-20 bg-white dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Perfect For Any Space
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Building2 className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Self-Storage Units</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Customers access their units 24/7 with QR codes, all access logged for security.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Construction Sites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Manage tool trailers across multiple sites with authorized worker access.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Pop-up Retail</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Unmanned kiosks with customer verification and camera monitoring.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Join thousands of users and partners already using ELSAS
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register?type=user">
            <Button size="lg" className="text-lg px-8 py-4">
              Start Accessing Spaces
            </Button>
          </Link>
          <Link href="/auth/register?type=partner">
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              List Your First Space
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Key className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">ELSAS</span>
          </div>
          <p className="text-gray-400 mb-4">
            Every Life Software as a Service
          </p>
          <p className="text-sm text-gray-500">
            © 2024 ELSAS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
