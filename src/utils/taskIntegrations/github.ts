import { TaskIntegration, ExternalTask, TASK_INTEGRATIONS } from './types'

class GitHubIntegration implements TaskIntegration {
  config = TASK_INTEGRATIONS.find(config => config.id === 'github')!
  private accessToken: string | null = null
  private username: string | null = null

  constructor() {
    this.accessToken = localStorage.getItem('github-access-token')
    this.username = localStorage.getItem('github-username')
  }

  async authenticate(credentials: { accessToken: string, username: string }): Promise<boolean> {
    try {
      // Test the access token by fetching user info
      const response = await fetch(`${this.config.baseUrl}/user`, {
        headers: {
          'Authorization': `token ${credentials.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (response.ok) {
        const user = await response.json()
        this.accessToken = credentials.accessToken
        this.username = credentials.username || user.login
        localStorage.setItem('github-access-token', credentials.accessToken)
        localStorage.setItem('github-username', this.username)
        return true
      }
      return false
    } catch (error) {
      console.error('GitHub authentication failed:', error)
      return false
    }
  }

  async fetchTasks(): Promise<ExternalTask[]> {
    if (!this.accessToken || !this.username) throw new Error('Not authenticated')

    try {
      // Fetch assigned issues across all repositories
      const response = await fetch(`${this.config.baseUrl}/search/issues?q=assignee:${this.username}+is:open+is:issue`, {
        headers: {
          'Authorization': `token ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch GitHub issues')

      const data = await response.json()
      
      return data.items.map((issue: any): ExternalTask => ({
        id: issue.id.toString(),
        title: issue.title,
        description: issue.body || '',
        completed: issue.state === 'closed',
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        labels: issue.labels.map((label: any) => label.name),
        projectName: issue.repository?.name || 'Unknown',
        url: issue.html_url,
        source: 'github'
      }))
    } catch (error) {
      console.error('Failed to fetch GitHub issues:', error)
      throw error
    }
  }

  async createTask(task: Partial<ExternalTask>): Promise<ExternalTask> {
    // GitHub issues can only be created in specific repositories
    // This would require additional repository selection logic
    throw new Error('Creating GitHub issues requires repository selection - not implemented in basic integration')
  }

  async updateTask(id: string, updates: Partial<ExternalTask>): Promise<ExternalTask> {
    if (!this.accessToken) throw new Error('Not authenticated')

    try {
      // This is a simplified version - real implementation would need repository info
      // For now, we'll just mark as completed by closing the issue
      if (updates.completed !== undefined) {
        // Would need to determine the repository from the issue
        // This is a placeholder implementation
        throw new Error('Updating GitHub issues requires repository information - not implemented in basic integration')
      }

      throw new Error('GitHub issue updates not fully implemented')
    } catch (error) {
      console.error('Failed to update GitHub issue:', error)
      throw error
    }
  }

  async deleteTask(id: string): Promise<void> {
    // GitHub issues cannot be deleted via API, only closed
    throw new Error('GitHub issues cannot be deleted, only closed')
  }

  isAuthenticated(): boolean {
    return !!(this.accessToken && this.username)
  }

  disconnect(): void {
    this.accessToken = null
    this.username = null
    localStorage.removeItem('github-access-token')
    localStorage.removeItem('github-username')
  }
}

export default GitHubIntegration