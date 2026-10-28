import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'
import { GIT_HISTORY_MAX_LIMIT } from '../../../../../../shared/git-history'

export function GitHistoryLoadMore({
  limit,
  loading,
  onLoadMore
}: {
  limit: number
  loading: boolean
  onLoadMore: () => void
}) {
  return (
    <div className="px-3 py-2">
      {limit < GIT_HISTORY_MAX_LIMIT ? (
        <Button variant="ghost" size="sm" disabled={loading} onClick={onLoadMore}>
          {translate('gitHistory.loadMore', 'Load more commits')}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          {translate('gitHistory.limit', 'Showing the latest 200 commits.')}
        </p>
      )}
    </div>
  )
}
