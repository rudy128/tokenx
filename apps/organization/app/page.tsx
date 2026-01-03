import { getOrgUserWithOrg } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const data = await getOrgUserWithOrg()
  if (data) {
    redirect('/org')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Organization Portal</h1>
        <p className="text-gray-600 mb-8">Sign in to manage your campaigns and tasks</p>
        <a href="/sign-in" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Sign In
        </a>
      </div>
    </div>
  )
}
