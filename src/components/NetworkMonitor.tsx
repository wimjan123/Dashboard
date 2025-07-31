import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Activity, Download, Upload, Globe, Shield } from 'lucide-react'

interface NetworkStats {
  isConnected: boolean
  signalStrength: number
  downloadSpeed: number
  uploadSpeed: number
  latency: number
  dataUsage: { download: number; upload: number }
}

const NetworkMonitor: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats>({
    isConnected: true,
    signalStrength: 85,
    downloadSpeed: 0,
    uploadSpeed: 0,
    latency: 0,
    dataUsage: { download: 0, upload: 0 }
  })
  const [loading, setLoading] = useState(true)

  const generateMockStats = (): NetworkStats => ({
    isConnected: Math.random() > 0.1, // 90% chance of being connected
    signalStrength: Math.floor(Math.random() * 30) + 70, // 70-100%
    downloadSpeed: Math.floor(Math.random() * 50) + 10, // 10-60 Mbps
    uploadSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 Mbps
    latency: Math.floor(Math.random() * 30) + 10, // 10-40ms
    dataUsage: {
      download: Math.floor(Math.random() * 2000) + 500, // 500-2500 MB
      upload: Math.floor(Math.random() * 500) + 100 // 100-600 MB
    }
  })

  useEffect(() => {
    const updateStats = () => {
      setStats(generateMockStats())
      setLoading(false)
    }

    updateStats()
    const interval = setInterval(updateStats, 3000)

    return () => clearInterval(interval)
  }, [])

  const getSignalStrengthColor = (strength: number) => {
    if (strength > 80) return 'text-green-400'
    if (strength > 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSignalBars = (strength: number) => {
    const bars = Math.ceil(strength / 25) // 1-4 bars
    return Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={`w-1 rounded-full ${
          i < bars ? getSignalStrengthColor(strength).replace('text-', 'bg-') : 'bg-dark-border'
        }`}
        style={{ height: `${(i + 1) * 4 + 4}px` }}
      ></div>
    ))
  }

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} GB`
    }
    return `${bytes} MB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {stats.isConnected ? (
            <Wifi className="w-5 h-5 text-emerald-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          <span className="text-sm font-medium text-dark-text">
            {stats.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {getSignalBars(stats.signalStrength)}
        </div>
      </div>

      {stats.isConnected && (
        <>
          {/* Speed Test */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-dark-card rounded-lg border border-dark-border">
              <div className="flex items-center space-x-2 mb-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-dark-text-secondary">Download</span>
              </div>
              <div className="text-lg font-bold text-dark-text">
                {stats.downloadSpeed} <span className="text-xs font-normal">Mbps</span>
              </div>
            </div>
            <div className="p-3 bg-dark-card rounded-lg border border-dark-border">
              <div className="flex items-center space-x-2 mb-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-dark-text-secondary">Upload</span>
              </div>
              <div className="text-lg font-bold text-dark-text">
                {stats.uploadSpeed} <span className="text-xs font-normal">Mbps</span>
              </div>
            </div>
          </div>

          {/* Latency */}
          <div className="p-3 bg-dark-card rounded-lg border border-dark-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-dark-text">Latency</span>
              </div>
              <span className={`text-sm font-medium ${
                stats.latency < 20 ? 'text-green-400' : 
                stats.latency < 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {stats.latency}ms
              </span>
            </div>
          </div>

          {/* Data Usage */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-dark-text">Data Usage Today</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xs text-dark-text-secondary mb-1">Downloaded</div>
                <div className="text-sm font-semibold text-emerald-400">
                  {formatBytes(stats.dataUsage.download)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-dark-text-secondary mb-1">Uploaded</div>
                <div className="text-sm font-semibold text-blue-400">
                  {formatBytes(stats.dataUsage.upload)}
                </div>
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="p-3 bg-dark-card rounded-lg border border-dark-border">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-dark-text">Network Info</span>
            </div>
            <div className="space-y-1 text-xs text-dark-text-secondary">
              <div className="flex justify-between">
                <span>SSID:</span>
                <span className="text-dark-text">Home-WiFi-5G</span>
              </div>
              <div className="flex justify-between">
                <span>IP Address:</span>
                <span className="text-dark-text">192.168.1.105</span>
              </div>
              <div className="flex justify-between">
                <span>DNS:</span>
                <span className="text-dark-text">1.1.1.1</span>
              </div>
            </div>
          </div>
        </>
      )}

      {!stats.isConnected && (
        <div className="text-center py-8">
          <WifiOff className="w-12 h-12 mx-auto mb-3 text-red-400 opacity-50" />
          <p className="text-dark-text-secondary">No network connection</p>
          <button className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors duration-200">
            Reconnect
          </button>
        </div>
      )}
    </div>
  )
}

export default NetworkMonitor