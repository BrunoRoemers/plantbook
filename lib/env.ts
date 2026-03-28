import { SeederEncryptionKeyHex, ServerEncryptionKeyHex } from '@/lib/crypto/schemas'
import { GitHubRepo, GitHubToken } from '@/lib/git/github/schemas'

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
  return GitHubRepo.parse(process.env.GITHUB_REPO)
}
