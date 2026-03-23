import { useState } from 'react'

interface SandboxHudProps {
  positionName: string | null
  isAuthenticated: boolean
  occupiedCellCount: number
  renderableCellCount: number
  onResetBoard: () => void
  onTakeBack: () => void
  onResetView: () => void
  canTakeBack: boolean
  onSharePosition: () => void
  canSharePosition: boolean
  isSharingPosition: boolean
}

function SandboxHud({
  positionName,
  isAuthenticated,
  occupiedCellCount,
  renderableCellCount,
  onResetBoard,
  onTakeBack,
  onResetView,
  canTakeBack,
  onSharePosition,
  canSharePosition,
  isSharingPosition
}: Readonly<SandboxHudProps>) {
  const [isHudOpen, setIsHudOpen] = useState(true)
  const resetBoardLabel = positionName ? 'Restore Position' : 'Clear Board'
  const enabledButtonClassName = 'bg-slate-700 text-white hover:bg-slate-600'
  const disabledButtonClassName = 'cursor-not-allowed bg-slate-700/60 text-slate-400'
  const description = positionName
    ? 'Play from this saved position locally with no clock. Drag to pan, pinch to zoom, right-drag to draw and right-click a line to erase.'
    : 'Local pass-and-play with no clock. Tap to place, drag to pan, pinch to zoom, right-drag to draw and right-click a line to erase.'

  return (
    <>
      {!isHudOpen && (
        <div className="pointer-events-auto absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2 md:bottom-4 md:left-4 md:right-auto md:items-start">
          <button
            onClick={() => setIsHudOpen(true)}
            aria-label="Open sandbox HUD"
            title="Open sandbox HUD"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700/95 shadow-lg transition hover:bg-slate-600"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 8h14" />
              <path d="M5 12h14" />
              <path d="M5 16h14" />
            </svg>
          </button>
        </div>
      )}

      {isHudOpen && (
        <div
          className="
            pointer-events-auto absolute bottom-0 left-0 right-0 w-auto rounded-t-[1.5rem] bg-slate-800 px-4 py-4 pb-4 text-left
            shadow-[0_12px_45px_rgba(15,23,42,0.22)] backdrop-blur-md
            md:left-0 md:w-full md:max-w-sm md:rounded-tl-none md:rounded-tr-[1.5rem]
          "
        >
          <div className="pointer-events-auto absolute right-3 top-3 z-10">
            <button
              onClick={() => setIsHudOpen(false)}
              aria-expanded={isHudOpen}
              aria-label="Close sandbox HUD"
              title="Close sandbox HUD"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700/95 shadow-lg transition hover:bg-slate-600"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6 18 18" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="text-sm uppercase tracking-[0.25em] text-emerald-300">Sandbox Mode</div>
          <h1 className="mt-1 text-2xl font-bold">Infinite Hex Tic-Tac-Toe</h1>
          <div className="mt-2 text-sm text-slate-300">
            {description}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-1">
            <div className="border-l border-white/18 pl-3">
              <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Cells</div>
              <div className="mt-1 text-white">{renderableCellCount} active</div>
              <div className="text-slate-300">{occupiedCellCount} occupied</div>
            </div>

            <div className="border-l border-white/18 pl-3">
              <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                {positionName ? 'Position' : 'Mode'}
              </div>
              {positionName ? (
                <>
                  <div className="mt-1 truncate text-white">{positionName}</div>
                  <div className="text-slate-300">Shared starting position</div>
                </>
              ) : (
                <>
                  <div className="mt-1 text-white">Clean board</div>
                  <div className="text-slate-300">Local free play</div>
                </>
              )}
            </div>
          </div>

          <div className="pointer-events-auto mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={onResetView}
              className={`min-w-[9rem] flex-1 rounded-full px-4 py-2 font-medium shadow-lg transition md:flex-none ${enabledButtonClassName}`}
            >
              Reset View
            </button>
            <button
              onClick={onResetBoard}
              className={`min-w-[9rem] flex-1 rounded-full px-4 py-2 font-medium shadow-lg transition md:flex-none ${enabledButtonClassName}`}
            >
              {resetBoardLabel}
            </button>
            <button
              onClick={onSharePosition}
              disabled={!canSharePosition || isSharingPosition}
              className={`min-w-[9rem] flex-1 rounded-full px-4 py-2 font-medium shadow-lg transition md:flex-none ${canSharePosition && !isSharingPosition
                ? enabledButtonClassName
                : disabledButtonClassName
                }`}
            >
              {isSharingPosition ? 'Sharing...' : 'Share Link'}
            </button>
            <button
              onClick={onTakeBack}
              disabled={!canTakeBack}
              className={`min-w-[9rem] flex-1 rounded-full px-4 py-2 font-medium shadow-lg transition md:flex-none ${canTakeBack
                ? enabledButtonClassName
                : disabledButtonClassName
                }`}
            >
              Take Back
            </button>
          </div>

          {!isAuthenticated && (
            <div className="w-full content-center mt-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-5 py-1 text-sm text-amber-100">
              Sign in to share positions.
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default SandboxHud
