import type { CommitFilesParams, CommitResult, FileEntry, GitCommitService } from '@/lib/git'
import { Octokit } from '@octokit/rest'
import { GitHubBranch, GitHubRepo, GitHubToken } from './schemas'

const MAX_RETRIES = 1

export function createGitHubCommitService(options: {
  token: GitHubToken
  repo: GitHubRepo
  branch: GitHubBranch
}): GitCommitService {
  const octokit = new Octokit({ auth: options.token })

  return {
    async commitFiles({ files, message }: CommitFilesParams): Promise<CommitResult> {
      let attempt = 0

      while (true) {
        try {
          return await doCommit(octokit, options.repo, options.branch, files, message)
        } catch (error: unknown) {
          const isRaceCondition =
            error instanceof Error &&
            'status' in error &&
            (error as { status: number }).status === 422

          if (isRaceCondition && attempt < MAX_RETRIES) {
            attempt++
            continue
          }
          throw error
        }
      }
    },
  }
}

async function doCommit(
  octokit: Octokit,
  repo: GitHubRepo,
  branch: GitHubBranch,
  files: FileEntry[],
  message: string
): Promise<CommitResult> {
  /* Step 1: Get current HEAD SHA */
  const {
    data: {
      object: { sha: headSha },
    },
  } = await octokit.git.getRef({ owner: repo.owner, repo: repo.name, ref: `heads/${branch}` })

  /* Step 2: Get the tree SHA from HEAD commit */
  const {
    data: {
      tree: { sha: baseTreeSha },
    },
  } = await octokit.git.getCommit({ owner: repo.owner, repo: repo.name, commit_sha: headSha })

  /* Step 2b: Verify mustNotExist files are absent from the tree */
  const guarded = files.filter((f) => f.mustNotExist)
  if (guarded.length > 0) {
    const {
      data: { tree: treeEntries },
    } = await octokit.git.getTree({
      owner: repo.owner,
      repo: repo.name,
      tree_sha: baseTreeSha,
      recursive: 'true',
    })

    const existingPaths = new Set(treeEntries.map((e: { path?: string }) => e.path))

    for (const file of guarded) {
      if (existingPaths.has(file.path)) {
        throw new Error(`File already exists: ${file.path}`)
      }
    }
  }

  /* Step 3: Create blobs for each file */
  const treeItems = await Promise.all(
    files.map(async (file) => {
      const {
        data: { sha: blobSha },
      } = await octokit.git.createBlob({
        owner: repo.owner,
        repo: repo.name,
        content: file.content,
        encoding: file.encoding ?? 'utf-8',
      })

      return {
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blobSha,
      }
    })
  )

  /* Step 4: Create new tree */
  const {
    data: { sha: newTreeSha },
  } = await octokit.git.createTree({
    owner: repo.owner,
    repo: repo.name,
    base_tree: baseTreeSha,
    tree: treeItems,
  })

  /* Step 5: Create commit */
  const {
    data: { sha: newCommitSha, html_url },
  } = await octokit.git.createCommit({
    owner: repo.owner,
    repo: repo.name,
    message,
    tree: newTreeSha,
    parents: [headSha],
  })

  /* Step 6: Update HEAD ref */
  await octokit.git.updateRef({
    owner: repo.owner,
    repo: repo.name,
    ref: `heads/${branch}`,
    sha: newCommitSha,
  })

  return { sha: newCommitSha, url: html_url }
}
