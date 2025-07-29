import React, { useState, useEffect } from 'react'
import { Plus, Edit3, X, Globe, Mail, Github, Youtube, Twitter, FileText } from 'lucide-react'

interface Shortcut {
  id: string
  name: string
  url: string
  icon: string
  color: string
}

const Shortcuts: React.FC = () => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', url: '', icon: 'globe', color: 'blue' })

  const iconOptions = [
    { value: 'globe', icon: Globe, label: 'Globe' },
    { value: 'mail', icon: Mail, label: 'Mail' },
    { value: 'github', icon: Github, label: 'GitHub' },
    { value: 'youtube', icon: Youtube, label: 'YouTube' },
    { value: 'twitter', icon: Twitter, label: 'Twitter' },
    { value: 'file', icon: FileText, label: 'File' },
  ]

  const colorOptions = [
    'blue', 'green', 'purple', 'red', 'yellow', 'pink', 'indigo', 'cyan'
  ]

  useEffect(() => {
    const savedShortcuts = localStorage.getItem('dashboard-shortcuts')
    if (savedShortcuts) {
      setShortcuts(JSON.parse(savedShortcuts))
    } else {
      // Default shortcuts
      const defaultShortcuts: Shortcut[] = [
        { id: '1', name: 'Gmail', url: 'https://gmail.com', icon: 'mail', color: 'red' },
        { id: '2', name: 'GitHub', url: 'https://github.com', icon: 'github', color: 'purple' },
        { id: '3', name: 'YouTube', url: 'https://youtube.com', icon: 'youtube', color: 'red' },
        { id: '4', name: 'Twitter', url: 'https://twitter.com', icon: 'twitter', color: 'blue' },
        { id: '5', name: 'Google Drive', url: 'https://drive.google.com', icon: 'file', color: 'yellow' },
        { id: '6', name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'globe', color: 'orange' },
      ]
      setShortcuts(defaultShortcuts)
      localStorage.setItem('dashboard-shortcuts', JSON.stringify(defaultShortcuts))
    }
  }, [])

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (isAdding || editingId)) {
        cancelForm()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isAdding, editingId])

  const saveShortcuts = (updatedShortcuts: Shortcut[]) => {
    setShortcuts(updatedShortcuts)
    localStorage.setItem('dashboard-shortcuts', JSON.stringify(updatedShortcuts))
  }

  const getIcon = (iconName: string) => {
    const iconObj = iconOptions.find(opt => opt.value === iconName)
    if (iconObj) {
      const IconComponent = iconObj.icon
      return <IconComponent className="w-6 h-6" />
    }
    return <Globe className="w-6 h-6" />
  }

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
      yellow: 'from-yellow-500 to-yellow-600',
      pink: 'from-pink-500 to-pink-600',
      indigo: 'from-indigo-500 to-indigo-600',
      cyan: 'from-cyan-500 to-cyan-600',
      orange: 'from-orange-500 to-orange-600',
    }
    return colorMap[color] || colorMap.blue
  }

  const openShortcut = (url: string) => {
    window.open(url, '_blank')
  }

  const startAdd = () => {
    setIsAdding(true)
    setFormData({ name: '', url: '', icon: 'globe', color: 'blue' })
  }

  const startEdit = (shortcut: Shortcut) => {
    setEditingId(shortcut.id)
    setFormData({ name: shortcut.name, url: shortcut.url, icon: shortcut.icon, color: shortcut.color })
  }

  const saveShortcut = () => {
    if (formData.name.trim() && formData.url.trim()) {
      if (isAdding) {
        const newShortcut: Shortcut = {
          id: Date.now().toString(),
          name: formData.name.trim(),
          url: formData.url.trim(),
          icon: formData.icon,
          color: formData.color
        }
        saveShortcuts([...shortcuts, newShortcut])
      } else if (editingId) {
        const updatedShortcuts = shortcuts.map(shortcut =>
          shortcut.id === editingId
            ? { ...shortcut, name: formData.name.trim(), url: formData.url.trim(), icon: formData.icon, color: formData.color }
            : shortcut
        )
        saveShortcuts(updatedShortcuts)
      }
      cancelForm()
    }
  }

  const cancelForm = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: '', url: '', icon: 'globe', color: 'blue' })
  }

  const deleteShortcut = (id: string) => {
    saveShortcuts(shortcuts.filter(shortcut => shortcut.id !== id))
  }

  return (
    <div className="h-full flex flex-col">
      {/* Shortcuts Grid */}
      <div className="grid grid-cols-6 gap-3 mb-4 flex-shrink-0">
        {shortcuts.map((shortcut, index) => (
          <div
            key={shortcut.id}
            className="group relative animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <button
              onClick={() => openShortcut(shortcut.url)}
              className={`w-full aspect-square rounded-xl bg-gradient-to-br ${getColorClass(shortcut.color)} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center p-3`}
            >
              {getIcon(shortcut.icon)}
              <span className="text-xs font-medium mt-2 text-center leading-tight">
                {shortcut.name}
              </span>
            </button>
            
            {/* Edit/Delete buttons */}
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
              <button
                onClick={() => startEdit(shortcut)}
                className="w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <Edit3 className="w-3 h-3 text-white" />
              </button>
              <button
                onClick={() => deleteShortcut(shortcut.id)}
                className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        ))}

        {/* Add Button */}
        <button
          onClick={startAdd}
          className="aspect-square rounded-xl border-2 border-dashed border-dark-border hover:border-blue-400 transition-all duration-300 flex items-center justify-center text-dark-text-secondary hover:text-blue-400 hover:bg-blue-400/10"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Modal Overlay for Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelForm}>
          <div className="glass-effect rounded-xl p-4 border border-blue-400/30 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-dark-text mb-4">
              {isAdding ? 'Add Shortcut' : 'Edit Shortcut'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Shortcut name"
                  className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text mb-1">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-1">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-blue-400 transition-colors duration-200"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text mb-1">Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-blue-400 transition-colors duration-200"
                  >
                    {colorOptions.map(color => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={cancelForm}
                  className="px-4 py-2 text-dark-text-secondary hover:text-dark-text transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveShortcut}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                >
                  {isAdding ? 'Add' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shortcuts