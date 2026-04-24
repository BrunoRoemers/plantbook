import { requestTray } from '../actions'

/*
 * Mocks
 */

const mockCommitFiles = jest.fn()

jest.mock('@/lib/git/github', () => ({
  createGitHubCommitService: () => ({ commitFiles: mockCommitFiles }),
}))

jest.mock('@/lib/trays', () => ({
  getNextTrayNumber: () => 42,
}))

jest.mock('@/lib/env', () => ({
  getServerEncryptionKey: () => 'a'.repeat(64),
  getSeederEncryptionKey: () => 'b'.repeat(64),
  getGitHubToken: () => 'ghp_test',
  getGitHubRepo: () => ({ owner: 'test', name: 'repo' }),
  getGitHubBranch: () => 'main',
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

  /* Fill all 12 cells with arugula-speedy by default */
  for (let i = 0; i < 12; i++) {
    fd.set(`cell-${i}`, overrides[`cell-${i}`] ?? 'arugula-speedy')
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

    expect(result.trayNumber).toBe(42)
    expect(result.trayUrl).toBe('/trays/42')

    expect(mockCommitFiles).toHaveBeenCalledTimes(1)
    const call = mockCommitFiles.mock.calls[0][0]
    expect(call.files).toHaveLength(1)
    expect(call.files[0].path).toBe('content/trays/042/index.md')
    expect(call.message).toContain('Alice')
  })

  it('includes encrypted fields in committed markdown', async () => {
    await requestTray(null, makeFormData())

    const markdown = mockCommitFiles.mock.calls[0][0].files[0].content
    expect(markdown).toContain('nurturer_name: Alice')
    expect(markdown).toMatch(/nurturer_email: '?encrypted:/)
    expect(markdown).toMatch(/seeder_secret: '?encrypted:/)
    expect(markdown).toMatch(/nurturer_secret: '?encrypted:/)
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
 * Sanitization
 */

describe('requestTray sanitization', () => {
  it('neutralizes YAML injection via nurturer_name', async () => {
    await requestTray(null, makeFormData({ name: "evil\nnurturer_email: 'hacked'" }))

    const markdown = mockCommitFiles.mock.calls[0][0].files[0].content
    const fmLines = markdown.split('---')[1].split('\n')
    const emailLines = fmLines.filter((l: string) => l.startsWith('nurturer_email:'))
    expect(emailLines).toHaveLength(1)
    expect(emailLines[0]).not.toContain('hacked')
  })

  it('neutralizes YAML injection via cell values', async () => {
    await requestTray(null, makeFormData({ 'cell-0': "arugula-speedy\ncreated_at: '1999-01-01'" }))

    const markdown = mockCommitFiles.mock.calls[0][0].files[0].content
    const fmLines = markdown.split('---')[1].split('\n')
    const createdLines = fmLines.filter((l: string) => l.startsWith('created_at:'))
    expect(createdLines).toHaveLength(1)
    expect(createdLines[0]).not.toContain('1999')
  })

  it('escapes HTML in the message body', async () => {
    await requestTray(null, makeFormData({ message: '<script>alert("xss")</script>' }))

    const markdown = mockCommitFiles.mock.calls[0][0].files[0].content
    expect(markdown).not.toContain('<script>')
    expect(markdown).toContain('&lt;script&gt;')
  })

  it('escapes HTML tags in message while preserving text', async () => {
    await requestTray(null, makeFormData({ message: 'I <3 herbs & <iframe src="evil.com">' }))

    const markdown = mockCommitFiles.mock.calls[0][0].files[0].content
    expect(markdown).not.toContain('<iframe')
    expect(markdown).toContain('I &lt;3 herbs &amp; &lt;iframe src=&quot;evil.com&quot;&gt;')
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
