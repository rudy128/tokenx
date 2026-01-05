"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

interface CreateCampaignFormProps {
  organizationId: string;
}

export default function CreateCampaignForm({ organizationId }: CreateCampaignFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    participationLimit: "",
    eligibilityCriteria: "",
    rewardPool: "",
    rewardToken: "USDT",
    status: "DRAFT",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error("Campaign name is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }
      if (!formData.startDate) {
        throw new Error("Start date is required");
      }
      if (!formData.endDate) {
        throw new Error("End date is required");
      }
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        throw new Error("End date must be after start date");
      }
      if (!formData.rewardPool || Number(formData.rewardPool) <= 0) {
        throw new Error("Reward pool must be greater than 0");
      }
      if (!formData.rewardToken.trim()) {
        throw new Error("Reward token is required");
      }

      // Create campaign
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          participationLimit: formData.participationLimit ? Number(formData.participationLimit) : null,
          eligibilityCriteria: formData.eligibilityCriteria.trim() || null,
          rewardPool: Number(formData.rewardPool),
          rewardToken: formData.rewardToken.trim(),
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create campaign");
      }

      await response.json();
      
      // Redirect to campaigns list
      router.push("/dashboard/campaigns");
      router.refresh();
    } catch (error: unknown) {
      console.error("Create campaign error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-card p-6 space-y-6">
        {/* Campaign Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Campaign Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            placeholder="Summer Ambassador Program"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
            placeholder="Describe your campaign objectives and what ambassadors will do..."
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Date Range */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-2">
              Start Date *
            </label>
            <input
              id="startDate"
              name="startDate"
              type="datetime-local"
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background scheme-light dark:scheme-dark"
              value={formData.startDate}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-2">
              End Date *
            </label>
            <input
              id="endDate"
              name="endDate"
              type="datetime-local"
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background scheme-light dark:scheme-dark"
              value={formData.endDate}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Participation Limit */}
        <div>
          <label htmlFor="participationLimit" className="block text-sm font-medium mb-2">
            Participation Limit
          </label>
          <input
            id="participationLimit"
            name="participationLimit"
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            placeholder="Leave empty for unlimited"
            value={formData.participationLimit}
            onChange={handleChange}
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Maximum number of ambassadors who can join (optional)
          </p>
        </div>

        {/* Eligibility Criteria */}
        <div>
          <label htmlFor="eligibilityCriteria" className="block text-sm font-medium mb-2">
            Eligibility Criteria
          </label>
          <textarea
            id="eligibilityCriteria"
            name="eligibilityCriteria"
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
            placeholder="E.g., Minimum 1000 followers, Active on Twitter, etc. (optional)"
            value={formData.eligibilityCriteria}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Reward Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="rewardPool" className="block text-sm font-medium mb-2">
              Reward Pool *
            </label>
            <input
              id="rewardPool"
              name="rewardPool"
              type="number"
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              placeholder="10000"
              value={formData.rewardPool}
              onChange={handleChange}
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Total amount available for rewards
            </p>
          </div>

          <div>
            <label htmlFor="rewardToken" className="block text-sm font-medium mb-2">
              Reward Token *
            </label>
            <input
              id="rewardToken"
              name="rewardToken"
              type="text"
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              placeholder="USDT, TOKEN, etc."
              value={formData.rewardToken}
              onChange={handleChange}
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Token or currency for rewards
            </p>
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <p className="mt-1 text-sm text-muted-foreground">
            Campaign will only be visible to ambassadors when set to Active
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="px-6 py-2 border border-input rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Campaign"}
        </button>
      </div>
    </form>
  );
}
