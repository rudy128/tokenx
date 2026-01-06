"use client";

interface Submission {
  id: string;
  status: string;
  submittedAt: Date | null;
  proofUrl: string | null;
  proofImageUrl: string | null;
  screenshot: string | null;
  description: string | null;
  subTaskId: string | null;
  User: {
    name: string | null;
    email: string | null;
    twitterUsername: string | null;
    xp: number;
  };
  Task: {
    name: string;
    taskType: string | null;
    xpReward: number;
    Campaign: {
      name: string;
      status: string;
    } | null;
    SubTasks: Array<{
      id: string;
      title: string;
      xpReward: number;
      type: string | null;
    }>;
  };
}

interface ExportButtonProps {
  submissions: Submission[];
}

export function ExportButton({ submissions }: ExportButtonProps) {
  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      "Submission ID",
      "User Name",
      "User Email",
      "Twitter Username",
      "User XP",
      "Campaign Name",
      "Campaign Status",
      "Task Name",
      "Task Type",
      "Task XP Reward",
      "Sub-Task Name",
      "Sub-Task XP Reward",
      "Status",
      "Submitted At",
      "Description",
      "Proof URL",
      "Proof Image URL",
      "Screenshot"
    ];

    // Convert submissions to CSV rows
    const rows = submissions.map(submission => {
      // Find the specific subtask if this is a subtask submission
      const subTask = submission.subTaskId 
        ? submission.Task.SubTasks.find(st => st.id === submission.subTaskId)
        : null;

      return [
        submission.id,
        submission.User.name || "N/A",
        submission.User.email || "N/A",
        submission.User.twitterUsername || "N/A",
        submission.User.xp.toString(),
        submission.Task.Campaign?.name || "N/A",
        submission.Task.Campaign?.status || "N/A",
        submission.Task.name,
        submission.Task.taskType || "N/A",
        submission.Task.xpReward.toString(),
        subTask?.title || "N/A",
        subTask?.xpReward.toString() || "N/A",
        submission.status,
        submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "N/A",
        submission.description || "N/A",
        submission.proofUrl || "N/A",
        submission.proofImageUrl || "N/A",
        submission.screenshot || "N/A"
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => {
          // Escape commas and quotes in cell content
          const cellStr = String(cell);
          if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(",")
      )
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `submissions_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={exportToCSV}
      className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className="w-4 h-4"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" 
        />
      </svg>
      Export to CSV
    </button>
  );
}
