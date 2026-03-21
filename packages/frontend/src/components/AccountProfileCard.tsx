import { useEffect, useState } from 'react'
import type { AccountProfile } from '@ih3t/shared'
import { toast } from 'react-toastify'
import { signOutAccount, updateAccountUsername } from '../authClient'
import { queryClient } from '../queryClient'
import { queryKeys } from '../queryHooks'

function showErrorToast(message: string) {
  toast.error(message, {
    toastId: `error:${message}`
  })
}

function showSuccessToast(message: string) {
  toast.success(message, {
    toastId: `success:${message}`
  })
}

interface AccountProfileCardProps {
  account: AccountProfile
  onViewOwnFinishedGames: () => void
  onViewAdmin: () => void
  allowEditingUsername?: boolean
}

function AccountProfileCard({
  account,
  onViewOwnFinishedGames,
  onViewAdmin,
  allowEditingUsername = false
}: Readonly<AccountProfileCardProps>) {
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [draftUsername, setDraftUsername] = useState(account.username)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isSavingUsername, setIsSavingUsername] = useState(false)

  useEffect(() => {
    setDraftUsername(account.username)
    setIsEditingUsername(false)
    setUsernameError(null)
    setIsSavingUsername(false)
  }, [account])

  const handleSignOut = async () => {
    try {
      await signOutAccount()
    } catch (error) {
      console.error('Failed to sign out:', error)
      showErrorToast(error instanceof Error ? error.message : 'Failed to sign out.')
    }
  }

  const saveUsername = async () => {
    if (isSavingUsername) {
      return
    }

    setIsSavingUsername(true)
    setUsernameError(null)

    try {
      const response = await updateAccountUsername(draftUsername)
      queryClient.setQueryData(queryKeys.account, response)
      showSuccessToast('Username updated.')
      setIsEditingUsername(false)
    } catch (error) {
      setUsernameError(error instanceof Error ? error.message : 'Could not update your username.')
    } finally {
      setIsSavingUsername(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {account.image ? (
          <img
            src={account.image}
            alt={account.username}
            className="h-14 w-14 flex-shrink-0 rounded-full object-cover sm:h-16 sm:w-16"
          />
        ) : (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl font-black text-white sm:h-16 sm:w-16">
            {account.username.slice(0, 1).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-[0.28em] text-slate-300">
            {account.role === 'admin' ? 'Admin Account' : 'Signed In With Discord'}
          </div>

          {!allowEditingUsername || !isEditingUsername ? (
            <>
              <div className="mt-1 truncate text-xl font-bold text-white sm:text-2xl">{account.username}</div>
              {account.email && (
                <div className="truncate text-sm text-slate-400">{account.email}</div>
              )}
              <div className="mt-2 text-sm leading-6 text-slate-300">
                {allowEditingUsername
                  ? 'Update your public username and jump straight into your personal pages from here.'
                  : 'Your signed-in account unlocks personal match history and admin tools when available.'}
              </div>
            </>
          ) : (
            <div className="mt-2">
              <label className="block text-xs uppercase tracking-[0.22em] text-slate-400" htmlFor="account-username">
                Username
              </label>
              <input
                id="account-username"
                value={draftUsername}
                onChange={(event) => setDraftUsername(event.target.value)}
                maxLength={32}
                disabled={isSavingUsername}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-base text-white outline-none transition focus:border-sky-300/50"
              />
              {usernameError && (
                <div className="mt-2 text-sm text-rose-200">{usernameError}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
        {allowEditingUsername && (
          isEditingUsername ? (
            <>
              <button
                onClick={() => void saveUsername()}
                disabled={isSavingUsername}
                className="rounded-full bg-sky-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingUsername ? 'Saving' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setDraftUsername(account.username)
                  setIsEditingUsername(false)
                  setUsernameError(null)
                }}
                disabled={isSavingUsername}
                className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setDraftUsername(account.username)
                setIsEditingUsername(true)
                setUsernameError(null)
              }}
              className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/14"
            >
              Edit Username
            </button>
          )
        )}

        <button
          onClick={onViewOwnFinishedGames}
          className="rounded-full border border-sky-300/25 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100 transition hover:bg-sky-400/20"
        >
          Your Match History
        </button>

        {account.role === 'admin' && (
          <button
            onClick={onViewAdmin}
            className="rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-100 transition hover:bg-amber-300/20"
          >
            Admin Controls
          </button>
        )}

        <button
          onClick={() => void handleSignOut()}
          className="rounded-full border border-rose-300/25 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-100 transition hover:bg-rose-500/20"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default AccountProfileCard
