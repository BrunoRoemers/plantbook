import { getAllSeeds, getSeedBySlug } from '@/lib/seeds'

describe('seeds', () => {
  describe('getAllSeeds', () => {
    it('returns all seed files sorted by name', () => {
      const seeds = getAllSeeds()
      expect(seeds.length).toBeGreaterThanOrEqual(4)

      const names = seeds.map((s) => s.name)
      const sorted = [...names].sort((a, b) => a.localeCompare(b))
      expect(names).toEqual(sorted)
    })

    it('parses frontmatter correctly', () => {
      const seeds = getAllSeeds()
      const tomato = seeds.find((s) => s.slug === 'tomato-cherry')
      expect(tomato).toEqual({
        slug: 'tomato-cherry',
        name: 'Cherry Tomato',
        description: 'Small, sweet tomatoes perfect for salads and snacking.',
      })
    })
  })

  describe('getSeedBySlug', () => {
    it('returns a seed by slug', () => {
      const seed = getSeedBySlug('basil')
      expect(seed).toEqual({
        slug: 'basil',
        name: 'Basil',
        description: 'Fragrant herb essential for Italian cuisine.',
      })
    })

    it('returns null for non-existent slug', () => {
      expect(getSeedBySlug('nonexistent')).toBeNull()
    })
  })
})
