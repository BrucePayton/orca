import { defineFixture } from '../../../../component-fixtures/component-fixture'
import { GitHistoryPanel } from './git-history-panel'
import type { GitHistoryResult } from '../../../../../../shared/git-history'

const result: GitHistoryResult = {
  scope: 'branches',
  limit: 50,
  hasMore: true,
  hasIncomingChanges: false,
  hasOutgoingChanges: false,
  currentRef: { id: 'refs/heads/main', name: 'main', revision: 'aaaaaaa', category: 'branches' },
  items: [
    {
      id: 'aaaaaaa',
      parentIds: ['bbbbbbb', 'ccccccc'],
      subject: 'Merge branch graph viewer',
      message: 'Merge branch graph viewer',
      author: 'Ada',
      references: [{ id: 'refs/heads/main', name: 'main', category: 'branches' }]
    },
    {
      id: 'ccccccc',
      parentIds: ['ddddddd'],
      subject: 'Show branch connections',
      message: 'Show branch connections',
      author: 'Lin',
      references: [{ id: 'refs/heads/feature/graph', name: 'feature/graph', category: 'branches' }]
    },
    {
      id: 'bbbbbbb',
      parentIds: ['ddddddd'],
      subject: 'Update project documentation',
      message: 'Update project documentation',
      author: 'Ada',
      references: [
        { id: 'refs/remotes/origin/main', name: 'origin/main', category: 'remote branches' }
      ]
    },
    {
      id: 'ddddddd',
      parentIds: [],
      subject: 'Create project',
      message: 'Create project',
      author: 'Ada'
    }
  ]
}

export const branches = defineFixture({
  width: 420,
  render: () => (
    <GitHistoryPanel
      scope="branches"
      onScopeChange={() => {}}
      onLoadMore={() => {}}
      state={{ status: 'ready', result }}
      collapsed={false}
      onToggle={() => {}}
      onRefresh={() => {}}
    />
  )
})
