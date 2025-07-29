import React, { useState, useEffect, useCallback } from 'react'
import { RotateCcw, Play, Pause, Undo } from 'lucide-react'

interface Game2048Props {
  onGameEnd: (score: number, playTime: number) => void
  onPauseChange: (isPaused: boolean) => void
  isPaused: boolean
}

type Board = (number | null)[][]
type Direction = 'up' | 'down' | 'left' | 'right'

interface GameState {
  board: Board
  score: number
  moved: boolean
}

const BOARD_SIZE = 4

const Game2048: React.FC<Game2048Props> = ({ onGameEnd, onPauseChange, isPaused }) => {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard())
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [history, setHistory] = useState<GameState[]>([])
  const [canUndo, setCanUndo] = useState(false)

  function createEmptyBoard(): Board {
    return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  }

  const addRandomNumber = useCallback((currentBoard: Board): Board => {
    const emptyCells: { row: number; col: number }[] = []
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (currentBoard[row][col] === null) {
          emptyCells.push({ row, col })
        }
      }
    }

    if (emptyCells.length === 0) return currentBoard

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    const newBoard = currentBoard.map(row => [...row])
    newBoard[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4

    return newBoard
  }, [])

  const initializeGame = useCallback(() => {
    let newBoard = createEmptyBoard()
    newBoard = addRandomNumber(newBoard)
    newBoard = addRandomNumber(newBoard)
    
    setBoard(newBoard)
    setScore(0)
    setGameOver(false)
    setWon(false)
    setGameStarted(true)
    setStartTime(Date.now())
    setHistory([])
    setCanUndo(false)
    onPauseChange(false)
  }, [addRandomNumber, onPauseChange])

  const saveState = useCallback((currentBoard: Board, currentScore: number) => {
    setHistory(prev => {
      const newHistory = [...prev, { board: currentBoard.map(row => [...row]), score: currentScore, moved: false }]
      return newHistory.slice(-10) // Keep last 10 states
    })
    setCanUndo(true)
  }, [])

  const undoMove = useCallback(() => {
    if (history.length === 0 || !canUndo) return

    const previousState = history[history.length - 1]
    setBoard(previousState.board.map(row => [...row]))
    setScore(previousState.score)
    setHistory(prev => prev.slice(0, -1))
    setCanUndo(history.length > 1)
  }, [history, canUndo])

  const moveLeft = (currentBoard: Board): { board: Board; score: number; moved: boolean } => {
    let newScore = 0
    let moved = false
    const newBoard = currentBoard.map(row => [...row])

    for (let row = 0; row < BOARD_SIZE; row++) {
      const originalRow = [...newBoard[row]]
      const filteredRow = newBoard[row].filter(cell => cell !== null)
      
      // Merge adjacent identical numbers
      const mergedRow: (number | null)[] = [...filteredRow]
      for (let col = 0; col < mergedRow.length - 1; col++) {
        if (mergedRow[col] !== null && mergedRow[col] === mergedRow[col + 1]) {
          const mergedValue = mergedRow[col]! * 2
          mergedRow[col] = mergedValue
          mergedRow[col + 1] = null
          newScore += mergedValue
          
          if (mergedValue === 2048) {
            setWon(true)
          }
        }
      }
      
      // Remove nulls and pad with nulls at the end
      const finalRow: (number | null)[] = mergedRow.filter(cell => cell !== null)
      while (finalRow.length < BOARD_SIZE) {
        finalRow.push(null)
      }
      
      newBoard[row] = finalRow
      
      // Check if row changed
      if (!moved && !arraysEqual(originalRow, finalRow)) {
        moved = true
      }
    }

    return { board: newBoard, score: newScore, moved }
  }

  const moveRight = (currentBoard: Board): { board: Board; score: number; moved: boolean } => {
    const flippedBoard = currentBoard.map(row => [...row].reverse())
    const result = moveLeft(flippedBoard)
    return {
      ...result,
      board: result.board.map(row => [...row].reverse())
    }
  }

  const moveUp = (currentBoard: Board): { board: Board; score: number; moved: boolean } => {
    const transposedBoard = transpose(currentBoard)
    const result = moveLeft(transposedBoard)
    return {
      ...result,
      board: transpose(result.board)
    }
  }

  const moveDown = (currentBoard: Board): { board: Board; score: number; moved: boolean } => {
    const transposedBoard = transpose(currentBoard)
    const result = moveRight(transposedBoard)
    return {
      ...result,
      board: transpose(result.board)
    }
  }

  const transpose = (matrix: Board): Board => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]))
  }

  const arraysEqual = (a: (number | null)[], b: (number | null)[]): boolean => {
    return a.length === b.length && a.every((val, index) => val === b[index])
  }

  const move = useCallback((direction: Direction) => {
    if (!gameStarted || isPaused || gameOver) return

    saveState(board, score)

    let result: { board: Board; score: number; moved: boolean }

    switch (direction) {
      case 'left':
        result = moveLeft(board)
        break
      case 'right':
        result = moveRight(board)
        break
      case 'up':
        result = moveUp(board)
        break
      case 'down':
        result = moveDown(board)
        break
    }

    if (result.moved) {
      const newBoard = addRandomNumber(result.board)
      setBoard(newBoard)
      setScore(prevScore => prevScore + result.score)

      // Check if game is over
      if (!canMove(newBoard)) {
        setGameOver(true)
      }
    }
  }, [board, score, gameStarted, isPaused, gameOver, addRandomNumber, saveState])

  const canMove = (currentBoard: Board): boolean => {
    // Check for empty cells
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (currentBoard[row][col] === null) return true
      }
    }

    // Check for possible merges
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const current = currentBoard[row][col]
        if (
          (col < BOARD_SIZE - 1 && current === currentBoard[row][col + 1]) ||
          (row < BOARD_SIZE - 1 && current === currentBoard[row + 1][col])
        ) {
          return true
        }
      }
    }

    return false
  }

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
      if (!gameStarted) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          initializeGame()
        }
        return
      }

      if (gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          initializeGame()
        }
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        onPauseChange(!isPaused)
        return
      }

      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault()
        undoMove()
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          move('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          move('right')
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          move('up')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          move('down')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameOver, isPaused, move, initializeGame, onPauseChange, undoMove])

  const getTileClass = (value: number | null): string => {
    if (!value) return 'bg-dark-border'
    
    const colorMap: Record<number, string> = {
      2: 'bg-gray-200 text-gray-800',
      4: 'bg-gray-300 text-gray-800',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-orange-500 text-white',
      64: 'bg-red-400 text-white',
      128: 'bg-yellow-400 text-white',
      256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white',
      1024: 'bg-blue-400 text-white',
      2048: 'bg-blue-500 text-white',
    }
    
    return colorMap[value] || 'bg-purple-500 text-white'
  }

  const getFontSize = (value: number | null): string => {
    if (!value) return ''
    if (value >= 1000) return 'text-xs'
    if (value >= 100) return 'text-sm'
    return 'text-base'
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      {/* Score and Controls */}
      <div className="mb-4 flex items-center justify-between w-full max-w-xs">
        <div className="text-center">
          <p className="text-lg font-semibold text-dark-text">Score: {score}</p>
          {gameStarted && startTime > 0 && (
            <p className="text-sm text-dark-text-secondary">
              Time: {Math.floor((Date.now() - startTime) / 1000)}s
            </p>
          )}
        </div>
        
        {gameStarted && !gameOver && (
          <button
            onClick={undoMove}
            disabled={!canUndo}
            className="p-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
            title="Undo last move"
          >
            <Undo className="w-4 h-4 text-dark-bg" />
          </button>
        )}
      </div>

      {/* Game Grid */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-2 bg-dark-bg p-4 rounded-lg">
          {board.flat().map((value, index) => (
            <div
              key={index}
              className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold transition-all duration-200 ${getTileClass(value)} ${getFontSize(value)}`}
            >
              {value || ''}
            </div>
          ))}
        </div>

        {/* Win Overlay */}
        {won && !gameOver && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <p className="text-2xl font-bold mb-2">You Win! 🎉</p>
              <p className="mb-4">You reached 2048!</p>
              <button
                onClick={() => setWon(false)}
                className="px-4 py-2 bg-white text-green-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Continue Playing
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <p className="text-xl font-bold mb-2">Game Over!</p>
              <p className="mb-4">Final Score: {score}</p>
              <button
                onClick={initializeGame}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 flex items-center space-x-2"
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
        {!gameStarted && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <p className="text-xl font-bold mb-2">2048</p>
              <p className="text-sm mb-4">Combine tiles to reach 2048!</p>
              <button
                onClick={initializeGame}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 flex items-center space-x-2"
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
        <p className="text-sm text-dark-text-secondary mb-1">
          Use Arrow Keys or WASD to move tiles
        </p>
        <p className="text-xs text-dark-text-secondary">
          Space to pause • U to undo • Enter to start/restart
        </p>
      </div>
    </div>
  )
}

export default Game2048