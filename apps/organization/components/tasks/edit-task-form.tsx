"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

interface Campaign {
  id: string;
  name: string;
  status: string;
}

interface SubTask {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  xpReward: number;
  type: string;
  isUploadProof: boolean;
}

interface Task {
  id: string;
  campaignId: string;
  name: string;
  description: string | null;
  instructions: string | null;
  category: string;
  taskType: string;
  xpReward: number;
  rewardAmount: number | null;
  rewardToken: string | null;
  verificationMethod: string;
  status: string;
  frequency: string;
  isActive: boolean;
  perUserCap: number | null;
  globalCap: number | null;
  availableFrom: Date | null;
  availableTo: Date | null;
  minAccountAgeDays: number | null;
  minFollowers: number | null;
  uniqueContent: boolean;
  SubTasks: SubTask[];
}

interface EditTaskFormProps {
  task: Task;
  campaigns: Campaign[];
  organizationId: string;
}

interface SubTaskForm {
  id: string;
  title: string;
  description: string;
  link: string;
  xpReward: string;
  type: string;
  isUploadProof: boolean;
  isExisting?: boolean;
}

export default function EditTaskForm({ task, campaigns }: EditTaskFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState({
    campaignId: task.campaignId,
    name: task.name,
    description: task.description || "",
    instructions: task.instructions || "",
    category: task.category,
    taskType: task.taskType,
    xpReward: task.xpReward.toString(),
    rewardAmount: task.rewardAmount?.toString() || "",
    rewardToken: task.rewardToken || "",
    verificationMethod: task.verificationMethod,
    status: task.status,
    frequency: task.frequency,
    isActive: task.isActive,
    // Advanced fields
    perUserCap: task.perUserCap?.toString() || "",
    globalCap: task.globalCap?.toString() || "",
    availableFrom: task.availableFrom ? new Date(task.availableFrom).toISOString().slice(0, 16) : "",
    availableTo: task.availableTo ? new Date(task.availableTo).toISOString().slice(0, 16) : "",
    minAccountAgeDays: task.minAccountAgeDays?.toString() || "",
    minFollowers: task.minFollowers?.toString() || "",
    uniqueContent: task.uniqueContent,
  });

  const [subTasks, setSubTasks] = useState<SubTaskForm[]>(
    task.SubTasks.map(st => ({
      id: st.id,
      title: st.title,
      description: st.description || "",
      link: st.link || "",
      xpReward: st.xpReward.toString(),
      type: st.type,
      isUploadProof: st.isUploadProof,
      isExisting: true,
    }))
  );

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
      isExisting: false,
    }]);
  };

  const removeSubTask = (id: string) => {
    setSubTasks(subTasks.filter(st => st.id !== id));
  };

  const updateSubTask = (id: string, field: keyof SubTaskForm, value: string | boolean) => {
    setSubTasks(subTasks.map(st => 
      st.id === id ? { ...st, [field]: value } : st
    ));
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
      if (parseInt(formData.xpReward) < 0) {
        throw new Error("XP reward must be a positive number");
      }

      // Prepare subtasks data
      const subTasksData = subTasks.map(st => ({
        id: st.isExisting ? st.id : undefined,
        title: st.title,
        description: st.description,
        link: st.link,
        xpReward: parseInt(st.xpReward) || 0,
        type: st.type,
        isUploadProof: st.isUploadProof,
      }));

      // Prepare task data
      const taskData = {
        campaignId: formData.campaignId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        instructions: formData.instructions.trim() || null,
        category: formData.category,
        taskType: formData.taskType,
        xpReward: parseInt(formData.xpReward),
        rewardAmount: formData.rewardAmount ? parseFloat(formData.rewardAmount) : null,
        rewardToken: formData.rewardToken || null,
        verificationMethod: formData.verificationMethod,
        status: formData.status,
        frequency: formData.frequency,
        isActive: formData.isActive,
        // Advanced fields
        perUserCap: formData.perUserCap ? parseInt(formData.perUserCap) : null,
        globalCap: formData.globalCap ? parseInt(formData.globalCap) : null,
        availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null,
        availableTo: formData.availableTo ? new Date(formData.availableTo).toISOString() : null,
        minAccountAgeDays: formData.minAccountAgeDays ? parseInt(formData.minAccountAgeDays) : null,
        minFollowers: formData.minFollowers ? parseInt(formData.minFollowers) : null,
        uniqueContent: formData.uniqueContent,
        subTasks: subTasksData,
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update task");
      }

      router.push("/dashboard/tasks");
      router.refresh();
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to update task");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-card rounded-lg border p-6 space-y-6">
        <h2 className="text-xl font-semibold">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="campaignId" className="block text-sm font-medium mb-2">
              Campaign <span className="text-red-500">*</span>
            </label>
            <select
              id="campaignId"
              name="campaignId"
              value={formData.campaignId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name} ({campaign.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Follow us on Twitter"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Brief description of the task..."
            />
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium mb-2">
              Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Detailed instructions for completing the task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                Task Type
              </label>
              <select
                id="taskType"
                name="taskType"
                value={formData.taskType}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
      </div>

      {/* Rewards */}
      <div className="bg-card rounded-lg border p-6 space-y-6">
        <h2 className="text-xl font-semibold">Rewards</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="xpReward" className="block text-sm font-medium mb-2">
              XP Reward <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="xpReward"
              name="xpReward"
              value={formData.xpReward}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="rewardAmount" className="block text-sm font-medium mb-2">
              Token Amount
            </label>
            <input
              type="number"
              id="rewardAmount"
              name="rewardAmount"
              value={formData.rewardAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="rewardToken" className="block text-sm font-medium mb-2">
              Token Type
            </label>
            <select
              id="rewardToken"
              name="rewardToken"
              value={formData.rewardToken}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select token...</option>
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
      <div className="bg-card rounded-lg border p-6 space-y-6">
        <h2 className="text-xl font-semibold">Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="verificationMethod" className="block text-sm font-medium mb-2">
              Verification Method
            </label>
            <select
              id="verificationMethod"
              name="verificationMethod"
              value={formData.verificationMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATIC">Automatic</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium mb-2">
              Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="one_time">One Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex items-center">
            <label htmlFor="isActive" className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="ml-2 text-sm font-medium">Is Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-card rounded-lg border p-6 space-y-6">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xl font-semibold"
        >
          <span>Advanced Settings</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="perUserCap" className="block text-sm font-medium mb-2">
                  Per User Cap
                </label>
                <input
                  type="number"
                  id="perUserCap"
                  name="perUserCap"
                  value={formData.perUserCap}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Unlimited"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum completions per user
                </p>
              </div>

              <div>
                <label htmlFor="globalCap" className="block text-sm font-medium mb-2">
                  Global Cap
                </label>
                <input
                  type="number"
                  id="globalCap"
                  name="globalCap"
                  value={formData.globalCap}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Unlimited"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum total completions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="availableFrom" className="block text-sm font-medium mb-2">
                  Available From
                </label>
                <input
                  type="datetime-local"
                  id="availableFrom"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary scheme-light dark:scheme-dark"
                />
              </div>

              <div>
                <label htmlFor="availableTo" className="block text-sm font-medium mb-2">
                  Available To
                </label>
                <input
                  type="datetime-local"
                  id="availableTo"
                  name="availableTo"
                  value={formData.availableTo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary scheme-light dark:scheme-dark"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="minAccountAgeDays" className="block text-sm font-medium mb-2">
                  Minimum Account Age (days)
                </label>
                <input
                  type="number"
                  id="minAccountAgeDays"
                  name="minAccountAgeDays"
                  value={formData.minAccountAgeDays}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="No requirement"
                />
              </div>

              <div>
                <label htmlFor="minFollowers" className="block text-sm font-medium mb-2">
                  Minimum Followers
                </label>
                <input
                  type="number"
                  id="minFollowers"
                  name="minFollowers"
                  value={formData.minFollowers}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="No requirement"
                />
              </div>
            </div>

            <div className="flex items-center">
              <label htmlFor="uniqueContent" className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="uniqueContent"
                  name="uniqueContent"
                  checked={formData.uniqueContent}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm font-medium">Require Unique Content</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* SubTasks */}
      <div className="bg-card rounded-lg border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">SubTasks</h2>
          <button
            type="button"
            onClick={addSubTask}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Add SubTask
          </button>
        </div>

        {subTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No subtasks yet. Click &quot;Add SubTask&quot; to create one.
          </p>
        ) : (
          <div className="space-y-4">
            {subTasks.map((subTask, index) => (
              <div key={subTask.id} className="border rounded-lg p-4 space-y-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">SubTask {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeSubTask(subTask.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subTask.title}
                      onChange={(e) => updateSubTask(subTask.id, "title", e.target.value)}
                      required
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Like our tweet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Type
                    </label>
                    <select
                      value={subTask.type}
                      onChange={(e) => updateSubTask(subTask.id, "type", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                    value={subTask.description}
                    onChange={(e) => updateSubTask(subTask.id, "description", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Describe what needs to be done..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Link
                    </label>
                    <input
                      type="url"
                      value={subTask.link}
                      onChange={(e) => updateSubTask(subTask.id, "link", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      value={subTask.xpReward}
                      onChange={(e) => updateSubTask(subTask.id, "xpReward", e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subTask.isUploadProof}
                      onChange={(e) => updateSubTask(subTask.id, "isUploadProof", e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm font-medium">Require Upload Proof</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Updating..." : "Update Task"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
