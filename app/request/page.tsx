import { RequestForm } from '@/components/request-form'
import { getAllSeeds } from '@/lib/seeds'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Request a Tray',
  description: 'Request a seed tray and choose what to grow.',
}

export default function RequestPage() {
  const seeds = getAllSeeds()

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card px-6 py-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← All trays
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Request a Tray
          </h1>
          <p className="mt-2 text-muted-foreground">
            Pick your seeds, fill the carton, and the seeder will get planting.
          </p>
        </div>

        <RequestForm seeds={seeds} />
      </main>
    </div>
  )
}
