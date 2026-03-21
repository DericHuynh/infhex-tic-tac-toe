import { useNavigate } from 'react-router'
import LeaderboardScreen from '../components/LeaderboardScreen'
import { useQueryAccount, useQueryLeaderboard } from '../queryHooks'

function LeaderboardRoute() {
  const navigate = useNavigate()
  const accountQuery = useQueryAccount({ enabled: true })
  const leaderboardQuery = useQueryLeaderboard({ enabled: true })

  return (
    <LeaderboardScreen
      leaderboard={leaderboardQuery.data ?? null}
      isLoading={leaderboardQuery.isLoading || leaderboardQuery.isRefetching}
      errorMessage={leaderboardQuery.error instanceof Error ? leaderboardQuery.error.message : null}
      currentUsername={accountQuery.data?.user?.username ?? null}
      onBack={() => void navigate('/')}
    />
  )
}

export default LeaderboardRoute
