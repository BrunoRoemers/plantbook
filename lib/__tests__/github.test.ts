import { createGitHubCommitService, GitHubToken, GitHubRepo } from '@/lib/github'

/*
 * Mock Octokit
 */

const mockGetRef = jest.fn()
const mockGetCommit = jest.fn()
const mockCreateBlob = jest.fn()
const mockCreateTree = jest.fn()
const mockCreateCommit = jest.fn()
const mockUpdateRef = jest.fn()

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    git: {
      getRef: mockGetRef,
      getCommit: mockGetCommit,
      createBlob: mockCreateBlob,
      createTree: mockCreateTree,
      createCommit: mockCreateCommit,
      updateRef: mockUpdateRef,
    },
  })),
}))

function setupHappyPath(headSha = 'abc123', treeSha = 'tree456', commitSha = 'new789') {
  mockGetRef.mockResolvedValue({ data: { object: { sha: headSha } } })
  mockGetCommit.mockResolvedValue({ data: { tree: { sha: treeSha } } })
  mockCreateBlob.mockResolvedValue({ data: { sha: 'blob-sha' } })
  mockCreateTree.mockResolvedValue({ data: { sha: 'new-tree-sha' } })
  mockCreateCommit.mockResolvedValue({
    data: { sha: commitSha, html_url: `https://github.com/test/repo/commit/${commitSha}` },
  })
  mockUpdateRef.mockResolvedValue({ data: {} })
}

beforeEach(() => {
  jest.clearAllMocks()
})

const token = GitHubToken.parse('ghp_test')
const repo = GitHubRepo.parse('test/repo')
const service = createGitHubCommitService({ token, repo })

describe('branded types', () => {
  it('rejects an invalid repo format', () => {
    expect(() => GitHubRepo.parse('no-slash')).toThrow('owner/repo')
  })

  it('rejects an empty token', () => {
    expect(() => GitHubToken.parse('')).toThrow()
  })
})

describe('commitFiles', () => {
  it('commits a single utf-8 file through the full flow', async () => {
    setupHappyPath()

    const result = await service.commitFiles({
      files: [{ path: 'content/trays/002/index.md', content: '---\nnumber: 2\n---\n' }],
      message: 'Add tray #2',
    })

    expect(result.sha).toBe('new789')
    expect(result.url).toContain('new789')

    expect(mockGetRef).toHaveBeenCalledWith({
      owner: 'test',
      repo: 'repo',
      ref: 'heads/main',
    })

    expect(mockGetCommit).toHaveBeenCalledWith({
      owner: 'test',
      repo: 'repo',
      commit_sha: 'abc123',
    })

    expect(mockCreateBlob).toHaveBeenCalledWith({
      owner: 'test',
      repo: 'repo',
      content: '---\nnumber: 2\n---\n',
      encoding: 'utf-8',
    })

    expect(mockCreateTree).toHaveBeenCalledWith({
      owner: 'test',
      repo: 'repo',
      base_tree: 'tree456',
      tree: [{ path: 'content/trays/002/index.md', mode: '100644', type: 'blob', sha: 'blob-sha' }],
    })

    expect(mockCreateCommit).toHaveBeenCalledWith({
      owner: 'test',
      repo: 'repo',
      message: 'Add tray #2',
      tree: 'new-tree-sha',
      parents: ['abc123'],
    })

    expect(mockUpdateRef).toHaveBeenCalledWith({
      owner: 'test',
      repo: 'repo',
      ref: 'heads/main',
      sha: 'new789',
    })
  })

  it('commits multiple files including base64 images', async () => {
    setupHappyPath()

    await service.commitFiles({
      files: [
        { path: 'content/trays/001/index.md', content: 'updated markdown' },
        { path: 'content/trays/001/images/day-3.jpg', content: 'base64data==', encoding: 'base64' },
      ],
      message: 'Add day 3 update',
    })

    expect(mockCreateBlob).toHaveBeenCalledTimes(2)

    expect(mockCreateBlob).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'base64data==', encoding: 'base64' })
    )

    const treeCall = mockCreateTree.mock.calls[0][0]
    expect(treeCall.tree).toHaveLength(2)
  })

  it('retries once on a 422 race condition', async () => {
    const raceError = Object.assign(new Error('Update is not a fast forward'), { status: 422 })

    /* First attempt: updateRef fails with 422 */
    mockGetRef.mockResolvedValue({ data: { object: { sha: 'old-head' } } })
    mockGetCommit.mockResolvedValue({ data: { tree: { sha: 'old-tree' } } })
    mockCreateBlob.mockResolvedValue({ data: { sha: 'blob' } })
    mockCreateTree.mockResolvedValue({ data: { sha: 'tree' } })
    mockCreateCommit.mockResolvedValue({ data: { sha: 'commit1', html_url: '' } })
    mockUpdateRef.mockRejectedValueOnce(raceError)

    /* Second attempt: succeeds with fresh HEAD */
    mockGetRef.mockResolvedValue({ data: { object: { sha: 'new-head' } } })
    mockGetCommit.mockResolvedValue({ data: { tree: { sha: 'new-tree' } } })
    mockCreateCommit.mockResolvedValue({
      data: { sha: 'commit2', html_url: 'https://github.com/test/repo/commit/commit2' },
    })
    mockUpdateRef.mockResolvedValue({ data: {} })

    const result = await service.commitFiles({
      files: [{ path: 'file.md', content: 'data' }],
      message: 'test',
    })

    expect(result.sha).toBe('commit2')
    expect(mockGetRef).toHaveBeenCalledTimes(2)
    expect(mockUpdateRef).toHaveBeenCalledTimes(2)
  })

  it('throws after exhausting retries on repeated 422', async () => {
    const raceError = Object.assign(new Error('Update is not a fast forward'), { status: 422 })

    mockGetRef.mockResolvedValue({ data: { object: { sha: 'head' } } })
    mockGetCommit.mockResolvedValue({ data: { tree: { sha: 'tree' } } })
    mockCreateBlob.mockResolvedValue({ data: { sha: 'blob' } })
    mockCreateTree.mockResolvedValue({ data: { sha: 'tree' } })
    mockCreateCommit.mockResolvedValue({ data: { sha: 'commit', html_url: '' } })
    mockUpdateRef.mockRejectedValue(raceError)

    await expect(
      service.commitFiles({ files: [{ path: 'f.md', content: '' }], message: 'test' })
    ).rejects.toThrow('Update is not a fast forward')

    /* Initial attempt + 1 retry = 2 total */
    expect(mockUpdateRef).toHaveBeenCalledTimes(2)
  })

  it('throws immediately on non-422 errors', async () => {
    mockGetRef.mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }))

    await expect(
      service.commitFiles({ files: [{ path: 'f.md', content: '' }], message: 'test' })
    ).rejects.toThrow('Not Found')

    expect(mockGetRef).toHaveBeenCalledTimes(1)
  })

  it('defaults encoding to utf-8', async () => {
    setupHappyPath()

    await service.commitFiles({
      files: [{ path: 'readme.md', content: 'hello' }],
      message: 'test',
    })

    expect(mockCreateBlob).toHaveBeenCalledWith(expect.objectContaining({ encoding: 'utf-8' }))
  })
})
