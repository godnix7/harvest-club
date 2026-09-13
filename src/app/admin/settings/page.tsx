"use client";

import { useState, useEffect } from "react";
import { getSiteSettings, updateSiteSettings } from "./actions";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      const data = await getSiteSettings();
      if (data) {
        setSettings(data);
      }
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateSiteSettings(formData);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: "Settings updated successfully!" });
    }
    setIsSubmitting(false);
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600">Control the visibility of sections on the public homepage.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Homepage Sections</h2>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">About Preview</p>
                <p className="text-sm text-gray-500">Show the short "About Us" section on the homepage.</p>
              </div>
              <input type="checkbox" name="showAboutPreview" defaultChecked={settings?.showAboutPreview ?? true} className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500" />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Activities & Events</p>
                <p className="text-sm text-gray-500">Show the featured events list on the homepage.</p>
              </div>
              <input type="checkbox" name="showActivities" defaultChecked={settings?.showActivities ?? true} className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500" />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Sponsors Marquee</p>
                <p className="text-sm text-gray-500">Show the scrolling sponsors bar.</p>
              </div>
              <input type="checkbox" name="showSponsors" defaultChecked={settings?.showSponsors ?? true} className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500" />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Call to Action (CTA)</p>
                <p className="text-sm text-gray-500">Show the "Ready to innovate with us?" banner.</p>
              </div>
              <input type="checkbox" name="showCTA" defaultChecked={settings?.showCTA ?? true} className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500" />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-[var(--color-harvest-green)] text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors ${isSubmitting ? "opacity-50" : ""}`}
            >
              {isSubmitting ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
