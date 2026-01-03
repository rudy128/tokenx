import Navigation from '@/components/navigation'

export default function TaskDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  )
}
