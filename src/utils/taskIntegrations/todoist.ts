import { TaskIntegration, ExternalTask, TASK_INTEGRATIONS } from './types'

class TodoistIntegration implements TaskIntegration {
  config = TASK_INTEGRATIONS.find(config => config.id === 'todoist')!
  private apiKey: string | null = null

  constructor() {
    this.apiKey = localStorage.getItem('todoist-api-key')
  }

  async authenticate(credentials: { apiKey: string }): Promise<boolean> {
    try {
      // Test the API key by making a simple request
      const response = await fetch(`${this.config.baseUrl}/projects`, {
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        this.apiKey = credentials.apiKey
        localStorage.setItem('todoist-api-key', credentials.apiKey)
        return true
      }
      return false
    } catch (error) {
      console.error('Todoist authentication failed:', error)
      return false
    }
  }

  async fetchTasks(): Promise<ExternalTask[]> {
    if (!this.apiKey) throw new Error('Not authenticated')

    try {
      const response = await fetch(`${this.config.baseUrl}/tasks`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch tasks')

      const tasks = await response.json()
      
      return tasks.map((task: any): ExternalTask => ({
        id: task.id,
        title: task.content,
        description: task.description || '',
        completed: task.is_completed,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        dueDate: task.due?.date,
        priority: this.mapPriority(task.priority),
        labels: task.labels || [],
        projectId: task.project_id,
        url: task.url,
        source: 'todoist'
      }))
    } catch (error) {
      console.error('Failed to fetch Todoist tasks:', error)
      throw error
    }
  }

  async createTask(task: Partial<ExternalTask>): Promise<ExternalTask> {
    if (!this.apiKey) throw new Error('Not authenticated')

    try {
      const response = await fetch(`${this.config.baseUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: task.title,
          description: task.description,
          due_date: task.dueDate,
          priority: this.mapPriorityToTodoist(task.priority)
        })
      })

      if (!response.ok) throw new Error('Failed to create task')

      const createdTask = await response.json()
      
      return {
        id: createdTask.id,
        title: createdTask.content,
        description: createdTask.description || '',
        completed: createdTask.is_completed,
        createdAt: createdTask.created_at,
        priority: this.mapPriority(createdTask.priority),
        source: 'todoist'
      }
    } catch (error) {
      console.error('Failed to create Todoist task:', error)
      throw error
    }
  }

  async updateTask(id: string, updates: Partial<ExternalTask>): Promise<ExternalTask> {
    if (!this.apiKey) throw new Error('Not authenticated')

    try {
      const updateData: any = {}
      if (updates.title) updateData.content = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.completed !== undefined) updateData.is_completed = updates.completed
      if (updates.dueDate) updateData.due_date = updates.dueDate
      if (updates.priority) updateData.priority = this.mapPriorityToTodoist(updates.priority)

      const response = await fetch(`${this.config.baseUrl}/tasks/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) throw new Error('Failed to update task')

      // If marking as completed, use the close endpoint
      if (updates.completed) {
        await fetch(`${this.config.baseUrl}/tasks/${id}/close`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        })
      }

      // Fetch the updated task
      const updatedResponse = await fetch(`${this.config.baseUrl}/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const updatedTask = await updatedResponse.json()
      
      return {
        id: updatedTask.id,
        title: updatedTask.content,
        description: updatedTask.description || '',
        completed: updatedTask.is_completed,
        createdAt: updatedTask.created_at,
        updatedAt: updatedTask.updated_at,
        priority: this.mapPriority(updatedTask.priority),
        source: 'todoist'
      }
    } catch (error) {
      console.error('Failed to update Todoist task:', error)
      throw error
    }
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.apiKey) throw new Error('Not authenticated')

    try {
      const response = await fetch(`${this.config.baseUrl}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to delete task')
    } catch (error) {
      console.error('Failed to delete Todoist task:', error)
      throw error
    }
  }

  isAuthenticated(): boolean {
    return !!this.apiKey
  }

  disconnect(): void {
    this.apiKey = null
    localStorage.removeItem('todoist-api-key')
  }

  private mapPriority(todoistPriority: number): 'low' | 'medium' | 'high' {
    if (todoistPriority >= 4) return 'high'
    if (todoistPriority >= 3) return 'medium'
    return 'low'
  }

  private mapPriorityToTodoist(priority?: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'high': return 4
      case 'medium': return 3
      case 'low': return 2
      default: return 1
    }
  }
}

export default TodoistIntegration