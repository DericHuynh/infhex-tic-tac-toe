import type { FinishedGameSummary } from '@ih3t/shared'

interface FinishedGamesScreenProps {
  games: FinishedGameSummary[]
  isLoading: boolean
  errorMessage: string | null
  onBack: () => void
  onOpenGame: (gameId: string) => void
  onRefresh: () => void
}

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp))
}

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) {
    return `${seconds}s`
  }

  return `${minutes}m ${seconds}s`
}

function getResultLabel(game: FinishedGameSummary) {
  if (game.reason === 'six-in-a-row') {
    return 'Won by six in a row'
  }

  if (game.reason === 'timeout') {
    return 'Won on time'
  }

  if (game.reason === 'disconnect') {
    return 'Won by disconnect'
  }

  return 'Match terminated'
}

function FinishedGamesScreen({
  games,
  isLoading,
  errorMessage,
  onBack,
  onOpenGame,
  onRefresh
}: Readonly<FinishedGamesScreenProps>) {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.16),_transparent_24%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-200/80">Finished Games</p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.08em] text-white sm:text-5xl">
              Match Archive
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Browse completed matches and open any game to step through every move on the board.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onRefresh}
              className="rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-white/14"
            >
              Refresh
            </button>
            <button
              onClick={onBack}
              className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
            >
              Back To Lobby
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="text-sm uppercase tracking-[0.3em] text-slate-300">Archive Stats</div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Loaded Games</div>
                <div className="mt-2 text-4xl font-black text-white">{games.length}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Stored Moves</div>
                <div className="mt-2 text-4xl font-black text-white">
                  {games.reduce((total, game) => total + game.moveCount, 0)}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-sky-300/15 bg-sky-500/10 p-5 text-sm leading-6 text-sky-100">
              Matches are listed newest first. Open one to scrub through the board state, inspect exact coordinates, and compare move timing.
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.45)] backdrop-blur">
            {isLoading ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center text-slate-300">
                Loading finished games...
              </div>
            ) : errorMessage ? (
              <div className="rounded-3xl border border-rose-300/20 bg-rose-500/10 px-6 py-8 text-center text-rose-100">
                <p className="text-lg font-semibold">Could not load finished games.</p>
                <p className="mt-3 text-sm leading-6 text-rose-100/85">{errorMessage}</p>
              </div>
            ) : games.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center text-slate-300">
                <p className="text-lg font-semibold text-white">No finished games are stored yet.</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Once MongoDB-backed history is available and matches finish, they will show up here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => onOpenGame(game.id)}
                    className="w-full rounded-[1.75rem] border border-white/10 bg-white/6 p-5 text-left transition hover:-translate-y-0.5 hover:border-sky-300/30 hover:bg-white/10"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.28em] text-sky-200/75">Session {game.sessionId}</div>
                        <div className="mt-2 text-2xl font-bold text-white">{getResultLabel(game)}</div>
                        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
                          <span className="rounded-full bg-slate-900/70 px-3 py-1">Moves: {game.moveCount}</span>
                          <span className="rounded-full bg-slate-900/70 px-3 py-1">Duration: {formatDuration(game.gameDurationMs)}</span>
                        </div>
                      </div>

                      <div className="text-sm text-slate-300 sm:text-right">
                        <div className="font-semibold text-white">{formatDateTime(game.finishedAt)}</div>
                        <div className="mt-1">Players: {game.players.length}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default FinishedGamesScreen
