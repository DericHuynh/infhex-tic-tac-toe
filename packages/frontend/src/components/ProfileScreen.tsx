import type { AccountProfile } from '@ih3t/shared'
import { toast } from 'react-toastify'
import { signInWithDiscord } from '../authClient'
import AccountProfileCard from './AccountProfileCard'
import PageCorpus from './PageCorpus'

function showErrorToast(message: string) {
  toast.error(message, {
    toastId: `error:${message}`
  })
}

interface ProfileScreenProps {
  account: AccountProfile | null
  isLoading: boolean
  errorMessage: string | null
}

function ProfileScreen({
  account,
  isLoading,
  errorMessage,
}: Readonly<ProfileScreenProps>) {
  const handleSignIn = async () => {
    try {
      await signInWithDiscord()
    } catch (error) {
      console.error('Failed to start Discord sign in:', error)
      showErrorToast(error instanceof Error ? error.message : 'Failed to start Discord sign in.')
    }
  }

  return (
    <PageCorpus
      category="Profile"
      title="Your Account"
    >
      <div className="min-h-0 flex-1 px-4 pb-4 sm:px-6 sm:pb-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/6 px-6 py-10 text-center text-slate-300">
            Loading your account...
          </div>
        ) : errorMessage ? (
          <div className="rounded-[1.5rem] border border-rose-300/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            {errorMessage}
          </div>
        ) : !account ? (
          <div className="flex h-full items-center justify-center">
            <section className="w-full max-w-2xl rounded-[1.75rem] border border-amber-300/20 bg-amber-300/10 p-6 text-center shadow-[0_20px_80px_rgba(15,23,42,0.35)] sm:p-8">
              <div className="text-xs uppercase tracking-[0.3em] text-amber-100/90">Profile Access</div>
              <h2 className="mt-4 text-3xl font-black uppercase tracking-[0.08em] text-white">Sign In Required</h2>
              <p className="mt-4 text-sm leading-6 text-amber-50/85 sm:text-base">
                Sign in with Discord to manage your username and open your personal match history.
              </p>
              <button
                onClick={() => void handleSignIn()}
                className="mt-6 rounded-full bg-[#5865F2] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#6f7cff]"
              >
                Sign In With Discord
              </button>
            </section>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.35fr,0.85fr]">
            <aside className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-sky-200/80">Account Summary</div>
              <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-white">Profile Details</h2>

              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Role</div>
                  <div className="mt-2 text-lg font-bold text-white">
                    {account.role === 'admin' ? 'Administrator' : 'Player'}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Discord Email</div>
                  <div className="mt-2 break-all text-white">{account.email ?? 'Hidden by Discord'}</div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Profile Id</div>
                  <div className="mt-2 break-all font-mono text-xs text-sky-100">{account.id}</div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </PageCorpus>
  )
}

export default ProfileScreen
