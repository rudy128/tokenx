"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

interface Campaign {
  id: string;
  name: string;
  status: string;
}

interface CreateTaskFormProps {
  campaigns: Campaign[];
  organizationId: string;
}

interface SubTask {
  id: string;
  title: string;
  description: string;
  link: string;
  xpReward: string;
  type: string;
  isUploadProof: boolean;
}

export default function CreateTaskForm({ campaigns, organizationId }: CreateTaskFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState({
    campaignId: campaigns[0]?.id || "",
    name: "",
    description: "",
    instructions: "",
    category: "CUSTOM",
    taskType: "GENERAL",
    xpReward: "100",
    rewardAmount: "",
    rewardToken: "",
    verificationMethod: "MANUAL",
    status: "draft",
    frequency: "one_time",
    isActive: true,
    // Advanced fields
    perUserCap: "",
    globalCap: "",
    availableFrom: "",
    availableTo: "",
    minAccountAgeDays: "",
    minFollowers: "",
    uniqueContent: true,
  });

  const [subTasks, setSubTasks] = useState<SubTask[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addSubTask = () => {
    setSubTasks([...subTasks, {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      link: "",
      xpReward: "0",
      type: "X_TWEET",
      isUploadProof: false,
    }]);
  };

  const removeSubTask = (id: string) => {
    setSubTasks(prevSubTasks => prevSubTasks.filter(st => st.id !== id));
  };

  const updateSubTask = (id: string, field: keyof SubTask, value: string | boolean) => {
    setSubTasks(prevSubTasks => 
      prevSubTasks.map(st => 
        st.id === id ? { ...st, [field]: value } : st
      )
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validation
      if (!formData.campaignId) {
        throw new Error("Please select a campaign");
      }
      if (!formData.name.trim()) {
        throw new Error("Task name is required");
      }
      if (!formData.xpReward || Number(formData.xpReward) < 0) {
        throw new Error("XP reward must be 0 or greater");
      }

      // Validate subtasks
      const validSubTasks = subTasks.filter(st => st.title.trim());
      if (validSubTasks.some(st => !st.type)) {
        throw new Error("All subtasks must have a type selected");
      }

      // Create task
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          campaignId: formData.campaignId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          instructions: formData.instructions.trim() || null,
          category: formData.category,
          taskType: formData.taskType,
          xpReward: Number(formData.xpReward),
          rewardAmount: formData.rewardAmount ? Number(formData.rewardAmount) : null,
          rewardToken: formData.rewardToken.trim() || null,
          verificationMethod: formData.verificationMethod,
          status: formData.status,
          frequency: formData.frequency,
          isActive: formData.isActive,
          perUserCap: formData.perUserCap ? Number(formData.perUserCap) : null,
          globalCap: formData.globalCap ? Number(formData.globalCap) : null,
          availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null,
          availableTo: formData.availableTo ? new Date(formData.availableTo).toISOString() : null,
          minAccountAgeDays: formData.minAccountAgeDays ? Number(formData.minAccountAgeDays) : null,
          minFollowers: formData.minFollowers ? Number(formData.minFollowers) : null,
          uniqueContent: formData.uniqueContent,
          subTasks: validSubTasks.map((st, index) => ({
            title: st.title.trim(),
            description: st.description.trim() || null,
            link: st.link.trim() || null,
            xpReward: Number(st.xpReward) || 0,
            type: st.type,
            isUploadProof: st.isUploadProof,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create task");
      }

      const result = await response.json();
      console.log("✅ Task created successfully:", result);
      
      // Show success state briefly before redirect
      setIsLoading(false);
      setSuccess(true);
      
      // Small delay to show success state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to tasks list
      router.push("/dashboard/tasks");
      router.refresh();
    } catch (error: unknown) {
      console.error("❌ Create task error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
      setSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Basic Information</h2>

        {/* Campaign Selection */}
        <div>
          <label htmlFor="campaignId" className="block text-sm font-medium mb-2">
            Campaign *
          </label>
          <select
            id="campaignId"
            name="campaignId"
            required
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            value={formData.campaignId}
            onChange={handleChange}
            disabled={isLoading}
          >
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name} ({campaign.status})
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-muted-foreground">
            Select the campaign this task belongs to
          </p>
        </div>

        {/* Task Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Task Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            placeholder="Follow us on Twitter"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
            placeholder="Brief description of what the task involves..."
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Instructions */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium mb-2">
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
            placeholder="Detailed instructions for completing this task..."
            value={formData.instructions}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Category and Type */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              value={formData.category}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="SOCIAL_ENGAGEMENT">Social Engagement</option>
              <option value="CONTENT_CREATION">Content Creation</option>
              <option value="COMMUNITY_BUILDING">Community Building</option>
              <option value="REFERRAL">Referral</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          <div>
            <label htmlFor="taskType" className="block text-sm font-medium mb-2">
              Task Type *
            </label>
            <select
              id="taskType"
              name="taskType"
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              value={formData.taskType}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="GENERAL">General</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="CONTENT_CREATION">Content Creation</option>
              <option value="TECHNICAL">Technical</option>
              <option value="FEEDBACK">Feedback</option>
              <option value="BUSINESS_DEVELOPMENT">Business Development</option>
              <option value="COMMUNITY_MANAGEMENT">Community Management</option>
              <option value="EVENT_MANAGEMENT">Event Management</option>
              <option value="REFERRAL">Referral</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rewards */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Rewards</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="xpReward" className="block text-sm font-medium mb-2">
              XP Reward *
            </label>
            <input
              id="xpReward"
              name="xpReward"
              type="number"
              min="0"
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              placeholder="100"
              value={formData.xpReward}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="rewardAmount" className="block text-sm font-medium mb-2">
              Token Reward Amount
            </label>
            <input
              id="rewardAmount"
              name="rewardAmount"
              type="number"
              min="0"
              step="0.000001"
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              placeholder="10"
              value={formData.rewardAmount}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="rewardToken" className="block text-sm font-medium mb-2">
              Reward Token
            </label>
            <select
              id="rewardToken"
              name="rewardToken"
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              value={formData.rewardToken}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Token (Optional)</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
              <option value="MATIC">MATIC</option>
              <option value="BNB">BNB</option>
              <option value="SOL">SOL</option>
              <option value="AVAX">AVAX</option>
              <option value="ARB">ARB</option>
            </select>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Settings</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="verificationMethod" className="block text-sm font-medium mb-2">
              Verification Method *
            </label>
            <select
              id="verificationMethod"
              name="verificationMethod"
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              value={formData.verificationMethod}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="MANUAL">Manual</option>
              {/* <option value="AI_AUTO">AI Auto</option> */}
              {/* <option value="HYBRID">Hybrid</option> */}
            </select>
          </div>

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
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium mb-2">
              Frequency *
            </label>
            <select
              id="frequency"
              name="frequency"
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              value={formData.frequency}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="one_time">One Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            className="w-4 h-4 border border-input rounded focus:ring-2 focus:ring-ring"
            checked={formData.isActive}
            onChange={handleChange}
            disabled={isLoading}
          />
          <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
            Task is active (ambassadors can see and complete it)
          </label>
        </div>
      </div>

      {/* Advanced Settings (Collapsible) */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-lg font-semibold"
        >
          <span>Advanced Settings</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-5 h-5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="space-y-6 pt-4 border-t">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="perUserCap" className="block text-sm font-medium mb-2">
                  Per User Cap
                </label>
                <input
                  id="perUserCap"
                  name="perUserCap"
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  placeholder="Leave empty for unlimited"
                  value={formData.perUserCap}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Maximum times a user can complete this task
                </p>
              </div>

              <div>
                <label htmlFor="globalCap" className="block text-sm font-medium mb-2">
                  Global Cap
                </label>
                <input
                  id="globalCap"
                  name="globalCap"
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  placeholder="Leave empty for unlimited"
                  value={formData.globalCap}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Maximum total completions across all users
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="availableFrom" className="block text-sm font-medium mb-2">
                  Available From
                </label>
                <input
                  id="availableFrom"
                  name="availableFrom"
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background scheme-light dark:scheme-dark"
                  value={formData.availableFrom}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="availableTo" className="block text-sm font-medium mb-2">
                  Available To
                </label>
                <input
                  id="availableTo"
                  name="availableTo"
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background scheme-light dark:scheme-dark"
                  value={formData.availableTo}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="minAccountAgeDays" className="block text-sm font-medium mb-2">
                  Min Account Age (Days)
                </label>
                <input
                  id="minAccountAgeDays"
                  name="minAccountAgeDays"
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  placeholder="0"
                  value={formData.minAccountAgeDays}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="minFollowers" className="block text-sm font-medium mb-2">
                  Min Followers
                </label>
                <input
                  id="minFollowers"
                  name="minFollowers"
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  placeholder="0"
                  value={formData.minFollowers}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="uniqueContent"
                name="uniqueContent"
                type="checkbox"
                className="w-4 h-4 border border-input rounded focus:ring-2 focus:ring-ring"
                checked={formData.uniqueContent}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label htmlFor="uniqueContent" className="text-sm font-medium cursor-pointer">
                Require unique content for each submission
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Sub Tasks */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sub Tasks ({subTasks.length})</h2>
          <button
            type="button"
            onClick={addSubTask}
            disabled={isLoading}
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            + Add Sub Task
          </button>
        </div>

        {subTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No subtasks yet. Click &quot;Add Sub Task&quot; to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subTasks.map((subTask, index) => (
              <div key={subTask.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Sub Task {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeSubTask(subTask.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                      placeholder="Follow on Twitter"
                      value={subTask.title}
                      onChange={(e) => updateSubTask(subTask.id, "title", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Type *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                      value={subTask.type}
                      onChange={(e) => updateSubTask(subTask.id, "type", e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="X_TWEET">X Tweet</option>
                      <option value="X_LIKE">X Like</option>
                      <option value="X_COMMENT">X Comment</option>
                      <option value="X_SHARE">X Share</option>
                      <option value="X_RETWEET">X Retweet</option>
                      <option value="X_FOLLOW">X Follow</option>
                      <option value="X_QUOTE">X Quote</option>
                      <option value="X_SPACE_HOST">X Space Host</option>
                      <option value="X_CUSTOM">X Custom</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
                    placeholder="Optional description"
                    value={subTask.description}
                    onChange={(e) => updateSubTask(subTask.id, "description", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Link (Optional)
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                      placeholder="https://twitter.com/..."
                      value={subTask.link}
                      onChange={(e) => updateSubTask(subTask.id, "link", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                      placeholder="0"
                      value={subTask.xpReward}
                      onChange={(e) => updateSubTask(subTask.id, "xpReward", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border border-input rounded focus:ring-2 focus:ring-ring"
                    checked={subTask.isUploadProof}
                    onChange={(e) => updateSubTask(subTask.id, "isUploadProof", e.target.checked)}
                    disabled={isLoading}
                  />
                  <label className="text-sm font-medium cursor-pointer">
                    Require proof upload
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
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
          {isLoading ? "Creating..." : "Create Task"}
        </button>
      </div>
    </form>
  );
}
