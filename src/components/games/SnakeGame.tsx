import React, { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCcw, Play, Pause } from 'lucide-react'

interface Position {
  x: number
  y: number
}

interface SnakeGameProps {
  onGameEnd: (score: number, playTime: number) => void
  onPauseChange: (isPaused: boolean) => void
  isPaused: boolean
}

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 0, y: -1 }
const GAME_SPEED = 150

const SnakeGame: React.FC<SnakeGameProps> = ({ onGameEnd, onPauseChange, isPaused }) => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  const gameLoopRef = useRef<number>()
  const directionRef = useRef(direction)

  // Update direction ref when direction changes
  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setFood({ x: 15, y: 15 })
    setDirection(INITIAL_DIRECTION)
    directionRef.current = INITIAL_DIRECTION
    setGameOver(false)
    setScore(0)
    setGameStarted(false)
    setStartTime(0)
    onPauseChange(false)
    
    if (gameLoopRef.current) {
      window.clearInterval(gameLoopRef.current)
    }
  }, [onPauseChange])

  const startGame = useCallback(() => {
    setGameStarted(true)
    setStartTime(Date.now())
  }, [])

  const togglePause = useCallback(() => {
    if (!gameStarted || gameOver) return
    onPauseChange(!isPaused)
  }, [gameStarted, gameOver, isPaused, onPauseChange])

  const moveSnake = useCallback(() => {
    if (!gameStarted || isPaused || gameOver) return

    setSnake(currentSnake => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }
      const currentDirection = directionRef.current

      head.x += currentDirection.x
      head.y += currentDirection.y

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true)
        return currentSnake
      }

      // Check self collision
      if (currentSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        return currentSnake
      }

      newSnake.unshift(head)

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => prevScore + 10)
        setFood(generateFood(newSnake))
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [gameStarted, isPaused, gameOver, food, generateFood])

  // Game loop
  useEffect(() => {
    if (gameStarted && !isPaused && !gameOver) {
      gameLoopRef.current = window.setInterval(moveSnake, GAME_SPEED)
    } else {
      if (gameLoopRef.current) {
        window.clearInterval(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        window.clearInterval(gameLoopRef.current)
      }
    }
  }, [gameStarted, isPaused, gameOver, moveSnake])

  // Handle game end
  useEffect(() => {
    if (gameOver && startTime > 0) {
      const playTime = Math.floor((Date.now() - startTime) / 1000)
      onGameEnd(score, playTime)
    }
  }, [gameOver, score, startTime, onGameEnd])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          if (gameOver) {
            resetGame()
          } else {
            startGame()
          }
        }
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        togglePause()
        return
      }

      const currentDirection = directionRef.current
      let newDirection = currentDirection

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDirection.y === 0) {
            newDirection = { x: 0, y: -1 }
          }
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDirection.y === 0) {
            newDirection = { x: 0, y: 1 }
          }
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDirection.x === 0) {
            newDirection = { x: -1, y: 0 }
          }
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDirection.x === 0) {
            newDirection = { x: 1, y: 0 }
          }
          break
      }

      if (newDirection !== currentDirection) {
        setDirection(newDirection)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameOver, togglePause, resetGame, startGame])

  const getCellClass = (x: number, y: number) => {
    // Check if this cell is the snake head
    if (snake.length > 0 && snake[0].x === x && snake[0].y === y) {
      return 'bg-green-400'
    }
    
    // Check if this cell is part of the snake body
    if (snake.some((segment, index) => index > 0 && segment.x === x && segment.y === y)) {
      return 'bg-green-500'
    }
    
    // Check if this cell is food
    if (food.x === x && food.y === y) {
      return 'bg-red-500 rounded-full'
    }
    
    return 'bg-dark-border'
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      {/* Score */}
      <div className="mb-4 text-center">
        <p className="text-lg font-semibold text-dark-text">Score: {score}</p>
        {gameStarted && startTime > 0 && (
          <p className="text-sm text-dark-text-secondary">
            Time: {Math.floor((Date.now() - startTime) / 1000)}s
          </p>
        )}
      </div>

      {/* Game Grid */}
      <div className="relative">
        <div 
          className="grid gap-0.5 bg-dark-bg p-2 rounded-lg"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE
            const y = Math.floor(index / GRID_SIZE)
            return (
              <div
                key={index}
                className={`w-3 h-3 ${getCellClass(x, y)} transition-colors duration-100`}
              />
            )
          })}
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <p className="text-xl font-bold mb-2">Game Over!</p>
              <p className="mb-4">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {gameStarted && isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <Pause className="w-8 h-8 mx-auto mb-2" />
              <p className="text-lg">Paused</p>
            </div>
          </div>
        )}

        {/* Start Game Overlay */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <p className="text-xl font-bold mb-4">Snake Game</p>
              <button
                onClick={startGame}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Game</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 text-center">
        <p className="text-sm text-dark-text-secondary mb-2">
          Use Arrow Keys or WASD to move
        </p>
        <p className="text-xs text-dark-text-secondary">
          Press Space to pause • Enter to start/restart
        </p>
      </div>
    </div>
  )
}

export default SnakeGame