import { getAllTrays, getNextTrayNumber, getTray } from '@/lib/trays'

describe('trays', () => {
  describe('getTray', () => {
    it('returns tray data with all fields', () => {
      const tray = getTray(1)
      expect(tray).not.toBeNull()
      expect(tray!.frontmatter.number).toBe(1)
      expect(tray!.frontmatter.nurturer_name).toBe('Alice')
      expect(tray!.frontmatter.nurturer_email).toBeDefined()
      expect(tray!.frontmatter.seeder_secret).toBeDefined()
      expect(tray!.frontmatter.nurturer_secret).toBeDefined()
    })

    it('returns null for non-existent tray', () => {
      expect(getTray(999)).toBeNull()
    })

    it('includes markdown content', () => {
      const tray = getTray(1)
      expect(tray!.content).toContain('Seeds Requested')
    })

    it('preserves cells array', () => {
      const tray = getTray(1)
      expect(tray!.frontmatter.cells).toHaveLength(12)
      expect(tray!.frontmatter.cells[0]).toBe('tomato-cherry')
    })
  })

  describe('getAllTrays', () => {
    it('returns trays sorted by number descending', () => {
      const trays = getAllTrays()
      expect(trays.length).toBeGreaterThanOrEqual(1)

      for (let i = 1; i < trays.length; i++) {
        expect(trays[i - 1].frontmatter.number).toBeGreaterThan(trays[i].frontmatter.number)
      }
    })
  })

  describe('getNextTrayNumber', () => {
    it('returns one more than the highest existing tray', () => {
      const trays = getAllTrays()
      const maxNumber = Math.max(...trays.map((t) => t.frontmatter.number))
      expect(getNextTrayNumber()).toBe(maxNumber + 1)
    })
  })
})
