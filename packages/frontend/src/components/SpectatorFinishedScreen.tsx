import type { SessionFinishReason } from '@ih3t/shared'

interface SpectatorFinishedScreenProps {
  reason: SessionFinishReason | null
  onReturnToLobby: () => void
}

function SpectatorFinishedScreen({ reason, onReturnToLobby }: Readonly<SpectatorFinishedScreenProps>) {
  const message = reason === 'timeout'
    ? 'One player ran out of time, so the match ended.'
    : reason === 'six-in-a-row'
      ? 'A player connected six hexagons in a row.'
      : 'A player disconnected before the match could finish.'

  return (
    <div className="w-full h-full bg-slate-950/46 flex flex-col items-center justify-center p-6 text-white font-sans text-center backdrop-blur-[2px]">
      <div className="w-full max-w-xl rounded-[2rem] border border-sky-300/20 bg-sky-500/16 px-8 py-10 shadow-[0_20px_80px_rgba(14,116,144,0.35)]">
        <h1 className="text-6xl mb-4">Match finished</h1>
        <p className="text-xl">{message}</p>
        <button
          onClick={onReturnToLobby}
          className="mt-6 px-6 py-3 bg-white text-sky-900 border-none rounded cursor-pointer hover:bg-sky-100"
        >
          Return to Lobby
        </button>
      </div>
    </div>
  )
}

export default SpectatorFinishedScreen
