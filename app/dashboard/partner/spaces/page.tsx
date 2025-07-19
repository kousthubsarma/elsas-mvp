"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Settings,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Space {
  id: string;
  name: string;
  description?: string;
  address: string;
  lock_id: string;
  camera_url?: string;
  is_active: boolean;
  open_hours: any;
  max_duration_minutes: number;
  created_at: string;
}

export default function PartnerSpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    lock_id: "",
    camera_url: "",
    max_duration_minutes: 60,
    open_hours: {
      mon: { start: "09:00", end: "17:00" },
      tue: { start: "09:00", end: "17:00" },
      wed: { start: "09:00", end: "17:00" },
      thu: { start: "09:00", end: "17:00" },
      fri: { start: "09:00", end: "17:00" },
    },
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSpaces();
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
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setSpaces(data || []);
    } catch (error) {
      console.error("Error fetching spaces:", error);
      toast.error("Failed to load spaces");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: partner } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!partner) return;

      const spaceData = {
        partner_id: partner.id,
        name: formData.name,
        description: formData.description,
        address: formData.address,
        lock_id: formData.lock_id,
        camera_url: formData.camera_url || null,
        max_duration_minutes: formData.max_duration_minutes,
        open_hours: formData.open_hours,
      };

      if (editingSpace) {
        const { error } = await supabase
          .from("spaces")
          .update(spaceData)
          .eq("id", editingSpace.id);

        if (error) throw error;
        toast.success("Space updated successfully");
      } else {
        const { error } = await supabase
          .from("spaces")
          .insert(spaceData);

        if (error) throw error;
        toast.success("Space created successfully");
      }

      setShowAddForm(false);
      setEditingSpace(null);
      resetForm();
      fetchSpaces();
    } catch (error) {
      console.error("Error saving space:", error);
      toast.error("Failed to save space");
    }
  };

  const handleEdit = (space: Space) => {
    setEditingSpace(space);
    setFormData({
      name: space.name,
      description: space.description || "",
      address: space.address,
      lock_id: space.lock_id,
      camera_url: space.camera_url || "",
      max_duration_minutes: space.max_duration_minutes,
      open_hours: space.open_hours,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (spaceId: string) => {
    if (!confirm("Are you sure you want to delete this space?")) return;

    try {
      const { error } = await supabase
        .from("spaces")
        .delete()
        .eq("id", spaceId);

      if (error) throw error;
      toast.success("Space deleted successfully");
      fetchSpaces();
    } catch (error) {
      console.error("Error deleting space:", error);
      toast.error("Failed to delete space");
    }
  };

  const handleToggleActive = async (space: Space) => {
    try {
      const { error } = await supabase
        .from("spaces")
        .update({ is_active: !space.is_active })
        .eq("id", space.id);

      if (error) throw error;
      toast.success(`Space ${space.is_active ? "deactivated" : "activated"}`);
      fetchSpaces();
    } catch (error) {
      console.error("Error toggling space status:", error);
      toast.error("Failed to update space status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      lock_id: "",
      camera_url: "",
      max_duration_minutes: 60,
      open_hours: {
        mon: { start: "09:00", end: "17:00" },
        tue: { start: "09:00", end: "17:00" },
        wed: { start: "09:00", end: "17:00" },
        thu: { start: "09:00", end: "17:00" },
        fri: { start: "09:00", end: "17:00" },
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            My Spaces
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your registered spaces
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Space
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSpace ? "Edit Space" : "Add New Space"}
            </CardTitle>
            <CardDescription>
              Configure your space details and access parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Space Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Storage Unit A1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lock ID *
                  </label>
                  <Input
                    value={formData.lock_id}
                    onChange={(e) => setFormData({ ...formData, lock_id: e.target.value })}
                    placeholder="lock-123"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Secure storage unit with 24/7 access"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Camera URL
                  </label>
                  <Input
                    value={formData.camera_url}
                    onChange={(e) => setFormData({ ...formData, camera_url: e.target.value })}
                    placeholder="https://example.com/camera-feed"
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Duration (minutes)
                  </label>
                  <Input
                    value={formData.max_duration_minutes}
                    onChange={(e) => setFormData({ ...formData, max_duration_minutes: parseInt(e.target.value) || 60 })}
                    type="number"
                    min="1"
                    max="1440"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingSpace ? "Update Space" : "Create Space"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSpace(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Spaces List */}
      <div className="space-y-4">
        {spaces.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No spaces registered yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add your first space to start managing digital access
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Space
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spaces.map((space) => (
              <Card key={space.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{space.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {space.address}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
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
                  </div>

                  {space.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {space.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Settings className="h-4 w-4" />
                      <span>Lock ID: {space.lock_id}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Max duration: {space.max_duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Added: {formatDate(space.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(space)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(space)}
                    >
                      {space.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(space.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
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
