"use client";

import { useState, useEffect } from "react";
import { createSponsor, deleteSponsor, getPresignedUrl, getSponsors } from "./actions";
import Image from "next/image";

type Sponsor = {
  id: string;
  name: string;
  tier: string;
  description: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
};

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sponsors on mount
  useEffect(() => {
    async function fetchSponsors() {
      const data = await getSponsors();
      if (data) {
        setSponsors(data);
      }
      setIsLoading(false);
    }
    fetchSponsors();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("logoFile") as HTMLInputElement;
    const file = fileInput?.files?.[0];

    let logoUrl = "";

    if (file) {
      try {
        // 1. Get Presigned URL
        const presigned = await getPresignedUrl(file.name, file.type);
        if (presigned.error) throw new Error(presigned.error);
        if (!presigned.url || !presigned.publicUrl) throw new Error("Failed to get upload URL");

        // 2. Upload directly to Cloudflare R2 from browser
        const uploadRes = await fetch(presigned.url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadRes.ok) throw new Error("Failed to upload image");
        
        logoUrl = presigned.publicUrl;
      } catch (err: any) {
        setError(err.message || "Failed to upload image.");
        setIsSubmitting(false);
        return;
      }
    }

    const formData = new FormData(form);
    if (logoUrl) formData.set("logoUrl", logoUrl);

    const result = await createSponsor(formData);

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
        <h1 className="text-2xl font-bold text-gray-900">Manage Sponsors</h1>
        <p className="text-gray-600">Add or remove Harvest Club sponsors and partners.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Add New Sponsor</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sponsor Name</label>
              <input type="text" name="name" required className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tier</label>
              <select name="tier" className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white">
                <option value="TITLE">Title Sponsor</option>
                <option value="PLATINUM">Platinum</option>
                <option value="GOLD">Gold</option>
                <option value="SILVER">Silver</option>
                <option value="PARTNER">Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website URL</label>
              <input type="url" name="websiteUrl" placeholder="https://" className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" rows={3} className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo Image</label>
              <input type="file" name="logoFile" accept="image/*" className="mt-1 block w-full border rounded-md p-2 text-sm text-gray-900 bg-white" />
              <p className="text-xs text-gray-500 mt-1">Image will be securely uploaded to Cloudflare R2.</p>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-[var(--color-harvest-green)] text-white py-2 rounded-md hover:bg-green-700 transition-colors ${isSubmitting ? "opacity-50" : ""}`}
            >
              {isSubmitting ? "Processing..." : "Add Sponsor"}
            </button>
          </form>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Loading sponsors...</td>
                </tr>
              ) : sponsors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No sponsors found.</td>
                </tr>
              ) : (
                sponsors.map(sponsor => (
                  <tr key={sponsor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 relative bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                          {sponsor.logoUrl ? (
                            <Image src={sponsor.logoUrl} alt={sponsor.name} fill className="object-cover" />
                          ) : (
                            <span className="text-xs text-gray-400">No Img</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{sponsor.name}</div>
                          <div className="text-sm text-gray-500">{sponsor.websiteUrl}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {sponsor.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this sponsor?")) {
                            await deleteSponsor(sponsor.id);
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
