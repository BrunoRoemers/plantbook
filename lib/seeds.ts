import { Seed } from '@/lib/seed-types'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

const SEEDS_DIR = path.join(process.cwd(), 'content/seeds')

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
  const filepath = path.resolve(SEEDS_DIR, `${slug}.md`)
  if (!filepath.startsWith(SEEDS_DIR + path.sep)) return null
  if (!fs.existsSync(filepath)) return null

  const raw = fs.readFileSync(filepath, 'utf8')
  const { data } = matter(raw)
  return Seed.parse({ ...data, slug })
}
