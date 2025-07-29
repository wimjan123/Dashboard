import { TaskIntegration, ExternalTask, TaskSyncStatus, TASK_INTEGRATIONS } from './types'
import TodoistIntegration from './todoist'
import GitHubIntegration from './github'

export class TaskIntegrationManager {
  private integrations: Map<string, TaskIntegration> = new Map()
  private syncStatus: Map<string, TaskSyncStatus> = new Map()

  constructor() {
    // Initialize available integrations
    this.integrations.set('todoist', new TodoistIntegration())
    this.integrations.set('github', new GitHubIntegration())
  }

  getAvailableIntegrations() {
    return TASK_INTEGRATIONS.filter(config => config.enabled)
  }

  getIntegration(id: string): TaskIntegration | undefined {
    return this.integrations.get(id)
  }

  getAuthenticatedIntegrations(): TaskIntegration[] {
    return Array.from(this.integrations.values()).filter(integration => 
      integration.isAuthenticated()
    )
  }

  async syncAllTasks(): Promise<ExternalTask[]> {
    const allTasks: ExternalTask[] = []
    const authenticatedIntegrations = this.getAuthenticatedIntegrations()

    for (const integration of authenticatedIntegrations) {
      try {
        this.updateSyncStatus(integration.config.id, {
          lastSync: new Date().toISOString(),
          status: 'syncing',
          totalTasks: 0
        })

        const tasks = await integration.fetchTasks()
        allTasks.push(...tasks)

        this.updateSyncStatus(integration.config.id, {
          lastSync: new Date().toISOString(),
          status: 'success',
          totalTasks: tasks.length
        })
      } catch (error) {
        console.error(`Failed to sync tasks from ${integration.config.name}:`, error)
        this.updateSyncStatus(integration.config.id, {
          lastSync: new Date().toISOString(),
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          totalTasks: 0
        })
      }
    }

    return allTasks
  }

  async createTaskInIntegration(integrationId: string, task: Partial<ExternalTask>): Promise<ExternalTask> {
    const integration = this.integrations.get(integrationId)
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`)
    }

    if (!integration.isAuthenticated()) {
      throw new Error(`Integration ${integrationId} not authenticated`)
    }

    return await integration.createTask(task)
  }

  async updateTaskInIntegration(integrationId: string, taskId: string, updates: Partial<ExternalTask>): Promise<ExternalTask> {
    const integration = this.integrations.get(integrationId)
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`)
    }

    if (!integration.isAuthenticated()) {
      throw new Error(`Integration ${integrationId} not authenticated`)
    }

    return await integration.updateTask(taskId, updates)
  }

  async deleteTaskInIntegration(integrationId: string, taskId: string): Promise<void> {
    const integration = this.integrations.get(integrationId)
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`)
    }

    if (!integration.isAuthenticated()) {
      throw new Error(`Integration ${integrationId} not authenticated`)
    }

    await integration.deleteTask(taskId)
  }

  getSyncStatus(integrationId: string): TaskSyncStatus | undefined {
    return this.syncStatus.get(integrationId)
  }

  getAllSyncStatuses(): Map<string, TaskSyncStatus> {
    return new Map(this.syncStatus)
  }

  private updateSyncStatus(integrationId: string, status: TaskSyncStatus) {
    this.syncStatus.set(integrationId, status)
  }

  disconnect(integrationId: string): void {
    const integration = this.integrations.get(integrationId)
    if (integration) {
      integration.disconnect()
      this.syncStatus.delete(integrationId)
    }
  }

  // Merge external tasks with local tasks
  mergeTasks(localTasks: any[], externalTasks: ExternalTask[]): any[] {
    const merged = [...localTasks]
    
    // Add external tasks that don't conflict with local ones
    for (const externalTask of externalTasks) {
      const existingIndex = merged.findIndex(task => 
        task.externalId === externalTask.id && task.source === externalTask.source
      )

      if (existingIndex >= 0) {
        // Update existing task with external data
        merged[existingIndex] = {
          ...merged[existingIndex],
          text: externalTask.title,
          completed: externalTask.completed,
          externalData: externalTask,
          lastSync: new Date().toISOString()
        }
      } else {
        // Add new external task
        merged.push({
          id: `external-${externalTask.source}-${externalTask.id}`,
          text: externalTask.title,
          completed: externalTask.completed,
          createdAt: externalTask.createdAt,
          externalId: externalTask.id,
          source: externalTask.source,
          externalData: externalTask,
          isExternal: true,
          lastSync: new Date().toISOString()
        })
      }
    }

    return merged
  }
}

// Singleton instance
export const taskIntegrationManager = new TaskIntegrationManager()