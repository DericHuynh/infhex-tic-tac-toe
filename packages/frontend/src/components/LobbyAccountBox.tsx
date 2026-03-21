import { useLocation } from 'react-router'
import { toast } from 'react-toastify'
import { signInWithDiscord } from '../authClient'
import { useQueryAccount } from '../queryHooks'
import AccountProfileCard from './AccountProfileCard'

function showErrorToast(message: string) {
  toast.error(message, {
    toastId: `error:${message}`
  })
}

function LobbyAccountSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-20 rounded-full bg-white/10" />
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/10" />
          <div className="min-w-0 flex-1">
            <div className="h-5 w-40 rounded-full bg-white/10" />
            <div className="mt-2 h-4 w-56 max-w-full rounded-full bg-white/10" />
          </div>
        </div>
        <div className="hidden h-9 w-32 rounded-full bg-white/10 sm:block" />
      </div>
    </div>
  )
}


export function LobbyGuestDisplay() {
  const handleSignIn = async () => {
    try {
      await signInWithDiscord()
    } catch (error) {
      console.error('Failed to start Discord sign in:', error)
      showErrorToast(error instanceof Error ? error.message : 'Failed to start Discord sign in.')
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex flex-shrink-0 h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg font-black text-white">
          G
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.28em] text-slate-300">Guest Access</div>
          <div className="mt-1 text-xl font-bold text-white">Play Without An Account</div>
          <div className="mt-1 text-sm text-slate-400">
            Guests can host, join, and spectate. Sign in with Discord if you want a custom username and your own match history page.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => void handleSignIn()}
          className="rounded-full bg-[#5865F2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#6f7cff]"
        >
          Sign In With Discord
        </button>
      </div>
    </div>
  )
}

interface LobbyAccountBoxProps {
  onViewOwnFinishedGames: () => void
  onViewAdmin: () => void
}

function LobbyAccountBox({ onViewOwnFinishedGames, onViewAdmin }: LobbyAccountBoxProps) {
  const location = useLocation()
  const hasPendingInvite = new URLSearchParams(location.search).has('join')
  const accountQuery = useQueryAccount()
  const account = accountQuery.data?.user ?? null

  let inner;
  if (accountQuery.isLoading) {
    inner = <LobbyAccountSkeleton />
  } else if (account) {
    inner = <AccountProfileCard account={account} onViewOwnFinishedGames={onViewOwnFinishedGames} onViewAdmin={onViewAdmin} />
  } else {
    inner = <LobbyGuestDisplay hasPendingInvite={hasPendingInvite} />
  }

  return (
    <div className="lg:col-span-2 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4 text-left sm:rounded-3xl sm:p-5">
      {inner}
    </div>
  )
}

export default LobbyAccountBox
