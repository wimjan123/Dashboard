import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit3, Trash2, Save, X, FileText, Search, Filter } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  color: string
  tags: string[]
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColor, setSelectedColor] = useState('#fbbf24') // yellow
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const colors = [
    { name: 'Yellow', value: '#fbbf24', bg: 'bg-yellow-400/20', border: 'border-yellow-400' },
    { name: 'Pink', value: '#f472b6', bg: 'bg-pink-400/20', border: 'border-pink-400' },
    { name: 'Blue', value: '#60a5fa', bg: 'bg-blue-400/20', border: 'border-blue-400' },
    { name: 'Green', value: '#34d399', bg: 'bg-emerald-400/20', border: 'border-emerald-400' },
    { name: 'Purple', value: '#a855f7', bg: 'bg-purple-400/20', border: 'border-purple-400' },
    { name: 'Orange', value: '#fb923c', bg: 'bg-orange-400/20', border: 'border-orange-400' }
  ]

  useEffect(() => {
    const savedNotes = localStorage.getItem('dashboard-notes')
    if (savedNotes) {
      const parsed = JSON.parse(savedNotes)
      setNotes(parsed.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      })))
    } else {
      // Default notes
      const defaultNotes: Note[] = [
        {
          id: '1',
          title: 'Welcome to Notes',
          content: 'This is your personal note-taking space. Click the + button to add new notes!',
          createdAt: new Date(),
          updatedAt: new Date(),
          color: '#60a5fa',
          tags: ['welcome']
        },
        {
          id: '2',
          title: 'Project Ideas',
          content: '• Dashboard improvements\n• Mobile app development\n• AI integration features',
          createdAt: new Date(),
          updatedAt: new Date(),
          color: '#34d399',
          tags: ['ideas', 'projects']
        }
      ]
      setNotes(defaultNotes)
      localStorage.setItem('dashboard-notes', JSON.stringify(defaultNotes))
    }
  }, [])

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes)
    localStorage.setItem('dashboard-notes', JSON.stringify(updatedNotes))
  }

  const createNote = () => {
    if (!newNote.title.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      color: selectedColor,
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }

    saveNotes([note, ...notes])
    setNewNote({ title: '', content: '', tags: '' })
    setIsCreating(false)
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map(note =>
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    )
    saveNotes(updatedNotes)
  }

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    saveNotes(updatedNotes)
  }

  const getColorClasses = (color: string) => {
    const colorObj = colors.find(c => c.value === color)
    return colorObj ? { bg: colorObj.bg, border: colorObj.border } : { bg: 'bg-yellow-400/20', border: 'border-yellow-400' }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-dark-text">
            Notes ({filteredNotes.length})
          </span>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors duration-200"
          title="Add note"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-text-secondary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-7 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-xs text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-yellow-400 transition-colors duration-200"
        />
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <div className="p-3 bg-dark-card border border-dark-border rounded-lg space-y-3">
          <input
            type="text"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            placeholder="Note title..."
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-sm text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-yellow-400"
            autoFocus
          />
          <textarea
            value={newNote.content}
            onChange={(e) => {
              setNewNote({ ...newNote, content: e.target.value })
              adjustTextareaHeight(e.target)
            }}
            placeholder="Write your note..."
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-sm text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-yellow-400 resize-none min-h-[60px]"
            rows={3}
          />
          <input
            type="text"
            value={newNote.tags}
            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
            placeholder="Tags (comma separated)..."
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-sm text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-yellow-400"
          />
          
          {/* Color Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-dark-text-secondary">Color:</span>
            {colors.map(color => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedColor === color.value ? 'ring-2 ring-white ring-offset-1 ring-offset-dark-card' : ''
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsCreating(false)
                setNewNote({ title: '', content: '', tags: '' })
              }}
              className="px-3 py-1.5 text-xs text-dark-text-secondary hover:text-dark-text transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={createNote}
              disabled={!newNote.title.trim()}
              className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded transition-colors duration-200"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 mx-auto mb-2 text-yellow-400 opacity-50" />
            <p className="text-dark-text-secondary text-sm">
              {searchQuery ? 'No notes match your search' : 'No notes yet'}
            </p>
          </div>
        ) : (
          filteredNotes.map(note => {
            const { bg, border } = getColorClasses(note.color)
            return (
              <div
                key={note.id}
                className={`p-3 rounded-lg border transition-all duration-200 group ${bg} ${border}`}
              >
                {editingId === note.id ? (
                  <EditNoteForm
                    note={note}
                    onSave={(updates) => {
                      updateNote(note.id, updates)
                      setEditingId(null)
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-medium text-dark-text line-clamp-1">
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => setEditingId(note.id)}
                          className="p-1 text-dark-text-secondary hover:text-dark-text rounded"
                          title="Edit"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1 text-dark-text-secondary hover:text-red-400 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-dark-text-secondary mb-2 line-clamp-2 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-dark-text-secondary">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-dark-card rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-dark-card rounded text-xs">
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                      <span>{formatDate(note.updatedAt)}</span>
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

interface EditNoteFormProps {
  note: Note
  onSave: (updates: Partial<Note>) => void
  onCancel: () => void
}

const EditNoteForm: React.FC<EditNoteFormProps> = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState(note.tags.join(', '))

  const handleSave = () => {
    onSave({
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    })
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-sm text-dark-text focus:outline-none focus:border-yellow-400"
        autoFocus
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-sm text-dark-text focus:outline-none focus:border-yellow-400 resize-none"
        rows={3}
      />
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated)..."
        className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-sm text-dark-text focus:outline-none focus:border-yellow-400"
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-2 py-1 text-xs text-dark-text-secondary hover:text-dark-text"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded"
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default Notes