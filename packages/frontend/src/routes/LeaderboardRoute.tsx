import { useNavigate } from 'react-router'
import LeaderboardScreen from '../components/LeaderboardScreen'
import { useQueryLeaderboard } from '../queryHooks'

function LeaderboardRoute() {
  const navigate = useNavigate()
  const leaderboardQuery = useQueryLeaderboard({ enabled: true })

  return (
    <LeaderboardScreen
      leaderboard={leaderboardQuery.data ?? null}
      isLoading={leaderboardQuery.isLoading || leaderboardQuery.isRefetching}
      errorMessage={leaderboardQuery.error instanceof Error ? leaderboardQuery.error.message : null}
      onBack={() => void navigate('/')}
      onRefresh={() => void leaderboardQuery.refetch()}
    />
  )
}

export default LeaderboardRoute
