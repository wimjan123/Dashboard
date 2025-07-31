import React, { useState } from 'react'
import { X, Plus, Copy, Grid } from 'lucide-react'
import { TileType, TileTypeInfo } from '../hooks/useDynamicTiles'

interface AddTileModalProps {
  isOpen: boolean
  onClose: () => void
  availableTileTypes: TileTypeInfo[]
  existingTiles: { id: string; type: TileType; title: string }[]
  onAddTile: (type: TileType, customTitle?: string, config?: Record<string, any>) => void
  onDuplicateTile: (tileId: string, customTitle?: string) => void
}

const AddTileModal: React.FC<AddTileModalProps> = ({
  isOpen,
  onClose,
  availableTileTypes,
  existingTiles,
  onAddTile,
  onDuplicateTile
}) => {
  const [activeTab, setActiveTab] = useState<'new' | 'duplicate'>('new')
  const [customTitle, setCustomTitle] = useState('')
  const [selectedType, setSelectedType] = useState<TileType | null>(null)
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null)

  const handleAddNewTile = () => {
    if (!selectedType) return

    try {
      onAddTile(selectedType, customTitle.trim() || undefined)
      resetForm()
      onClose()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add tile')
    }
  }

  const handleDuplicateExisting = () => {
    if (!selectedTileId) return

    try {
      onDuplicateTile(selectedTileId, customTitle.trim() || undefined)
      resetForm()
      onClose()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to duplicate tile')
    }
  }

  const resetForm = () => {
    setCustomTitle('')
    setSelectedType(null)
    setSelectedTileId(null)
  }

  const duplicatableTiles = existingTiles.filter(tile => {
    const tileInfo = availableTileTypes.find(t => t.type === tile.type)
    return tileInfo?.allowMultiple
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden border border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Plus className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-dark-text">Add Tile</h2>
          </div>
          <button
            onClick={() => {
              resetForm()
              onClose()
            }}
            className="p-2 rounded-lg hover:bg-dark-border transition-colors duration-200"
          >
            <X className="w-5 h-5 text-dark-text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-dark-border">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 font-medium transition-colors duration-200 border-b-2 ${
              activeTab === 'new'
                ? 'text-blue-400 border-blue-400'
                : 'text-dark-text-secondary border-transparent hover:text-dark-text'
            }`}
          >
            New Tile
          </button>
          <button
            onClick={() => setActiveTab('duplicate')}
            className={`px-4 py-2 font-medium transition-colors duration-200 border-b-2 ${
              activeTab === 'duplicate'
                ? 'text-blue-400 border-blue-400'
                : 'text-dark-text-secondary border-transparent hover:text-dark-text'
            }`}
          >
            Duplicate Existing
          </button>
        </div>

        {/* New Tile Tab */}
        {activeTab === 'new' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-text mb-4">Choose Tile Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableTileTypes.map(tileType => (
                  <button
                    key={tileType.type}
                    onClick={() => setSelectedType(tileType.type)}
                    className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                      selectedType === tileType.type
                        ? 'border-blue-400 bg-blue-500/10'
                        : 'border-dark-border bg-dark-bg hover:border-blue-400/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{tileType.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${tileType.color}`}>
                          {tileType.name}
                        </h4>
                        <p className="text-sm text-dark-text-secondary mt-1">
                          {tileType.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-dark-card rounded text-dark-text-secondary">
                            medium (default)
                          </span>
                          {tileType.allowMultiple && (
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                              Multiple allowed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedType && (
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Custom Title (optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={availableTileTypes.find(t => t.type === selectedType)?.name}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  resetForm()
                  onClose()
                }}
                className="px-6 py-2 text-dark-text-secondary hover:text-dark-text transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewTile}
                disabled={!selectedType}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 disabled:opacity-50 rounded-lg text-white transition-colors duration-200"
              >
                Add Tile
              </button>
            </div>
          </div>
        )}

        {/* Duplicate Tab */}
        {activeTab === 'duplicate' && (
          <div className="space-y-6">
            {duplicatableTiles.length === 0 ? (
              <div className="text-center py-8">
                <Grid className="w-12 h-12 mx-auto mb-3 opacity-50 text-dark-text-secondary" />
                <p className="text-dark-text-secondary">No tiles available for duplication</p>
                <p className="text-sm text-dark-text-secondary mt-1">
                  Some tile types only allow one instance
                </p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-dark-text mb-4">Select Tile to Duplicate</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                    {duplicatableTiles.map(tile => {
                      const tileInfo = availableTileTypes.find(t => t.type === tile.type)
                      return (
                        <button
                          key={tile.id}
                          onClick={() => setSelectedTileId(tile.id)}
                          className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                            selectedTileId === tile.id
                              ? 'border-blue-400 bg-blue-500/10'
                              : 'border-dark-border bg-dark-bg hover:border-blue-400/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{tileInfo?.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-dark-text">{tile.title}</span>
                                <Copy className="w-3 h-3 text-dark-text-secondary" />
                              </div>
                              <span className="text-sm text-dark-text-secondary">{tileInfo?.name}</span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {selectedTileId && (
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Custom Title (optional)
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder={`${existingTiles.find(t => t.id === selectedTileId)?.title} (Copy)`}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      resetForm()
                      onClose()
                    }}
                    className="px-6 py-2 text-dark-text-secondary hover:text-dark-text transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDuplicateExisting}
                    disabled={!selectedTileId}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-700 disabled:opacity-50 rounded-lg text-white transition-colors duration-200"
                  >
                    Duplicate Tile
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddTileModal