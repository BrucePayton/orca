import { describe, expect, it } from 'vitest'
import { withAgentWorktreePolicy } from './agent-worktree-policy'

describe('agent worktree guidance', () => {
  it('carries the selected baseline and preserves the task verbatim', () => {
    const task = 'Fix this bug\nKeep $HOME and `code` literal.'
    const prompt = withAgentWorktreePolicy(task, { baseline: ' origin/release ' })
    expect(prompt).toContain('"origin/release"')
    expect(prompt.endsWith(task)).toBe(true)
    expect(prompt).toContain('Reuse the task worktree Orca already created')
    expect(prompt).toContain('If refresh fails or the baseline is unknown, stop before editing')
  })

  it('does not duplicate instructions when client and host both prepare the launch', () => {
    const prompt = withAgentWorktreePolicy('Implement it', { baseline: 'origin/develop' })
    expect(withAgentWorktreePolicy(prompt)).toBe(prompt)
  })

  it('requires an explicit baseline when one is not available', () => {
    expect(withAgentWorktreePolicy('Fix it')).toContain('ask the user before development')
  })

  it('does not invent Git or a task in a folder workspace', () => {
    const prompt = withAgentWorktreePolicy('', { workspaceKind: 'folder' })
    expect(prompt).toContain('Do not assume Git exists or initialize a repository')
    expect(prompt).toContain("wait for the user's task")
  })
})
