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
      const arugula = seeds.find((s) => s.slug === 'arugula-speedy')
      expect(arugula).toEqual({
        slug: 'arugula-speedy',
        name: 'Arugula',
        variety: 'Speedy',
        description:
          'Peppery, deeply lobed leaves with an intense nutty bite that elevates any salad.',
        expiry: 2026,
        quantity: '1g',
        color: '#558B2F',
      })
    })
  })

  describe('getSeedBySlug', () => {
    it('returns a seed by slug', () => {
      const seed = getSeedBySlug('spinach')
      expect(seed).toEqual({
        slug: 'spinach',
        name: 'Spinach',
        variety: 'Winterreuzen',
        description: 'Hardy winter spinach with large, dark leaves rich in iron and flavor.',
        expiry: 2029,
        quantity: '14g',
        color: '#2E7D32',
      })
    })

    it('returns null for non-existent slug', () => {
      expect(getSeedBySlug('nonexistent')).toBeNull()
    })
  })
})
