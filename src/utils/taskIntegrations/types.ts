export interface TaskIntegrationConfig {
  id: string
  name: string
  icon: string
  color: string
  authType: 'oauth' | 'apikey' | 'basic'
  authUrl?: string
  baseUrl: string
  enabled: boolean
}

export interface ExternalTask {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt?: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
  labels?: string[]
  projectId?: string
  projectName?: string
  url?: string
  source: string
}

export interface TaskIntegration {
  config: TaskIntegrationConfig
  authenticate: (credentials: any) => Promise<boolean>
  fetchTasks: () => Promise<ExternalTask[]>
  createTask: (task: Partial<ExternalTask>) => Promise<ExternalTask>
  updateTask: (id: string, updates: Partial<ExternalTask>) => Promise<ExternalTask>
  deleteTask: (id: string) => Promise<void>
  isAuthenticated: () => boolean
  disconnect: () => void
}

export interface TaskSyncStatus {
  lastSync: string
  status: 'syncing' | 'success' | 'error' | 'offline'
  error?: string
  totalTasks: number
}

export const TASK_INTEGRATIONS: TaskIntegrationConfig[] = [
  {
    id: 'todoist',
    name: 'Todoist',
    icon: '✓',
    color: 'text-red-500',
    authType: 'apikey',
    baseUrl: 'https://api.todoist.com/rest/v2',
    enabled: true
  },
  {
    id: 'trello',
    name: 'Trello',
    icon: '📋',
    color: 'text-blue-500',
    authType: 'oauth',
    authUrl: 'https://trello.com/1/authorize',
    baseUrl: 'https://api.trello.com/1',
    enabled: true
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    color: 'text-gray-700',
    authType: 'oauth',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    baseUrl: 'https://api.notion.com/v1',
    enabled: true
  },
  {
    id: 'github',
    name: 'GitHub Issues',
    icon: '🐙',
    color: 'text-gray-800',
    authType: 'oauth',
    authUrl: 'https://github.com/login/oauth/authorize',
    baseUrl: 'https://api.github.com',
    enabled: true
  },
  {
    id: 'asana',
    name: 'Asana',
    icon: '🎯',
    color: 'text-purple-500',
    authType: 'oauth',
    authUrl: 'https://app.asana.com/-/oauth_authorize',
    baseUrl: 'https://app.asana.com/api/1.0',
    enabled: true
  },
  {
    id: 'linear',
    name: 'Linear',
    icon: '📐',
    color: 'text-indigo-500',
    authType: 'apikey',
    baseUrl: 'https://api.linear.app/graphql',
    enabled: true
  }
]