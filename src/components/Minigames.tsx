import React, { useState } from 'react'
import { Gamepad2, Trophy, RotateCcw, Pause, Play } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import SnakeGame from './games/SnakeGame'
import Game2048 from './games/Game2048'

interface GameScore {
  game: string
  score: number
  date: string
}

interface GameStats {
  gamesPlayed: number
  totalScore: number
  bestScore: number
  totalPlayTime: number
}

const AVAILABLE_GAMES = [
  {
    id: 'snake',
    name: 'Snake',
    icon: '🐍',
    description: 'Classic snake game with modern controls',
    color: 'bg-green-500'
  },
  {
    id: '2048',
    name: '2048',
    description: 'Slide tiles to reach 2048',
    icon: '🔢',
    color: 'bg-orange-500'
  }
]

const Minigames: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameStats, setGameStats] = useLocalStorage<Record<string, GameStats>>('dashboard-game-stats', {})
  const [highScores, setHighScores] = useLocalStorage<GameScore[]>('dashboard-high-scores', [])
  const [isGamePaused, setIsGamePaused] = useState(false)

  const updateGameStats = (gameId: string, score: number, playTime: number) => {
    const currentStats = gameStats[gameId] || {
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      totalPlayTime: 0
    }

    const updatedStats = {
      gamesPlayed: currentStats.gamesPlayed + 1,
      totalScore: currentStats.totalScore + score,
      bestScore: Math.max(currentStats.bestScore, score),
      totalPlayTime: currentStats.totalPlayTime + playTime
    }

    setGameStats({
      ...gameStats,
      [gameId]: updatedStats
    })

    // Update high scores
    if (score > 0) {
      const newScore: GameScore = {
        game: gameId,
        score,
        date: new Date().toISOString()
      }

      const updatedHighScores = [...highScores, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10) // Keep top 10 scores

      setHighScores(updatedHighScores)
    }
  }

  const resetGameStats = () => {
    setGameStats({})
    setHighScores([])
  }

  const getGameComponent = () => {
    switch (selectedGame) {
      case 'snake':
        return (
          <SnakeGame
            onGameEnd={(score, playTime) => updateGameStats('snake', score, playTime)}
            onPauseChange={setIsGamePaused}
            isPaused={isGamePaused}
          />
        )
      case '2048':
        return (
          <Game2048
            onGameEnd={(score, playTime) => updateGameStats('2048', score, playTime)}
            onPauseChange={setIsGamePaused}
            isPaused={isGamePaused}
          />
        )
      default:
        return null
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTopScores = (gameId: string) => {
    return highScores
      .filter(score => score.game === gameId)
      .slice(0, 3)
  }

  if (selectedGame) {
    const game = AVAILABLE_GAMES.find(g => g.id === selectedGame)
    const stats = gameStats[selectedGame]

    return (
      <div className="h-full flex flex-col">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedGame(null)}
              className="text-dark-text-secondary hover:text-dark-text transition-colors duration-200"
            >
              ← Back
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{game?.icon}</span>
              <h3 className="text-lg font-semibold text-dark-text">{game?.name}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsGamePaused(!isGamePaused)}
              className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors duration-200"
              title={isGamePaused ? 'Resume' : 'Pause'}
            >
              {isGamePaused ? (
                <Play className="w-4 h-4 text-dark-bg" />
              ) : (
                <Pause className="w-4 h-4 text-dark-bg" />
              )}
            </button>
          </div>
        </div>

        {/* Game Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 mb-4 flex-shrink-0">
            <div className="bg-dark-card p-2 rounded text-center">
              <p className="text-xs text-dark-text-secondary">Games</p>
              <p className="text-sm font-semibold text-dark-text">{stats.gamesPlayed}</p>
            </div>
            <div className="bg-dark-card p-2 rounded text-center">
              <p className="text-xs text-dark-text-secondary">Best</p>
              <p className="text-sm font-semibold text-dark-text">{stats.bestScore}</p>
            </div>
            <div className="bg-dark-card p-2 rounded text-center">
              <p className="text-xs text-dark-text-secondary">Avg</p>
              <p className="text-sm font-semibold text-dark-text">
                {stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0}
              </p>
            </div>
            <div className="bg-dark-card p-2 rounded text-center">
              <p className="text-xs text-dark-text-secondary">Time</p>
              <p className="text-sm font-semibold text-dark-text">{formatTime(stats.totalPlayTime)}</p>
            </div>
          </div>
        )}

        {/* Game Container */}
        <div className="flex-1 bg-dark-card rounded-lg overflow-hidden">
          {getGameComponent()}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-dark-text flex items-center space-x-2">
          <Gamepad2 className="w-5 h-5" />
          <span>Mini Games</span>
        </h3>
        
        {Object.keys(gameStats).length > 0 && (
          <button
            onClick={resetGameStats}
            className="p-2 text-dark-text-secondary hover:text-red-400 transition-colors duration-200"
            title="Reset all game statistics"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Game Selection */}
      <div className="grid grid-cols-1 gap-3 mb-4 flex-shrink-0">
        {AVAILABLE_GAMES.map((game) => {
          const stats = gameStats[game.id]
          const topScores = getTopScores(game.id)

          return (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className="p-4 bg-dark-card hover:bg-opacity-80 rounded-lg transition-all duration-200 text-left group border border-dark-border hover:border-blue-400/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div>
                    <h4 className="font-semibold text-dark-text group-hover:text-blue-400 transition-colors duration-200">
                      {game.name}
                    </h4>
                    <p className="text-sm text-dark-text-secondary">
                      {game.description}
                    </p>
                  </div>
                </div>
                
                {stats && (
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-semibold">{stats.bestScore}</span>
                    </div>
                    <p className="text-xs text-dark-text-secondary">
                      {stats.gamesPlayed} games played
                    </p>
                  </div>
                )}
              </div>

              {topScores.length > 0 && (
                <div className="flex items-center space-x-4 text-xs text-dark-text-secondary">
                  <span>Recent high scores:</span>
                  {topScores.map((score, index) => (
                    <span key={index} className="font-medium">
                      {score.score}
                    </span>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Overall Statistics */}
      {Object.keys(gameStats).length > 0 && (
        <div className="bg-dark-card rounded-lg p-4 flex-shrink-0">
          <h4 className="text-sm font-semibold text-dark-text mb-3 flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Overall Statistics</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-dark-text-secondary">Total Games Played</p>
              <p className="font-semibold text-dark-text">
                {Object.values(gameStats).reduce((sum, stats) => sum + stats.gamesPlayed, 0)}
              </p>
            </div>
            <div>
              <p className="text-dark-text-secondary">Total Play Time</p>
              <p className="font-semibold text-dark-text">
                {formatTime(Object.values(gameStats).reduce((sum, stats) => sum + stats.totalPlayTime, 0))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* High Scores */}
      {highScores.length > 0 && (
        <div className="mt-4 bg-dark-card rounded-lg p-4 flex-1 overflow-hidden">
          <h4 className="text-sm font-semibold text-dark-text mb-3">Top Scores</h4>
          <div className="space-y-2 overflow-y-auto scrollbar-thin max-h-32">
            {highScores.slice(0, 5).map((score, index) => {
              const game = AVAILABLE_GAMES.find(g => g.id === score.game)
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 font-semibold">#{index + 1}</span>
                    <span>{game?.icon}</span>
                    <span className="text-dark-text">{game?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-dark-text">{score.score}</span>
                    <p className="text-xs text-dark-text-secondary">
                      {new Date(score.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {Object.keys(gameStats).length === 0 && (
        <div className="flex-1 flex items-center justify-center text-center text-dark-text-secondary">
          <div>
            <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-2">Ready to Play?</p>
            <p className="text-sm">Choose a game above to start playing and tracking your scores!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Minigames