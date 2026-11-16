import { describe, expect, it } from 'vitest'
import { resolveWorktreeCreateBaseBranch } from './worktree-create-base'

describe('resolveWorktreeCreateBaseBranch', () => {
  it('uses an explicit Start-from selection', async () => {
    await expect(
      resolveWorktreeCreateBaseBranch({
        explicitBaseBranch: ' origin/feature '
      })
    ).resolves.toBe('origin/feature')
  })

  it('requires a baseline instead of letting the backend guess', async () => {
    await expect(
      resolveWorktreeCreateBaseBranch({
        explicitBaseBranch: undefined
      })
    ).rejects.toThrow('Select a baseline branch')
  })

  it('rejects blank baseline selections', async () => {
    await expect(
      resolveWorktreeCreateBaseBranch({
        explicitBaseBranch: '   '
      })
    ).rejects.toThrow('Select a baseline branch')
  })
})
