import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  color: string
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Meeting',
        date: new Date(2024, currentDate.getMonth(), 15),
        color: 'bg-blue-500'
      },
      {
        id: '2',
        title: 'Project Deadline',
        date: new Date(2024, currentDate.getMonth(), 22),
        color: 'bg-red-500'
      },
      {
        id: '3',
        title: 'Conference Call',
        date: new Date(2024, currentDate.getMonth(), 8),
        color: 'bg-green-500'
      }
    ]
    setEvents(mockEvents)
  }, [currentDate])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getEventsForDate = (date: number) => {
    return events.filter(event => 
      event.date.getDate() === date && 
      event.date.getMonth() === currentDate.getMonth()
    )
  }

  const isToday = (date: number) => {
    const today = new Date()
    return today.getDate() === date && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear()
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day)
      const isCurrentDay = isToday(day)
      
      days.push(
        <div
          key={day}
          className={`h-8 flex flex-col items-center justify-center text-xs cursor-pointer rounded-md transition-colors duration-200 relative ${
            isCurrentDay 
              ? 'bg-indigo-500 text-white font-bold' 
              : 'text-dark-text hover:bg-dark-border'
          }`}
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
        >
          <span>{day}</span>
          {dayEvents.length > 0 && (
            <div className="flex space-x-1 absolute -bottom-1">
              {dayEvents.slice(0, 2).map((event, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-1 rounded-full ${event.color}`}
                ></div>
              ))}
              {dayEvents.length > 2 && (
                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              )}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  const todaysEvents = events.filter(event => {
    const today = new Date()
    return event.date.toDateString() === today.toDateString()
  })

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-dark-text">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 rounded hover:bg-dark-border transition-colors duration-200"
          >
            <ChevronLeft className="w-3 h-3 text-dark-text-secondary" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 rounded hover:bg-dark-border transition-colors duration-200"
          >
            <ChevronRight className="w-3 h-3 text-dark-text-secondary" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(day => (
            <div key={day} className="text-xs text-dark-text-secondary text-center font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Today's Events */}
      {todaysEvents.length > 0 && (
        <div className="mt-4 p-3 bg-dark-card rounded-lg border border-dark-border">
          <h4 className="text-sm font-medium text-dark-text mb-2">Today's Events</h4>
          <div className="space-y-2">
            {todaysEvents.map(event => (
              <div key={event.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${event.color}`}></div>
                <span className="text-xs text-dark-text-secondary">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Event */}
      <button className="w-full p-2 border border-dashed border-dark-border rounded-lg hover:border-indigo-400 hover:bg-indigo-400/5 transition-colors duration-200 flex items-center justify-center space-x-2">
        <Plus className="w-3 h-3 text-dark-text-secondary" />
        <span className="text-xs text-dark-text-secondary">Add Event</span>
      </button>
    </div>
  )
}

export default Calendar