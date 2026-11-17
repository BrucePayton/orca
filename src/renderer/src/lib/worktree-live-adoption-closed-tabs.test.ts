import { describe, expect, it, vi } from 'vitest'
import { createTestStore } from '../store/slices/store-test-helpers'
import { adoptLiveWorkspacePtySurfaces } from './worktree-agent-live-surface-adoption'
import type { LiveTerminalSurfaceOwnerIndex } from './worktree-live-terminal-surface-owners'
import { CLOSED_TERMINAL_TAB_TOMBSTONE_TTL_MS } from '../../../shared/closed-terminal-tab-tombstones'

const CLOSED_TAB = 'closed-tab'
const LEAF = '11111111-1111-4111-8111-111111111111'

describe('workspace activation respects terminal close records', () => {
  it.each(['expired', 'other-workspace'])(
    'still adopts an orphan when its close record is %s',
    async (scope) => {
      const worktreeId = 'repo::/workspace'
      const store = createTestStore()
      store.setState({
        closedTerminalTabTombstonesByTabId: {
          [CLOSED_TAB]: {
            worktreeId: scope === 'other-workspace' ? 'repo::/other' : worktreeId,
            closedAt:
              Date.now() - (scope === 'expired' ? CLOSED_TERMINAL_TAB_TOMBSTONE_TTL_MS + 1 : 0)
          }
        }
      })
      const result = await adoptLiveWorkspacePtySurfaces(
        store.getState,
        worktreeId,
        ['5'],
        async () =>
          new Map([
            [
              '5',
              {
                unowned: true,
                recorded: { tabId: CLOSED_TAB, paneKey: `${CLOSED_TAB}:${LEAF}`, ptyId: '5' }
              }
            ]
          ])
      )

      expect(result).toEqual({ surfaced: true, declinedPtyIds: [] })
      expect(store.getState().tabsByWorktree[worktreeId]).toHaveLength(1)
    }
  )

  it.each(['repo::/workspace', 'folder:workspace'])(
    'does not adopt a closed tab into a new shell on repeated activation of %s',
    async (worktreeId) => {
      const store = createTestStore()
      store.setState({
        closedTerminalTabTombstonesByTabId: {
          [CLOSED_TAB]: { worktreeId, closedAt: Date.now(), reason: 'user' }
        }
      })
      const existing = store.getState().createTab(worktreeId, undefined, undefined, {
        initialPtyId: '1'
      })
      const createTab = vi.spyOn(store.getState(), 'createTab')
      const owners: LiveTerminalSurfaceOwnerIndex = new Map([
        [
          '5',
          {
            unowned: true,
            recorded: { tabId: CLOSED_TAB, paneKey: `${CLOSED_TAB}:${LEAF}`, ptyId: '5' }
          }
        ]
      ])

      for (let activation = 0; activation < 15; activation++) {
        await adoptLiveWorkspacePtySurfaces(
          store.getState,
          worktreeId,
          ['1', '5'],
          async () => owners
        )
      }

      expect(createTab).not.toHaveBeenCalled()
      expect(store.getState().tabsByWorktree[worktreeId]?.map((tab) => tab.id)).toEqual([
        existing.id
      ])
    }
  )

  it('checks closes recorded while the host inventory is in flight', async () => {
    const worktreeId = 'repo::/workspace'
    const store = createTestStore()
    const createTab = vi.spyOn(store.getState(), 'createTab')
    const result = await adoptLiveWorkspacePtySurfaces(
      store.getState,
      worktreeId,
      ['5'],
      async () => {
        store.setState({
          closedTerminalTabTombstonesByTabId: {
            [CLOSED_TAB]: { worktreeId, closedAt: Date.now(), reason: 'user' }
          }
        })
        return new Map([['5', { tabId: CLOSED_TAB, paneKey: `${CLOSED_TAB}:${LEAF}`, ptyId: '5' }]])
      }
    )

    expect(result).toEqual({ surfaced: false, declinedPtyIds: ['5'] })
    expect(createTab).not.toHaveBeenCalled()
  })
})
