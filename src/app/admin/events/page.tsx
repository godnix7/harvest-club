"use client";

import { useState, useEffect } from "react";
import { createEvent, deleteEvent, getEvents, getEventPresignedUrl } from "./actions";

type Event = {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  isFeatured?: boolean;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch events on mount
  useEffect(() => {
    async function fetchEvents() {
      const data = await getEvents();
      if (data) {
        setEvents(data);
      }
      setIsLoading(false);
    }
    fetchEvents();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("coverImageFile") as File;

    if (file && file.size > 0) {
      try {
        const { url, publicUrl, error: presignError } = await getEventPresignedUrl(file.name, file.type);
        if (presignError) throw new Error(presignError);

        const uploadRes = await fetch(url!, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type }
        });

        if (!uploadRes.ok) throw new Error("Failed to upload image");

        formData.set("coverImage", publicUrl!);
      } catch (err: any) {
        setError(err.message || "Failed to upload image");
        setIsSubmitting(false);
        return;
      }
    }

    const result = await createEvent(formData);

    if (result.error) {
      setError(result.error);
    } else {
      form.reset();
      window.location.reload();
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
        <p className="text-gray-600">Create, update, or delete Harvest Club events.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Add New Event</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" name="title" required className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date & Time</label>
              <input type="datetime-local" name="date" required className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select name="category" className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white">
                <option value="HACKATHON">Hackathon</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="SEMINAR">Seminar</option>
                <option value="INDUSTRIAL_VISIT">Industrial Visit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white">
                <option value="UPCOMING">Upcoming</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" rows={3} className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cover Photo</label>
              <input type="file" name="coverImageFile" accept="image/*" className="mt-1 block w-full text-sm text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" name="isFeatured" id="isFeatured" value="true" className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500" />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Feature on Homepage</label>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-[var(--color-harvest-green)] text-white py-2 rounded-md hover:bg-green-700 transition-colors ${isSubmitting ? "opacity-50" : ""}`}
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </form>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Loading events...</td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No events found. Or database not migrated yet.</td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.status === 'UPCOMING' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this event?")) {
                            await deleteEvent(event.id);
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
