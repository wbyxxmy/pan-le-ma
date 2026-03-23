import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '判了吗 / Pan Le Ma',
  description: 'Blockchain-based consent verification',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className="dark">
      <body className="bg-black font-mono">{children}</body>
    </html>
  )
}
