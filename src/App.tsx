import { BrowserRouter, Link, Outlet, Route, Routes } from 'react-router'
import { Icon } from './components/Icons'
import { NotesProvider } from './context/NotesProvider'
import { NoteDetailsPage } from './pages/NoteDetailsPage'
import { NotesPage } from './pages/NotesPage'
import './App.css'

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Think Board home">
          <span className="brand-mark"><Icon name="note" /></span>
          <span>Think Board</span>
        </Link>
      </header>
      <main className="main-content"><Outlet /></main>
    </div>
  )
}

function App() {
  return (
    <NotesProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<NotesPage />} />
            <Route path="notes/:id" element={<NoteDetailsPage />} />
            <Route path="*" element={<NotesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NotesProvider>
  )
}

export default App
