"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    organizationName: "",
    description: "",
    website: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Get user email from localStorage (set during signup)
    const email = localStorage.getItem("pendingUserEmail");
    const password = localStorage.getItem("pendingUserPassword");
    
    if (!email || !password) {
      // Redirect to signup if no pending user
      router.push("/sign-up");
    } else {
      setUserEmail(email);
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const email = localStorage.getItem("pendingUserEmail");
      const password = localStorage.getItem("pendingUserPassword");

      console.log("🔵 Starting onboarding for:", email);

      if (!email || !password) {
        throw new Error("Session expired. Please sign up again.");
      }

      // Validate organization name
      if (!formData.organizationName.trim()) {
        throw new Error("Organization name is required");
      }

      console.log("🔵 Calling onboarding API...");

      // Update organization details
      const response = await fetch("/api/organization/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          organizationName: formData.organizationName.trim(),
          description: formData.description.trim() || undefined,
          website: formData.website.trim() || undefined,
        }),
      });

      console.log("🔵 Onboarding API response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to complete onboarding";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // If we can't parse JSON, use default error
          errorMessage = `Server error: ${response.status}`;
        }
        console.error("❌ Onboarding API error:", errorMessage);
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
        console.log("✅ Onboarding completed:", result);
      } catch (parseError) {
        console.error("❌ Failed to parse onboarding response:", parseError);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
        throw new Error("Invalid response from server");
      }

      // Clear temporary storage before sign in
      localStorage.removeItem("pendingUserEmail");
      localStorage.removeItem("pendingUserPassword");

      console.log("🔵 Attempting to sign in...");

      // Sign in the user (NextAuth will handle the redirect)
      const signInResult = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });

      console.log("🔵 Sign in result:", signInResult);
    } catch (error: unknown) {
      console.error("❌ Onboarding error:", error);
      setError(error instanceof Error ? error.message : "An error occurred during onboarding");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Organization Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tell us about your organization to get started
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                Organization Name *
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Acme Inc."
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be the name of your organization
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Tell us about your organization..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional: A brief description of what your organization does
              </p>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional: Your organization's website URL
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                📋 What happens next?
              </h4>
              <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                <li>Your organization will be activated</li>
                <li>You'll be automatically signed in</li>
                <li>You can start managing your organization</li>
              </ul>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
