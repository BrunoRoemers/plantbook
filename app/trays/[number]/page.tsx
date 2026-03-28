import { EggCarton } from '@/components/egg-carton'
import { DEFAULT_SEED_COLOR, getSeedMap } from '@/lib/seeds'
import { getAllTrays, getTray } from '@/lib/trays'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import remarkGfm from 'remark-gfm'

export async function generateStaticParams() {
  const trays = getAllTrays()
  return trays.map((t) => ({ number: String(t.frontmatter.number) }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>
}): Promise<Metadata> {
  const { number } = await params
  const tray = getTray(parseInt(number, 10))
  if (!tray) return { title: 'Tray Not Found' }

  return {
    title: `Tray #${tray.frontmatter.number}`,
    description: `Seed tray for ${tray.frontmatter.nurturer_name}`,
  }
}

export default async function TrayPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  const tray = getTray(parseInt(number, 10))
  if (!tray) notFound()

  const { frontmatter, content } = tray
  const seedMap = getSeedMap()
  const trayLabel = `#${frontmatter.number}`

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
            Tray {trayLabel}
          </h1>
          <p className="mt-1 text-muted-foreground">
            for {frontmatter.nurturer_name} · planted{' '}
            <time dateTime={frontmatter.created_at}>
              {new Date(frontmatter.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          </p>
        </div>

        <div className="mb-10">
          <EggCarton
            cells={frontmatter.cells}
            cellsPerRow={frontmatter.cells_per_row}
            seedMap={seedMap}
            size="md"
          />
          <SeedLegend cells={frontmatter.cells} seedMap={seedMap} />
        </div>

        {content.trim() ? (
          <article className="tray-timeline prose prose-neutral max-w-none">
            <MDXRemote source={content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </article>
        ) : (
          <p className="text-sm text-muted-foreground italic">No updates yet.</p>
        )}
      </main>
    </div>
  )
}

function SeedLegend({
  cells,
  seedMap,
}: {
  cells: string[]
  seedMap: Map<string, { name: string; color: string }>
}) {
  const unique = [...new Set(cells)]

  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {unique.map((slug) => {
        const seed = seedMap.get(slug)
        return (
          <div key={slug} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: seed?.color ?? DEFAULT_SEED_COLOR }}
            />
            {seed?.name ?? slug}
          </div>
        )
      })}
    </div>
  )
}
