import { useEffect, useState } from 'react'
import type { AdminLeaderboard, AdminLeaderboardPlayer } from '@ih3t/shared'

const winRatioFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

export function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(timestamp)
}

function formatWinRatio(winRatio: number) {
  return winRatioFormatter.format(winRatio)
}

function formatCountdown(remainingMs: number) {
  if (remainingMs <= 0) {
    return 'Refreshing now'
  }

  const totalSeconds = Math.ceil(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function LeaderboardAvatar({ player }: Readonly<{ player: AdminLeaderboardPlayer }>) {
  if (player.image) {
    return (
      <img
        src={player.image}
        alt={player.displayName}
        className="h-10 w-10 flex-shrink-0 rounded-full object-cover sm:h-11 sm:w-11"
      />
    )
  }

  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/8 text-xs font-black text-white sm:h-11 sm:w-11 sm:text-sm">
      {player.displayName.slice(0, 2).toUpperCase()}
    </div>
  )
}

function LeaderboardMetric({
  label,
  value,
  minWidth,
}: Readonly<{
  label: string
  value: string | number
  minWidth: string
}>) {
  return (
    <div className="flex items-baseline gap-1.5 whitespace-nowrap" style={{ minWidth }}>
      <div className="text-sm font-bold text-white sm:text-base text-right">{value}</div>
      <div className="text-[0.58rem] uppercase tracking-[0.16em] text-slate-500 sm:text-[0.62rem]">{label}</div>
    </div >
  )
}

function getRankTone(rank: number) {
  if (rank === 1) {
    return 'border-amber-200/70 bg-amber-300 text-slate-950 shadow-[0_0_0_3px_rgba(251,191,36,0.18)]'
  }

  if (rank === 2) {
    return 'border-slate-100/60 bg-slate-100 text-slate-950 shadow-[0_0_0_3px_rgba(226,232,240,0.12)]'
  }

  if (rank === 3) {
    return 'border-orange-200/60 bg-orange-300 text-slate-950 shadow-[0_0_0_3px_rgba(253,186,116,0.14)]'
  }

  return 'border-white/10 bg-white/8 text-slate-200'
}

function getRowTone(rank: number) {
  if (rank === 1) {
    return 'border-amber-300/35 bg-[linear-gradient(90deg,rgba(251,191,36,0.16),rgba(15,23,42,0.5)_42%)]'
  }

  if (rank === 2) {
    return 'border-slate-200/22 bg-[linear-gradient(90deg,rgba(226,232,240,0.12),rgba(15,23,42,0.5)_42%)]'
  }

  if (rank === 3) {
    return 'border-orange-300/30 bg-[linear-gradient(90deg,rgba(251,146,60,0.14),rgba(15,23,42,0.5)_42%)]'
  }

  return 'border-white/10 bg-slate-950/36'
}

export function LeaderboardSection({
  leaderboard,
  isLoading,
  title = 'Top 10 Players',
  eyebrow = 'Wins Leaderboard',
  description = 'Ranked by total wins across finished game history. Ties fall back to win ratio, then games played.',
  showSnapshot = true
}: Readonly<{
  leaderboard: AdminLeaderboard,
  isLoading: boolean,
  title?: string
  eyebrow?: string
  description?: string
  showSnapshot?: boolean
}>) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-amber-200/80">{eyebrow}</div>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            {description}
          </p>
        </div>
        {showSnapshot && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
            Snapshot {formatDateTime(leaderboard.generatedAt)}
          </div>
        )}
      </div>

      {leaderboard.players.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/35 px-5 py-10 text-center text-sm text-slate-400">
          No completed games yet, so the leaderboard is still empty.
        </div>
      ) : (
        <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
          {leaderboard.players.map((player, index) => {
            const rank = index + 1

            return (
              <div
                key={`${player.profileId}:${rank}`}
                className={`rounded-[1rem] border px-3 py-2.5 sm:rounded-[1.15rem] sm:px-3.5 sm:py-3 ${getRowTone(rank)}`}
              >
                <div className="grid grid-cols-[min-content_1fr] sm:grid-cols-[min-content_min-content_1fr] gap-x-3 gap-y-2 sm:gap-3.5">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-black sm:h-10 sm:w-10 sm:text-sm ${getRankTone(rank)}`}>
                    {rank}
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <LeaderboardAvatar player={player} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-white sm:text-base">{player.displayName}</div>
                      {/* <div className="truncate text-[0.68rem] uppercase tracking-[0.16em] text-slate-500 sm:hidden">
                        {player.profileId}
                      </div> */}
                    </div>
                  </div>

                  <div className="col-start-2 sm:col-span-1 items-center flex w-full justify-center gap-x-4 gap-y-1.5 pt-0.5 text-left sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-x-5 sm:pt-0">
                    <LeaderboardMetric label="Played" minWidth={"4em"} value={player.gamesPlayed} />
                    <LeaderboardMetric label="Won" minWidth={"4em"} value={player.gamesWon} />
                    <LeaderboardMetric label="Ratio" minWidth={"5em"} value={formatWinRatio(player.winRatio)} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <LeaderboardRefreshIndicator leaderboard={leaderboard} isRefreshing={isLoading} />
    </section>
  )
}

export function LeaderboardRefreshIndicator({
  leaderboard,
  isRefreshing
}: Readonly<{
  leaderboard: AdminLeaderboard
  isRefreshing: boolean
}>) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1_000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const windowStart = leaderboard.nextRefreshAt - leaderboard.refreshIntervalMs
  const elapsedRatio = Math.min(1, Math.max(0, (now - windowStart) / leaderboard.refreshIntervalMs))
  const remainingMs = Math.max(0, leaderboard.nextRefreshAt - now)

  return (
    <div className="mt-5 min-w-[10em] w-full rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-emerald-100">
          <span className={`h-2.5 w-2.5 rounded-full ${isRefreshing ? 'animate-pulse bg-amber-300' : 'bg-emerald-300'}`} />
          Leaderboard Refresh
        </div>
        <div className="text-sm font-bold text-white">
          {isRefreshing ? 'Updating...' : formatCountdown(remainingMs)}
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-300 via-emerald-300 to-amber-200 transition-[width] duration-700"
          style={{ width: `${elapsedRatio * 100}%` }}
        />
      </div>
      <div className="mt-3 text-sm text-emerald-50/85">
        Last updated {formatDateTime(leaderboard.generatedAt)}. Next recalculation {formatDateTime(leaderboard.nextRefreshAt)}
      </div>
    </div>
  )
}
