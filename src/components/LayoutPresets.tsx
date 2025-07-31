import React, { useState } from 'react'
import { Layout, Settings, Palette, Maximize2, Minimize2, Square } from 'lucide-react'
import { GlobalSettings, LayoutPreset } from '../hooks/useDynamicTiles'

interface LayoutPresetsProps {
  globalSettings: GlobalSettings
  onUpdateGlobalSettings: (updates: Partial<GlobalSettings>) => void
}

const LayoutPresets: React.FC<LayoutPresetsProps> = ({ globalSettings, onUpdateGlobalSettings }) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const presets = [
    {
      id: 'compact' as LayoutPreset,
      name: 'Compact',
      icon: <Minimize2 className="w-4 h-4" />,
      description: 'More tiles, less spacing',
      settings: { layoutPreset: 'compact' as LayoutPreset, gapSize: 'small' as const }
    },
    {
      id: 'balanced' as LayoutPreset,
      name: 'Balanced',
      icon: <Square className="w-4 h-4" />,
      description: 'Perfect balance of space and content',
      settings: { layoutPreset: 'balanced' as LayoutPreset, gapSize: 'medium' as const }
    },
    {
      id: 'spacious' as LayoutPreset,
      name: 'Spacious',
      icon: <Maximize2 className="w-4 h-4" />,
      description: 'More breathing room, larger tiles',
      settings: { layoutPreset: 'spacious' as LayoutPreset, gapSize: 'large' as const }
    }
  ]

  const themes = [
    { id: 'default', name: 'Default', preview: 'bg-gradient-to-br from-dark-card to-dark-border' },
    { id: 'minimal', name: 'Minimal', preview: 'bg-dark-card border border-dark-border' },
    { id: 'glassmorphism', name: 'Glass', preview: 'bg-dark-card/50 backdrop-blur-sm border border-white/10' },
    { id: 'neon', name: 'Neon', preview: 'bg-dark-card border border-blue-400/50 shadow-lg shadow-blue-500/20' },
    { id: 'vintage', name: 'Vintage', preview: 'bg-amber-50/5 border border-amber-400/30' }
  ]

  const borderRadiusOptions = [
    { id: 'none', name: 'None', preview: 'rounded-none' },
    { id: 'small', name: 'Small', preview: 'rounded-lg' },
    { id: 'medium', name: 'Medium', preview: 'rounded-2xl' },
    { id: 'large', name: 'Large', preview: 'rounded-3xl' }
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layout className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-dark-text">Layout Presets</span>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            showAdvanced 
              ? 'text-blue-400 bg-blue-400/20' 
              : 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-border'
          }`}
          title="Advanced settings"
        >
          <Settings className="w-3 h-3" />
        </button>
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-3 gap-2">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onUpdateGlobalSettings(preset.settings)}
            className={`p-3 rounded-lg border transition-all duration-200 text-left ${
              globalSettings.layoutPreset === preset.id
                ? 'border-blue-400 bg-blue-400/10'
                : 'border-dark-border bg-dark-card hover:border-blue-400/50'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <div className={`${globalSettings.layoutPreset === preset.id ? 'text-blue-400' : 'text-dark-text-secondary'}`}>
                {preset.icon}
              </div>
              <span className="text-sm font-medium text-dark-text">{preset.name}</span>
            </div>
            <p className="text-xs text-dark-text-secondary">{preset.description}</p>
          </button>
        ))}
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-dark-card rounded-lg border border-dark-border">
          {/* Gap Size */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Gap Size</label>
            <div className="grid grid-cols-3 gap-2">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  onClick={() => onUpdateGlobalSettings({ gapSize: size as any })}
                  className={`px-3 py-2 rounded-lg text-xs capitalize transition-colors duration-200 ${
                    globalSettings.gapSize === size
                      ? 'bg-blue-500 text-white'
                      : 'bg-dark-bg text-dark-text hover:bg-dark-border'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Global Theme */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Global Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => onUpdateGlobalSettings({ globalTheme: theme.id as any })}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    globalSettings.globalTheme === theme.id
                      ? 'border-blue-400 bg-blue-400/10'
                      : 'border-dark-border hover:border-blue-400/30'
                  }`}
                >
                  <div className={`w-full h-8 rounded mb-2 ${theme.preview}`}></div>
                  <span className="text-xs text-dark-text">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Border Radius</label>
            <div className="grid grid-cols-4 gap-2">
              {borderRadiusOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => onUpdateGlobalSettings({ borderRadius: option.id as any })}
                  className={`p-3 border transition-all duration-200 ${option.preview} ${
                    globalSettings.borderRadius === option.id
                      ? 'border-blue-400 bg-blue-400/10'
                      : 'border-dark-border bg-dark-card hover:border-blue-400/30'
                  }`}
                >
                  <div className={`w-full h-6 bg-dark-border ${option.preview} mb-1`}></div>
                  <span className="text-xs text-dark-text">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export/Import Settings */}
          <div className="pt-3 border-t border-dark-border">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const settings = { globalSettings }
                  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'dashboard-settings.json'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors duration-200"
              >
                Export Settings
              </button>
              <label className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        try {
                          const settings = JSON.parse(event.target?.result as string)
                          if (settings.globalSettings) {
                            onUpdateGlobalSettings(settings.globalSettings)
                          }
                        } catch (error) {
                          alert('Invalid settings file')
                        }
                      }
                      reader.readAsText(file)
                    }
                  }}
                />
                <div className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors duration-200 text-center cursor-pointer">
                  Import Settings
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LayoutPresets