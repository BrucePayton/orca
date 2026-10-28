import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { translate } from '@/i18n/i18n'
import type { GitHistoryScope } from '../../../../../../shared/git-history'

export function GitHistoryScopePicker({
  scope,
  onChange
}: {
  scope: GitHistoryScope
  onChange: (scope: GitHistoryScope) => void
}) {
  return (
    <div className="px-3 py-2">
      <Select
        value={scope}
        onValueChange={(value) => {
          if (value === 'current' || value === 'branches') {
            onChange(value)
          }
        }}
      >
        <SelectTrigger
          size="sm"
          density="compact"
          aria-label={translate('gitHistory.scope', 'History scope')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current">
            {translate('gitHistory.current', 'Current branch')}
          </SelectItem>
          <SelectItem value="branches">
            {translate('gitHistory.branches', 'Project branch graph')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
