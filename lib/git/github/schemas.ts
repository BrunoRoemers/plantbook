import { z } from 'zod'

export const GitHubToken = z.string().min(1, 'GitHub token must not be empty').brand('GitHubToken')
export type GitHubToken = z.infer<typeof GitHubToken>

export const GitHubRepo = z
  .string()
  .regex(/^[^/]+\/[^/]+$/, 'Expected format owner/repo')
  .transform((val) => {
    const [owner, name] = val.split('/')
    return { owner, name }
  })
export type GitHubRepo = z.infer<typeof GitHubRepo>

export const GitHubBranch = z
  .string()
  .min(1, 'GitHub branch must not be empty')
  .brand('GitHubBranch')
export type GitHubBranch = z.infer<typeof GitHubBranch>
