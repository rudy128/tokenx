import Navigation from '@/components/navigation'
import { redirect } from 'next/navigation'
import { getOrgUserWithOrg } from '@/lib/auth'

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const data = await getOrgUserWithOrg()

  if (!data) {
    redirect('/sign-in')
  }

  if (data.organization.isBanned || data.organization.isDeleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Organization Unavailable</h1>
          <p className="text-gray-600">This organization has been {data.organization.isBanned ? 'banned' : 'deleted'}.</p>
        </div>
      </div>
    )
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>
}

