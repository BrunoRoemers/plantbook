import { type Seed, DEFAULT_SEED_COLOR } from '@/lib/seed-types'
import { cn } from '@/lib/utils'

type EggCartonProps = {
  cells: string[]
  cellsPerRow: number
  seedMap: Map<string, Seed>
  size?: 'sm' | 'md'
}

export function EggCarton({ cells, cellsPerRow, seedMap, size = 'md' }: EggCartonProps) {
  const rows: string[][] = []
  for (let i = 0; i < cells.length; i += cellsPerRow) {
    rows.push(cells.slice(i, i + cellsPerRow))
  }

  return (
    <div
      className={cn(
        'inline-block rounded-lg border-2 border-border bg-card p-1.5 shadow-sm',
        size === 'sm' ? 'gap-1' : 'gap-1.5'
      )}
    >
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={cn(
            'flex',
            size === 'sm' ? 'gap-1' : 'gap-1.5',
            rowIdx > 0 && (size === 'sm' ? 'mt-1' : 'mt-1.5')
          )}
        >
          {row.map((slug, colIdx) => {
            const seed = seedMap.get(slug)
            const color = seed?.color ?? DEFAULT_SEED_COLOR
            const label = seed?.name ?? slug
            return (
              <div
                key={colIdx}
                className={cn(
                  'flex items-center justify-center rounded-md font-medium text-white',
                  size === 'sm'
                    ? 'h-7 w-7 text-[0.5rem] leading-tight'
                    : 'h-11 w-11 text-[0.6rem] leading-tight'
                )}
                style={{ backgroundColor: color }}
                title={label}
              >
                <span className="truncate px-0.5">{label}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
