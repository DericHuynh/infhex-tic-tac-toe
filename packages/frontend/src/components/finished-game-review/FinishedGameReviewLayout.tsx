import type { ReactNode } from 'react'
import PageCorpus from '../PageCorpus'

interface FinishedGameReviewLayoutProps {
  onRetry: () => void
  children: ReactNode
}

function FinishedGameReviewLayout({
  onRetry,
  children
}: Readonly<FinishedGameReviewLayoutProps>) {
  return (
    <PageCorpus
      category={"Replay Viewer"}
      title={"Finished Match Review"}

      onRefresh={onRetry}
    >
      <div className="flex flex-col h-full sm:px-6 px-4 overflow-auto object-contain">
        {children}
      </div>
    </PageCorpus>
  )
}

export default FinishedGameReviewLayout
