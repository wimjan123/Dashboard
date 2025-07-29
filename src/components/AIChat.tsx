import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Settings, Trash2, Download, Copy, RefreshCw } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  name: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

interface AIProvider {
  id: string
  name: string
  models: string[]
  color: string
  requiresApiKey: boolean
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    color: 'bg-green-500',
    requiresApiKey: true
  },
  {
    id: 'anthropic',
    name: 'Claude',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    color: 'bg-orange-500',
    requiresApiKey: true
  },
  {
    id: 'google',
    name: 'Gemini',
    models: ['gemini-pro', 'gemini-pro-vision'],
    color: 'bg-blue-500',
    requiresApiKey: true
  },
  {
    id: 'local',
    name: 'Local (Ollama)',
    models: ['llama2', 'codellama', 'mistral'],
    color: 'bg-purple-500',
    requiresApiKey: false
  }
]

const SYSTEM_PROMPTS = [
  { id: 'default', name: 'Default Assistant', prompt: 'You are a helpful AI assistant.' },
  { id: 'coding', name: 'Coding Assistant', prompt: 'You are an expert programmer. Help with coding questions, debugging, and best practices.' },
  { id: 'writing', name: 'Writing Helper', prompt: 'You are a professional writer. Help with writing, editing, and improving text.' },
  { id: 'analysis', name: 'Data Analyst', prompt: 'You are a data analyst. Help with data interpretation, analysis, and insights.' },
  { id: 'creative', name: 'Creative Partner', prompt: 'You are a creative assistant. Help with brainstorming, ideation, and creative projects.' }
]

const AIChat: React.FC = () => {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('dashboard-ai-conversations', [])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Settings
  const [selectedProvider, setSelectedProvider] = useLocalStorage('ai-provider', 'openai')
  const [selectedModel, setSelectedModel] = useLocalStorage('ai-model', 'gpt-3.5-turbo')
  const [systemPrompt, setSystemPrompt] = useLocalStorage('ai-system-prompt', 'default')
  const [apiKeys, setApiKeys] = useLocalStorage<Record<string, string>>('ai-api-keys', {})
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentConversation = conversations.find(c => c.id === currentConversationId)
  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider)
  const availableModels = currentProvider?.models || []

  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id)
    }
  }, [conversations, currentConversationId])

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      name: `Chat ${conversations.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setConversations([newConversation, ...conversations])
    setCurrentConversationId(newConversation.id)
  }

  const deleteConversation = (conversationId: string) => {
    const updatedConversations = conversations.filter(c => c.id !== conversationId)
    setConversations(updatedConversations)
    
    if (conversationId === currentConversationId) {
      setCurrentConversationId(updatedConversations.length > 0 ? updatedConversations[0].id : null)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !currentConversationId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    }

    // Add user message
    const updatedConversations = conversations.map(c => 
      c.id === currentConversationId 
        ? { 
            ...c, 
            messages: [...c.messages, userMessage],
            updatedAt: new Date().toISOString()
          }
        : c
    )
    setConversations(updatedConversations)
    setMessage('')
    setIsLoading(true)

    try {
      // This is a mock implementation - in a real app, you'd call the actual AI API
      const response = await mockAIResponse(message, selectedProvider, selectedModel)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      setConversations(prev => prev.map(c => 
        c.id === currentConversationId 
          ? { 
              ...c, 
              messages: [...c.messages, assistantMessage],
              updatedAt: new Date().toISOString()
            }
          : c
      ))
    } catch (error) {
      console.error('AI API Error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please check your API configuration and try again.',
        timestamp: new Date().toISOString()
      }

      setConversations(prev => prev.map(c => 
        c.id === currentConversationId 
          ? { 
              ...c, 
              messages: [...c.messages, errorMessage],
              updatedAt: new Date().toISOString()
            }
          : c
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const mockAIResponse = async (userMessage: string, provider: string, model: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    const responses = [
      `I understand you're asking about "${userMessage}". As an AI assistant using ${provider}'s ${model} model, I'd be happy to help with that.`,
      `That's an interesting question about "${userMessage}". Let me provide some insights based on my training.`,
      `Thanks for your message. I'm currently running in demo mode, but I can help you think through "${userMessage}".`,
      `I see you're interested in "${userMessage}". While this is a demo interface, I can offer some general guidance on this topic.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const exportConversation = () => {
    if (!currentConversation) return
    
    const exportData = {
      name: currentConversation.name,
      messages: currentConversation.messages,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentConversation.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <select
            value={currentConversationId || ''}
            onChange={(e) => setCurrentConversationId(e.target.value || null)}
            className="px-3 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:border-blue-400"
          >
            {conversations.map(conv => (
              <option key={conv.id} value={conv.id}>
                {conv.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={createNewConversation}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors duration-200"
          >
            New Chat
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {currentConversation && (
            <>
              <button
                onClick={exportConversation}
                className="p-1 text-dark-text-secondary hover:text-green-400 transition-colors duration-200"
                title="Export conversation"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteConversation(currentConversation.id)}
                className="p-1 text-dark-text-secondary hover:text-red-400 transition-colors duration-200"
                title="Delete conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 transition-colors duration-200 ${
              showSettings ? 'text-blue-400' : 'text-dark-text-secondary hover:text-blue-400'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-dark-card rounded-lg border border-dark-border flex-shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark-text mb-1">AI Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value)
                  const provider = AI_PROVIDERS.find(p => p.id === e.target.value)
                  if (provider) {
                    setSelectedModel(provider.models[0])
                  }
                }}
                className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:border-blue-400"
              >
                {AI_PROVIDERS.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-text mb-1">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:border-blue-400"
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-dark-text mb-1">System Prompt</label>
              <select
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:border-blue-400"
              >
                {SYSTEM_PROMPTS.map(prompt => (
                  <option key={prompt.id} value={prompt.id}>
                    {prompt.name}
                  </option>
                ))}
              </select>
            </div>

            {currentProvider?.requiresApiKey && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-dark-text mb-1">
                  API Key ({currentProvider.name})
                </label>
                <input
                  type="password"
                  value={apiKeys[selectedProvider] || ''}
                  onChange={(e) => setApiKeys({ ...apiKeys, [selectedProvider]: e.target.value })}
                  placeholder="Enter your API key..."
                  className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin mb-4 space-y-4">
        {!currentConversation && (
          <div className="text-center py-8 text-dark-text-secondary">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-2">No conversation selected</p>
            <button
              onClick={createNewConversation}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
            >
              Start a new chat
            </button>
          </div>
        )}

        {currentConversation?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            
            <div className={`flex-1 group ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-dark-card text-dark-text border border-dark-border'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              
              <div className={`flex items-center mt-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                msg.role === 'user' ? 'justify-end' : ''
              }`}>
                <span className="text-xs text-dark-text-secondary">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                <button
                  onClick={() => copyMessage(msg.content)}
                  className="text-dark-text-secondary hover:text-blue-400 transition-colors duration-200"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-3 rounded-lg bg-dark-card border border-dark-border">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-dark-text-secondary animate-spin" />
                  <span className="text-sm text-dark-text-secondary">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {currentConversationId && (
        <div className="flex items-center space-x-2 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-blue-400 transition-colors duration-200 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 group"
          >
            <Send className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      )}
    </div>
  )
}

export default AIChat