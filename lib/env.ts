import { SeederEncryptionKeyHex, ServerEncryptionKeyHex } from '@/lib/crypto'
import { GitHubRepo, GitHubToken } from './github'

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
