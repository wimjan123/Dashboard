import { useState, useRef, useCallback } from 'react'

export interface DragItem {
  id: string
  index: number
}

export interface DropResult {
  draggedId: string
  targetIndex: number
}

export const useDragAndDrop = <T extends { id: string }>(
  items: T[],
  onReorder: (items: T[]) => void
) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)

  const handleDragStart = useCallback((e: React.DragEvent, id: string, index: number) => {
    setDraggedItem({ id, index })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    
    // Add dragging class to body for cursor styling
    document.body.classList.add('dragging')
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDragOverIndex(null)
    dragCounter.current = 0
    document.body.classList.remove('dragging')
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedItem && draggedItem.index !== targetIndex) {
      setDragOverIndex(targetIndex)
    }
  }, [draggedItem])

  const handleDragEnter = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    dragCounter.current++
    
    if (draggedItem && draggedItem.index !== targetIndex) {
      setDragOverIndex(targetIndex)
    }
  }, [draggedItem])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    dragCounter.current--
    
    if (dragCounter.current === 0) {
      setDragOverIndex(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.index === targetIndex) {
      handleDragEnd()
      return
    }

    const newItems = [...items]
    const draggedIndex = draggedItem.index
    
    // Remove dragged item
    const [draggedElement] = newItems.splice(draggedIndex, 1)
    
    // Insert at new position
    newItems.splice(targetIndex, 0, draggedElement)
    
    onReorder(newItems)
    handleDragEnd()
  }, [draggedItem, items, onReorder, handleDragEnd])

  const getDragProps = useCallback((id: string, index: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => handleDragStart(e, id, index),
    onDragEnd: handleDragEnd,
    onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
    onDragEnter: (e: React.DragEvent) => handleDragEnter(e, index),
    onDragLeave: handleDragLeave,
    onDrop: (e: React.DragEvent) => handleDrop(e, index),
    'data-drag-id': id,
    'data-drag-index': index,
  }), [handleDragStart, handleDragEnd, handleDragOver, handleDragEnter, handleDragLeave, handleDrop])

  return {
    draggedItem,
    dragOverIndex,
    getDragProps,
    isDragging: draggedItem !== null,
  }
}
