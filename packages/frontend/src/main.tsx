import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import './index.css'
import { appRouter } from './App'
import { queryClient } from './queryClient'
import { installSoundEffects } from './soundEffects'

installSoundEffects()

let root = document.getElementById('root');
if (!root) {
  console.error("Missing DOM root. Using body.");
  root = document.body;
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={appRouter} />
    </QueryClientProvider>
  </StrictMode>,
)
