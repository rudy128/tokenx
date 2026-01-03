"use client"

import { useEffect, useState } from "react"

interface OrganizationInfo {
  organizationId: string
  organization?: { name: string | null; status: string }
}

interface AdminUser {
  id: string
  email: string
  name?: string | null
  role: string
  isBanned: boolean
  twitterUsername?: string | null
  OrganizationMember?: OrganizationInfo[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/users")
      if (!res.ok) {
        throw new Error(`Failed to load users (${res.status})`)
      }
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const toggleBan = async (user: AdminUser) => {
    try {
      const res = await fetch(`/api/users/${user.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ban: !user.isBanned }),
      })
      if (!res.ok) {
        throw new Error(`Failed to ${user.isBanned ? "unban" : "ban"} user`)
      }
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed")
    }
  }

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Delete user ${user.email}? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/users/${user.id}/delete`, { method: "DELETE" })
      if (!res.ok) {
        throw new Error("Failed to delete user")
      }
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed")
    }
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-gray-500">Manage ambassadors and organizations</p>
        </div>
        <button
          className="text-sm px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
          onClick={loadUsers}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Twitter</th>
                <th className="py-2 pr-3">Banned</th>
                <th className="py-2 pr-3">Organizations</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-2 pr-3">{user.email}</td>
                  <td className="py-2 pr-3">{user.role}</td>
                  <td className="py-2 pr-3">{user.twitterUsername || "—"}</td>
                  <td className="py-2 pr-3">{user.isBanned ? "Yes" : "No"}</td>
                  <td className="py-2 pr-3">
                    {user.OrganizationMember?.length
                      ? user.OrganizationMember.map((m) => m.organization?.name || m.organizationId).join(", ")
                      : "—"}
                  </td>
                  <td className="py-2 pr-3 space-x-2">
                    <button
                      className="px-3 py-1 rounded text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => toggleBan(user)}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button
                      className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700"
                      onClick={() => deleteUser(user)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
