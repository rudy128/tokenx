import Navigation from '@/components/navigation'

export default function CampaignDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  )
}
