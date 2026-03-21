import { Navigate, useParams } from 'react-router'
import FinishedGameReviewScreen from '../components/FinishedGameReviewScreen'
import { useQueryFinishedGame } from '../queryHooks'
import { useArchiveRouteState } from './archiveRouteState'

function FinishedGameRoute() {
  const { gameId } = useParams<{ gameId: string }>()
  const archiveRouteState = useArchiveRouteState()
  const finishedGameQuery = useQueryFinishedGame(gameId ?? null, {
    enabled: Boolean(gameId) && Boolean(archiveRouteState)
  })

  if (!gameId) {
    return <Navigate to="/" replace />
  }

  if (!archiveRouteState) {
    return null
  }

  return (
    <FinishedGameReviewScreen
      game={finishedGameQuery.data ?? null}
      isLoading={finishedGameQuery.isLoading}
      errorMessage={finishedGameQuery.error instanceof Error ? finishedGameQuery.error.message : null}
      onRetry={() => void finishedGameQuery.refetch()}
    />
  )
}

export default FinishedGameRoute
