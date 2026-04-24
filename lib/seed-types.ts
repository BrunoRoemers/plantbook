import { z } from 'zod'

/*
 * Schemas
 */

const SeedFrontmatter = z.object({
  name: z.string(),
  variety: z.string(),
  description: z.string(),
  expiry: z.number(),
  quantity: z.string(),
  color: z.string(),
})

export const Seed = SeedFrontmatter.extend({
  slug: z.string(),
})
export type Seed = z.infer<typeof Seed>

export const DEFAULT_SEED_COLOR = '#8d7b68'
