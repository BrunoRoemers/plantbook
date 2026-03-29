import { SeederEncryptionKeyHex, ServerEncryptionKeyHex } from '@/lib/crypto/schemas'
import { GitHubBranch, GitHubRepo, GitHubToken } from '@/lib/git/github/schemas'
import { execSync } from 'child_process'

export function getServerEncryptionKey(): ServerEncryptionKeyHex {
  return ServerEncryptionKeyHex.parse(process.env.SERVER_ENCRYPTION_KEY)
}

export function getSeederEncryptionKey(): SeederEncryptionKeyHex {
  return SeederEncryptionKeyHex.parse(process.env.SEEDER_ENCRYPTION_KEY)
}

export function getGitHubToken(): GitHubToken {
  return GitHubToken.parse(process.env.GITHUB_TOKEN)
}

export function getGitHubRepo(): GitHubRepo {
  if (process.env.GITHUB_REPO) {
    return GitHubRepo.parse(process.env.GITHUB_REPO)
  }

  if (process.env.NODE_ENV === 'development') {
    const url = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim()
    const match = url.match(/github\.com[:/](.+?\/.+?)(?:\.git)?$/)
    if (match) return GitHubRepo.parse(match[1])
  }

  throw new Error('failed to get GitHub repo')
}

export function getGitHubBranch(): GitHubBranch {
  if (process.env.GITHUB_BRANCH) {
    return GitHubBranch.parse(process.env.GITHUB_BRANCH)
  }

  if (process.env.VERCEL_GIT_COMMIT_REF) {
    return GitHubBranch.parse(process.env.VERCEL_GIT_COMMIT_REF)
  }

  if (process.env.NODE_ENV === 'development') {
    // NOTE: We check the current branch on every call so the result is accurate even
    //       if the developer changes branches after the dev server is started.
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim()
    return GitHubBranch.parse(branch)
  }

  throw new Error('failed to get GitHub branch')
}
