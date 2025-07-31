import React, { useState, useEffect } from 'react'
import { Monitor, Cpu, HardDrive, Activity } from 'lucide-react'

interface SystemStats {
  cpu: number
  memory: number
  disk: number
}

const SystemMonitor: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({ cpu: 0, memory: 0, disk: 0 })
  const [loading, setLoading] = useState(true)

  const generateMockStats = (): SystemStats => ({
    cpu: Math.floor(Math.random() * 80) + 10,
    memory: Math.floor(Math.random() * 70) + 20,
    disk: Math.floor(Math.random() * 60) + 30
  })

  useEffect(() => {
    const updateStats = () => {
      setStats(generateMockStats())
      setLoading(false)
    }

    updateStats()
    const interval = setInterval(updateStats, 2000)

    return () => clearInterval(interval)
  }, [])

  const getColorClass = (percentage: number) => {
    if (percentage > 80) return 'text-red-400 bg-red-400/20'
    if (percentage > 60) return 'text-yellow-400 bg-yellow-400/20'
    return 'text-green-400 bg-green-400/20'
  }

  const getBarColor = (percentage: number) => {
    if (percentage > 80) return 'bg-red-400'
    if (percentage > 60) return 'bg-yellow-400'
    return 'bg-green-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* CPU Usage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-dark-text">CPU</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getColorClass(stats.cpu)}`}>
            {stats.cpu}%
          </span>
        </div>
        <div className="w-full bg-dark-border rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getBarColor(stats.cpu)}`}
            style={{ width: `${stats.cpu}%` }}
          ></div>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-dark-text">Memory</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getColorClass(stats.memory)}`}>
            {stats.memory}%
          </span>
        </div>
        <div className="w-full bg-dark-border rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getBarColor(stats.memory)}`}
            style={{ width: `${stats.memory}%` }}
          ></div>
        </div>
      </div>

      {/* Disk Usage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-dark-text">Disk</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getColorClass(stats.disk)}`}>
            {stats.disk}%
          </span>
        </div>
        <div className="w-full bg-dark-border rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getBarColor(stats.disk)}`}
            style={{ width: `${stats.disk}%` }}
          ></div>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-4 p-3 bg-dark-card rounded-lg border border-dark-border">
        <div className="flex items-center space-x-2 mb-2">
          <Monitor className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-dark-text">System Info</span>
        </div>
        <div className="space-y-1 text-xs text-dark-text-secondary">
          <div className="flex justify-between">
            <span>OS</span>
            <span className="text-dark-text">macOS 14.5</span>
          </div>
          <div className="flex justify-between">
            <span>Uptime</span>
            <span className="text-dark-text">2d 14h 32m</span>
          </div>
          <div className="flex justify-between">
            <span>Load Avg</span>
            <span className="text-dark-text">1.2, 1.5, 1.8</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemMonitor