import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export default function StatsOverview() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await apiRequest("GET", "/api/stats");
        if (isMounted) setStats(data);
      } catch (err) {
        toast.error(`Failed to load stats: ${err.message}`);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStats();

    const handler = () => fetchStats();
    document.addEventListener("fileUploaded", handler);
    document.addEventListener("fileDeleted", handler);

    return () => {
      isMounted = false;
      document.removeEventListener("fileUploaded", handler);
      document.removeEventListener("fileDeleted", handler);
    };
  }, []);

  if (isLoading) {
    return (
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Usage Statistics
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!stats) return null;

  return (
    <section className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Usage Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-upload text-primary text-xl"></i>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">
              {stats.totalUploads}
            </h4>
            <p className="text-sm text-gray-600">Total Uploads</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-download text-green-600 text-xl"></i>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">
              {stats.totalDownloads}
            </h4>
            <p className="text-sm text-gray-600">Total Downloads</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-hdd text-purple-600 text-xl"></i>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">
              {stats.storageUsed}
            </h4>
            <p className="text-sm text-gray-600">Storage Used</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-orange-600 text-xl"></i>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">
              {stats.activeFiles}
            </h4>
            <p className="text-sm text-gray-600">Active Files</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
