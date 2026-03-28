import { z } from 'zod'

/*
 * Schemas
 */

const SeedFrontmatter = z.object({
  name: z.string(),
  description: z.string(),
  color: z.string(),
})

export const Seed = SeedFrontmatter.extend({
  slug: z.string(),
})
export type Seed = z.infer<typeof Seed>

export const DEFAULT_SEED_COLOR = '#8d7b68'
