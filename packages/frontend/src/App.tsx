import { createBrowserRouter, createRoutesFromElements, Navigate, Outlet, Route } from 'react-router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CommonPageLayout from './components/CommonPageLayout'
import LiveGameRuntime from './components/LiveGameRuntime'
import FinishedGameRoute from './routes/FinishedGameRoute'
import FinishedGamesRoute from './routes/FinishedGamesRoute'
import AdminRoute from './routes/AdminRoute'
import AdminControlsRoute from './routes/AdminControlsRoute'
import LeaderboardRoute from './routes/LeaderboardRoute'
import LobbyRoute from './routes/LobbyRoute'
import ProfileRoute from './routes/ProfileRoute'
import SessionRoute from './routes/SessionRoute'

function AppShell() {
  return (
    <>
      <LiveGameRuntime />
      <Outlet />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </>
  )
}

export const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<AppShell />}>
        <Route element={<CommonPageLayout limitWidth={true} />}>
          <Route path="/" element={<LobbyRoute />} />
          <Route path="/games" element={<FinishedGamesRoute />} />
          <Route path="/games/:gameId" element={<FinishedGameRoute />} />
          <Route path="/account/profile" element={<ProfileRoute />} />
          <Route path="/account/games" element={<FinishedGamesRoute />} />
          <Route path="/account/games/:gameId" element={<FinishedGameRoute />} />
          <Route path="/leaderboard" element={<LeaderboardRoute />} />
          <Route path="/admin" element={<AdminControlsRoute />} />
          <Route path="/admin/stats" element={<AdminRoute />} />
        </Route>
        <Route element={<CommonPageLayout limitWidth={false} />}>
          <Route path="/session/:sessionId" element={<SessionRoute />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  )
)
