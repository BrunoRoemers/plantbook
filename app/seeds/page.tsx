import { getSeedImage } from '@/lib/seed-images'
import { DEFAULT_SEED_COLOR, type Seed } from '@/lib/seed-types'
import { getAllSeeds } from '@/lib/seeds'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Seed Bank',
  description: 'Browse all seeds available in the plantbook seed bank.',
}

export default function SeedsPage() {
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

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Seed bank
          </h1>
          <p className="mt-1 text-muted-foreground">
            {seeds.length} {seeds.length === 1 ? 'variety' : 'varieties'} ready to plant.
          </p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {seeds.map((seed) => (
            <SeedCard key={seed.slug} seed={seed} />
          ))}
        </ul>
      </main>
    </div>
  )
}

function SeedCard({ seed }: { seed: Seed }) {
  const image = getSeedImage(seed.slug)

  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div
        className="relative aspect-square w-full"
        style={{ backgroundColor: image ? undefined : seed.color }}
      >
        {image ? (
          <Image
            src={image}
            alt={`${seed.name} — ${seed.variety}`}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-heading text-2xl font-semibold text-white/90">
              {seed.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-semibold leading-tight text-foreground">
              {seed.name}
            </h2>
            <p className="text-sm italic text-muted-foreground">{seed.variety}</p>
          </div>
          <span
            className="mt-1 inline-block h-3.5 w-3.5 shrink-0 rounded-sm border border-black/10"
            style={{ backgroundColor: seed.color ?? DEFAULT_SEED_COLOR }}
            aria-hidden
          />
        </div>

        <p className="text-sm leading-relaxed text-foreground/80">{seed.description}</p>

        <dl className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <dt className="sr-only">Quantity</dt>
            <dd>{seed.quantity}</dd>
          </div>
          <span aria-hidden>·</span>
          <div className="flex items-center gap-1">
            <dt className="sr-only">Best before</dt>
            <dd>best before {seed.expiry}</dd>
          </div>
        </dl>
      </div>
    </li>
  )
}
