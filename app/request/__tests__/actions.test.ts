import { requestTray } from '../actions'

/*
 * Mocks
 */

const mockCommitFiles = jest.fn()

jest.mock('@/lib/git/github', () => ({
  createGitHubCommitService: () => ({ commitFiles: mockCommitFiles }),
}))

jest.mock('@/lib/env', () => ({
  getServerEncryptionKey: () => 'a'.repeat(64),
  getSeederEncryptionKey: () => 'b'.repeat(64),
  getGitHubToken: () => 'ghp_test',
  getGitHubRepo: () => ({ owner: 'test', name: 'repo' }),
}))

/*
 * Helpers
 */

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const defaults: Record<string, string> = {
    name: 'Alice',
    email: 'alice@example.com',
    contribution_amount: '5',
    contribution_currency: 'EUR',
    message: 'I love herbs!',
  }

  const merged = { ...defaults, ...overrides }
  const fd = new FormData()

  for (const [key, value] of Object.entries(merged)) {
    fd.set(key, value)
  }

  /* Fill all 12 cells with basil by default */
  for (let i = 0; i < 12; i++) {
    fd.set(`cell-${i}`, overrides[`cell-${i}`] ?? 'basil')
  }

  return fd
}

beforeEach(() => {
  jest.clearAllMocks()
  mockCommitFiles.mockResolvedValue({ sha: 'abc123', url: 'https://github.com/test/commit/abc123' })
})

/*
 * Validation
 */

describe('requestTray validation', () => {
  it('rejects missing name', async () => {
    const result = await requestTray(null, makeFormData({ name: '' }))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.validationErrors?.properties?.name).toBeDefined()
    }
  })

  it('rejects invalid email', async () => {
    const result = await requestTray(null, makeFormData({ email: 'not-an-email' }))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.validationErrors?.properties?.email).toBeDefined()
    }
  })

  it('rejects empty cells', async () => {
    const fd = makeFormData()
    fd.set('cell-0', '')
    const result = await requestTray(null, fd)
    expect(result.success).toBe(false)
  })

  it('rejects negative contribution', async () => {
    const result = await requestTray(null, makeFormData({ contribution_amount: '-1' }))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.validationErrors?.properties?.contribution_amount).toBeDefined()
    }
  })
})

/*
 * Happy path
 */

describe('requestTray success', () => {
  it('commits a tray markdown and returns success', async () => {
    const result = await requestTray(null, makeFormData())

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.trayNumber).toBe(2) // content/trays/001 already exists
    expect(result.trayUrl).toBe('/trays/2')

    expect(mockCommitFiles).toHaveBeenCalledTimes(1)
    const call = mockCommitFiles.mock.calls[0][0]
    expect(call.files).toHaveLength(1)
    expect(call.files[0].path).toBe('content/trays/002/index.md')
    expect(call.message).toContain('Alice')
  })

  it('includes encrypted fields in committed markdown', async () => {
    await requestTray(null, makeFormData())

    const markdown = mockCommitFiles.mock.calls[0][0].files[0].content
    expect(markdown).toContain('nurturer_name: Alice')
    expect(markdown).toContain("nurturer_email: 'encrypted:")
    expect(markdown).toContain("seeder_secret: 'encrypted:")
    expect(markdown).toContain("nurturer_secret: 'encrypted:")
    expect(markdown).not.toContain('alice@example.com')
  })

  it('includes the message in the markdown body', async () => {
    await requestTray(null, makeFormData({ message: 'Balcony garden!' }))

    const markdown = mockCommitFiles.mock.calls[0][0].files[0].content
    expect(markdown).toContain('Balcony garden!')
  })

  it('uses default body when no message provided', async () => {
    const fd = makeFormData()
    fd.delete('message')
    await requestTray(null, fd)

    const markdown = mockCommitFiles.mock.calls[0][0].files[0].content
    expect(markdown).toContain('Tray requested!')
  })
})

/*
 * GitHub failure
 */

describe('requestTray GitHub error', () => {
  it('returns a generic error on commit failure', async () => {
    mockCommitFiles.mockRejectedValue(new Error('API down'))
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = await requestTray(null, makeFormData())
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.message).toContain('Something went wrong')
    }
  })
})
