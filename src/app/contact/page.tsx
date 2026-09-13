"use client";

import { useState } from "react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple clicks

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to send message.");
      }

      setSubmitStatus("success");
      // @ts-ignore
      e.target.reset();
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="mb-12 border-b border-gray-200 pb-8 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">Have questions about our events or want to partner with us? Reach out!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-harvest-blue-dark)] mb-6">Get In Touch</h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              We're always looking to collaborate with students, faculty, and industry professionals. 
              Whether you want to sponsor an event, become a mentor, or simply say hello, we'd love to hear from you.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-[var(--color-harvest-green)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Email</h3>
                  <p className="mt-1 text-gray-600">contact@harvestclub.example.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[var(--color-harvest-blue)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Location</h3>
                  <p className="mt-1 text-gray-600">Innovation Lab, Engineering Block<br/>Campus Main Road</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
                  <input type="text" name="name" id="name" required minLength={2} maxLength={100}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-harvest-green)] focus:ring-[var(--color-harvest-green)] sm:text-sm border p-2"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                  <input type="email" name="email" id="email" required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-harvest-green)] focus:ring-[var(--color-harvest-green)] sm:text-sm border p-2"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <input type="text" name="subject" id="subject" maxLength={150}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-harvest-green)] focus:ring-[var(--color-harvest-green)] sm:text-sm border p-2"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message *</label>
                <textarea name="message" id="message" rows={4} required minLength={10} maxLength={2000}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-harvest-green)] focus:ring-[var(--color-harvest-green)] sm:text-sm border p-2"
                ></textarea>
              </div>

              {submitStatus === "error" && (
                <div className="p-4 rounded-md bg-red-50 border border-red-100 text-red-700 text-sm">
                  {errorMessage}
                </div>
              )}

              {submitStatus === "success" && (
                <div className="p-4 rounded-md bg-green-50 border border-green-100 text-green-700 text-sm">
                  Your message has been sent successfully! We will get back to you soon.
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-harvest-blue)] hover:bg-[var(--color-harvest-blue-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-harvest-blue)] transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : "Send Message"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
