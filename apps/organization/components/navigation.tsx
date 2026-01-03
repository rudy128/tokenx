import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex gap-8">
        <Link href="/org" className="font-semibold text-gray-900 hover:text-gray-700">
          Dashboard
        </Link>
        <Link href="/org/campaigns" className="text-gray-700 hover:text-gray-900">
          Campaigns
        </Link>
        <Link href="/org/tasks" className="text-gray-700 hover:text-gray-900">
          Tasks
        </Link>
        <Link href="/org/submissions" className="text-gray-700 hover:text-gray-900">
          Submissions
        </Link>
        <Link href="/org/members" className="text-gray-700 hover:text-gray-900">
          Members
        </Link>
        <Link href="/org/settings" className="text-gray-700 hover:text-gray-900">
          Settings
        </Link>
      </div>
      <UserButton />
    </nav>
  )
}
