// Server Component com Edge Runtime para Cloudflare Pages
export const runtime = 'edge'

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

