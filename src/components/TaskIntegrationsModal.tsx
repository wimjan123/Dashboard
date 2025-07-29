import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { taskIntegrationManager } from '../utils/taskIntegrations/manager'
import { TaskIntegrationConfig, TaskSyncStatus } from '../utils/taskIntegrations/types'

interface TaskIntegrationsModalProps {
  isOpen: boolean
  onClose: () => void
  onIntegrationsUpdate: () => void
}

const TaskIntegrationsModal: React.FC<TaskIntegrationsModalProps> = ({
  isOpen,
  onClose,
  onIntegrationsUpdate
}) => {
  const [availableIntegrations, setAvailableIntegrations] = useState<TaskIntegrationConfig[]>([])
  const [authenticatedIntegrations, setAuthenticatedIntegrations] = useState<string[]>([])
  const [syncStatuses, setSyncStatuses] = useState<Map<string, TaskSyncStatus>>(new Map())
  const [showAuthForm, setShowAuthForm] = useState<string | null>(null)
  const [authCredentials, setAuthCredentials] = useState<Record<string, any>>({})
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadIntegrations()
    }
  }, [isOpen])

  const loadIntegrations = () => {
    const available = taskIntegrationManager.getAvailableIntegrations()
    const authenticated = taskIntegrationManager.getAuthenticatedIntegrations()
    const statuses = taskIntegrationManager.getAllSyncStatuses()

    setAvailableIntegrations(available)
    setAuthenticatedIntegrations(authenticated.map(integration => integration.config.id))
    setSyncStatuses(statuses)
  }

  const handleAuthenticate = async (integrationId: string) => {
    setAuthLoading(true)
    setAuthError(null)

    try {
      const integration = taskIntegrationManager.getIntegration(integrationId)
      if (!integration) {
        throw new Error('Integration not found')
      }

      const credentials = authCredentials[integrationId] || {}
      const success = await integration.authenticate(credentials)

      if (success) {
        setShowAuthForm(null)
        setAuthCredentials({})
        loadIntegrations()
        onIntegrationsUpdate()
      } else {
        setAuthError('Authentication failed. Please check your credentials.')
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleDisconnect = (integrationId: string) => {
    taskIntegrationManager.disconnect(integrationId)
    loadIntegrations()
    onIntegrationsUpdate()
  }

  const handleTestSync = async (integrationId: string) => {
    try {
      const integration = taskIntegrationManager.getIntegration(integrationId)
      if (!integration) return

      // Update sync status to show syncing
      setSyncStatuses(prev => new Map(prev.set(integrationId, {
        lastSync: new Date().toISOString(),
        status: 'syncing',
        totalTasks: 0
      })))

      const tasks = await integration.fetchTasks()
      
      setSyncStatuses(prev => new Map(prev.set(integrationId, {
        lastSync: new Date().toISOString(),
        status: 'success',
        totalTasks: tasks.length
      })))

      onIntegrationsUpdate()
    } catch (error) {
      setSyncStatuses(prev => new Map(prev.set(integrationId, {
        lastSync: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Sync failed',
        totalTasks: 0
      })))
    }
  }

  const renderAuthForm = (integration: TaskIntegrationConfig) => {
    const credentials = authCredentials[integration.id] || {}

    return (
      <div className="mt-4 p-4 bg-dark-bg rounded-lg border border-dark-border">
        <h4 className="text-lg font-semibold text-dark-text mb-4">
          Connect to {integration.name}
        </h4>

        {integration.id === 'todoist' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                API Token
              </label>
              <input
                type="password"
                value={credentials.apiKey || ''}
                onChange={(e) => setAuthCredentials({
                  ...authCredentials,
                  [integration.id]: { ...credentials, apiKey: e.target.value }
                })}
                placeholder="Enter your Todoist API token"
                className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200"
              />
              <p className="mt-1 text-xs text-dark-text-secondary">
                Get your API token from{' '}
                <button
                  onClick={() => window.open('https://todoist.com/prefs/integrations', '_blank')}
                  className="text-blue-400 hover:underline"
                >
                  Todoist Settings → Integrations
                </button>
              </p>
            </div>
          </div>
        )}

        {integration.id === 'github' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Personal Access Token
              </label>
              <input
                type="password"
                value={credentials.accessToken || ''}
                onChange={(e) => setAuthCredentials({
                  ...authCredentials,
                  [integration.id]: { ...credentials, accessToken: e.target.value }
                })}
                placeholder="Enter your GitHub personal access token"
                className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Username (optional)
              </label>
              <input
                type="text"
                value={credentials.username || ''}
                onChange={(e) => setAuthCredentials({
                  ...authCredentials,
                  [integration.id]: { ...credentials, username: e.target.value }
                })}
                placeholder="Enter your GitHub username"
                className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200"
              />
              <p className="mt-1 text-xs text-dark-text-secondary">
                Create a token with 'repo' scope at{' '}
                <button
                  onClick={() => window.open('https://github.com/settings/tokens', '_blank')}
                  className="text-blue-400 hover:underline"
                >
                  GitHub Settings → Developer settings → Personal access tokens
                </button>
              </p>
            </div>
          </div>
        )}

        {authError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{authError}</span>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowAuthForm(null)
              setAuthError(null)
              setAuthCredentials({})
            }}
            className="px-4 py-2 text-dark-text-secondary hover:text-dark-text transition-colors duration-200"
            disabled={authLoading}
          >
            Cancel
          </button>
          <button
            onClick={() => handleAuthenticate(integration.id)}
            disabled={authLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 rounded-lg text-white transition-colors duration-200"
          >
            {authLoading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    )
  }

  const getSyncStatusIcon = (status: TaskSyncStatus) => {
    switch (status.status) {
      case 'syncing':
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden border border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Plus className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-dark-text">Task Integrations</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-border transition-colors duration-200"
          >
            <X className="w-5 h-5 text-dark-text-secondary" />
          </button>
        </div>

        {/* Connected Integrations */}
        {authenticatedIntegrations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Connected Services</h3>
            <div className="space-y-3">
              {authenticatedIntegrations.map(integrationId => {
                const integration = availableIntegrations.find(i => i.id === integrationId)
                const syncStatus = syncStatuses.get(integrationId)
                
                if (!integration) return null

                return (
                  <div
                    key={integrationId}
                    className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-dark-border"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-dark-text">{integration.name}</span>
                          {syncStatus && getSyncStatusIcon(syncStatus)}
                        </div>
                        {syncStatus && (
                          <div className="text-xs text-dark-text-secondary">
                            {syncStatus.status === 'success' && `${syncStatus.totalTasks} tasks`}
                            {syncStatus.status === 'error' && syncStatus.error}
                            {syncStatus.status === 'syncing' && 'Syncing...'}
                            {syncStatus.lastSync && (
                              <span className="ml-2">
                                Last sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTestSync(integrationId)}
                        className="p-2 rounded-lg bg-dark-card hover:bg-opacity-80 transition-colors duration-200"
                        title="Test sync"
                      >
                        <RefreshCw className="w-4 h-4 text-dark-text-secondary" />
                      </button>
                      <button
                        onClick={() => handleDisconnect(integrationId)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors duration-200"
                        title="Disconnect"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Available Integrations */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Available Integrations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableIntegrations
              .filter(integration => !authenticatedIntegrations.includes(integration.id))
              .map(integration => (
                <div
                  key={integration.id}
                  className="p-4 bg-dark-bg rounded-lg border border-dark-border hover:border-blue-400/30 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <span className="font-medium text-dark-text">{integration.name}</span>
                        <div className="text-xs text-dark-text-secondary capitalize">
                          {integration.authType} authentication
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowAuthForm(integration.id)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm transition-colors duration-200"
                    >
                      Connect
                    </button>
                  </div>

                  {showAuthForm === integration.id && renderAuthForm(integration)}
                </div>
              ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-400">
              <p className="font-medium mb-1">Task Integration Info</p>
              <p>Connected services will sync their tasks with your dashboard. Changes made here will also sync back to the original service when possible.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-dark-border hover:bg-opacity-80 rounded-lg text-dark-text transition-colors duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskIntegrationsModal