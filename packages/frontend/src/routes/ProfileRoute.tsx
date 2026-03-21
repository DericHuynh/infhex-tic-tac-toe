import { useNavigate } from 'react-router'
import ProfileScreen from '../components/ProfileScreen'
import { useQueryAccount } from '../queryHooks'

function ProfileRoute() {
  const navigate = useNavigate()
  const accountQuery = useQueryAccount({ enabled: true })

  return (
    <ProfileScreen
      account={accountQuery.data?.user ?? null}
      isLoading={accountQuery.isLoading}
      errorMessage={accountQuery.error instanceof Error ? accountQuery.error.message : null}
      onBack={() => void navigate('/')}
      onViewOwnFinishedGames={() => void navigate('/account/games')}
      onViewAdmin={() => void navigate('/admin')}
    />
  )
}

export default ProfileRoute
