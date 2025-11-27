import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Presentación 3D',
  description: 'Presentación generada con IA'
}

export default function PresentationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full h-screen overflow-hidden">
      {children}
    </div>
  )
}
