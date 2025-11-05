// Layout para garantir Edge Runtime na rota dinâmica
export const runtime = 'edge'

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

