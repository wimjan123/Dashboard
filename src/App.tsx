import Dashboard from './components/Dashboard'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <Dashboard />
      </div>
    </ThemeProvider>
  )
}

export default App