import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { z } from 'zod'

const SEEDS_DIR = path.join(process.cwd(), 'content/seeds')

/*
 * Schemas
 */

const SeedFrontmatter = z.object({
  name: z.string(),
  description: z.string(),
  color: z.string(),
})

const Seed = SeedFrontmatter.extend({
  slug: z.string(),
})
type Seed = z.infer<typeof Seed>

export { Seed }

export const DEFAULT_SEED_COLOR = '#8d7b68'

/*
 * Queries
 */

export function getAllSeeds(): Seed[] {
  const files = fs.readdirSync(SEEDS_DIR).filter((f) => f.endsWith('.md'))

  return files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(SEEDS_DIR, filename), 'utf8')
      const { data } = matter(raw)
      return Seed.parse({ ...data, slug })
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getSeedMap(): Map<string, Seed> {
  const seeds = getAllSeeds()
  return new Map(seeds.map((s) => [s.slug, s]))
}

export function getSeedBySlug(slug: string): Seed | null {
  const filepath = path.join(SEEDS_DIR, `${slug}.md`)
  if (!fs.existsSync(filepath)) return null

  const raw = fs.readFileSync(filepath, 'utf8')
  const { data } = matter(raw)
  return Seed.parse({ ...data, slug })
}
