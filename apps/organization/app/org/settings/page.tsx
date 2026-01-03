import { getOrgUserWithOrg, hasPermission } from '@/lib/auth'
import Navigation from '@/components/navigation'

export default async function SettingsPage() {
  const data = await getOrgUserWithOrg()
  if (!data) return null

  const canEdit = hasPermission(
    data.membership.permissions as Record<string, boolean> | null,
    'can_edit_org_profile'
  )

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Organization Settings</h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Organization Name</label>
              <p className="text-gray-900">{data.organization.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
              <p className="text-gray-600">{data.organization.description || 'No description'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
              <p>
                {data.organization.isBanned && <span className="text-red-600 font-semibold">Banned</span>}
                {data.organization.isDeleted && <span className="text-red-600 font-semibold">Deleted</span>}
                {!data.organization.isBanned && !data.organization.isDeleted && (
                  <span className="text-green-600 font-semibold">Active</span>
                )}
              </p>
            </div>
          </div>
          {canEdit && (
            <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Edit Settings
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Your Role</label>
              <p className="text-gray-900">{data.membership.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Permissions</label>
              <div className="text-sm text-gray-600">
                {data.membership.permissions && Object.keys(data.membership.permissions).length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(data.membership.permissions).map(([key, value]) =>
                      value ? <li key={key}>{key}</li> : null
                    )}
                  </ul>
                ) : (
                  <p>No specific permissions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
