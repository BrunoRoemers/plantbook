import { z } from 'zod'

/*
 * Schemas
 */

export const FileEntry = z.object({
  path: z.string(),
  content: z.string(),
  encoding: z.enum(['utf-8', 'base64']).default('utf-8'),
})
export type FileEntry = z.input<typeof FileEntry>

/*
 * Service interface — depend on this, not on the Git host
 */

export interface CommitFilesParams {
  files: FileEntry[]
  message: string
}

export interface CommitResult {
  sha: string
  url: string
}

export interface GitCommitService {
  commitFiles(params: CommitFilesParams): Promise<CommitResult>
}
