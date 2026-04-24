import { EggCarton } from '@/components/egg-carton'
import { getGitHubBranch, getGitHubRepo } from '@/lib/env'
import { getSeedMap } from '@/lib/seeds'
import { getAllTrays } from '@/lib/trays'
import { GitBranch } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const trays = getAllTrays()
  const seedMap = getSeedMap()
  const repo = getGitHubRepo()
  const branch = getGitHubBranch()

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card px-6 py-8 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Plantbook
        </h1>
        <p className="mt-2 text-muted-foreground">
          Seed trays from request to harvest — a community garden logbook.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            href="/request"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Request a tray
          </Link>
          <Link
            href="/seeds"
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Browse seeds
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {trays.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {trays.map((tray) => (
              <Link
                key={tray.frontmatter.number}
                href={`/trays/${tray.frontmatter.number}`}
                className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-heading text-lg font-semibold text-foreground">
                      Tray #{tray.frontmatter.number}
                    </span>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      for {tray.frontmatter.nurturer_name}
                    </p>
                  </div>
                  <time
                    className="shrink-0 text-xs text-muted-foreground"
                    dateTime={tray.frontmatter.created_at}
                  >
                    {new Date(tray.frontmatter.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                </div>

                <div className="mt-4">
                  <EggCarton
                    cells={tray.frontmatter.cells}
                    cellsPerRow={tray.frontmatter.cells_per_row}
                    seedMap={seedMap}
                    size="sm"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card px-6 py-8 text-center">
        <a
          href={`https://github.com/${repo.owner}/${repo.name}/tree/${branch}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitBranch className="h-3.5 w-3.5" />
          {branch}
        </a>
      </footer>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl">🌱</div>
      <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">No trays yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The garden is empty for now. Trays will appear here once someone requests one.
      </p>
    </div>
  )
}
