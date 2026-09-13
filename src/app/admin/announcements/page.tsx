"use client";

import { useState, useEffect } from "react";
import { createAnnouncement, deleteAnnouncement, getAnnouncements } from "./actions";

type Announcement = {
  id: string;
  title: string;
  category: string | null;
  isFeatured: boolean;
  createdAt: string | Date;
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch announcements on mount
  useEffect(() => {
    async function fetchAnnouncements() {
      const data = await getAnnouncements();
      if (data) {
        setAnnouncements(data);
      }
      setIsLoading(false);
    }
    fetchAnnouncements();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createAnnouncement(formData);

    if (result.error) {
      setError(result.error);
    } else {
      // @ts-ignore
      e.target.reset();
      window.location.reload();
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Announcements</h1>
        <p className="text-gray-600">Post news, updates, and featured alerts to the public.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">New Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" name="title" required className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select name="category" className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white">
                <option value="GENERAL">General</option>
                <option value="EVENT">Event Alert</option>
                <option value="RECRUITMENT">Recruitment</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description / Content</label>
              <textarea name="description" rows={5} required className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white"></textarea>
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="isFeatured" id="isFeatured" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                Pin / Feature on Homepage
              </label>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-[var(--color-harvest-green)] text-white py-2 rounded-md hover:bg-green-700 transition-colors ${isSubmitting ? "opacity-50" : ""}`}
            >
              {isSubmitting ? "Posting..." : "Publish Announcement"}
            </button>
          </form>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Announcement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Loading announcements...</td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No announcements found.</td>
                </tr>
              ) : (
                announcements.map(ann => (
                  <tr key={ann.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {ann.title}
                        {ann.isFeatured && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800">FEATURED</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{ann.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this announcement?")) {
                            await deleteAnnouncement(ann.id);
                            window.location.reload();
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
