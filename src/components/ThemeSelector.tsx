import React, { useState } from 'react'
import { Moon, Sun, Monitor, Palette, X } from 'lucide-react'
import { useTheme, themes } from '../contexts/ThemeContext'

const ThemeSelector: React.FC = () => {
  const { themeId, setTheme, isSystemDark } = useTheme()
  const [showThemeModal, setShowThemeModal] = useState(false)

  const getThemeIcon = (id: string) => {
    switch (id) {
      case 'dark':
        return <Moon className="w-4 h-4" />
      case 'light':
        return <Sun className="w-4 h-4" />
      case 'auto':
        return <Monitor className="w-4 h-4" />
      default:
        return <Palette className="w-4 h-4" />
    }
  }

  const getThemeDescription = (id: string) => {
    switch (id) {
      case 'dark':
        return 'Dark theme for low-light environments'
      case 'light':
        return 'Light theme for bright environments'
      case 'auto':
        return `Follows system preference (currently ${isSystemDark ? 'dark' : 'light'})`
      default:
        return 'Custom theme'
    }
  }

  return (
    <>
      <button
        onClick={() => setShowThemeModal(true)}
        className="p-2 rounded-lg transition-colors duration-200 group"
        style={{ 
          backgroundColor: 'var(--color-card)',
        }}
        title="Change theme"
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
      >
        <div className="flex items-center space-x-2">
          <div style={{ color: 'var(--color-text-secondary)' }}>
            {getThemeIcon(themeId)}
          </div>
          <span className="text-sm group-hover:opacity-80" style={{ color: 'var(--color-text-secondary)' }}>
            Theme
          </span>
        </div>
      </button>

      {/* Theme Selection Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowThemeModal(false)}>
          <div 
            className="glass-effect rounded-xl p-6 border border-blue-400/30 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Choose Theme</h3>
              <button
                onClick={() => setShowThemeModal(false)}
                className="p-1 rounded transition-colors duration-200"
                style={{ 
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-border)'
                  e.currentTarget.style.color = 'var(--color-text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id)
                    setShowThemeModal(false)
                  }}
                  className={`w-full p-4 rounded-lg transition-all duration-200 text-left ${
                    themeId === theme.id
                      ? 'bg-blue-500 bg-opacity-20 border-2 border-blue-500 border-opacity-50'
                      : 'bg-dark-card hover:bg-opacity-80 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      themeId === theme.id ? 'bg-blue-500' : 'bg-dark-border'
                    }`}>
                      {getThemeIcon(theme.id)}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        themeId === theme.id ? 'text-blue-400' : 'text-dark-text'
                      }`}>
                        {theme.name}
                      </div>
                      <div className="text-sm text-dark-text-secondary">
                        {getThemeDescription(theme.id)}
                      </div>
                    </div>
                    {themeId === theme.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>

                  {/* Theme Preview */}
                  <div className="mt-3 flex space-x-2">
                    <div 
                      className="w-6 h-6 rounded border-2 border-dark-border"
                      style={{ backgroundColor: theme.colors.background }}
                    />
                    <div 
                      className="w-6 h-6 rounded border-2 border-dark-border"
                      style={{ backgroundColor: theme.colors.card }}
                    />
                    <div 
                      className="w-6 h-6 rounded border-2 border-dark-border"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-xs text-dark-text-secondary">
              Theme preference is saved and will be remembered across sessions.
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ThemeSelector