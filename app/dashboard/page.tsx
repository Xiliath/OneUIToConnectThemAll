'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { UnifiedMessaging } from '@/components/unified-messaging'
import { useStore } from '@/lib/store'
import type { Channel, Message, Platform } from '@/types'
import { useToast } from '@/components/ui/use-toast'

export default function DashboardPage() {
  const router = useRouter()
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<Platform>>(new Set())
  const { selectedChannel, setSelectedChannel } = useStore()

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus()

    // Check for OAuth success/error messages
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const errorParam = urlParams.get('error')

    if (success) {
      // Handle successful OAuth connection
      const platform = success.replace('_connected', '') as Platform
      if (platform === 'slack' || platform === 'teams' || platform === 'outlook') {
        setConnectedPlatforms((prev) => new Set(prev).add(platform))
        fetchChannels(platform)
      }
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    }

    if (errorParam) {
      console.error('OAuth error:', errorParam)
      setError(`Authentication failed: ${errorParam}`)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check Slack authentication
      const slackResponse = await fetch('/api/slack/status')
      if (slackResponse.ok) {
        const slackData = await slackResponse.json()
        if (slackData.isAuthenticated) {
          setConnectedPlatforms((prev) => new Set(prev).add('slack'))
          fetchChannels('slack')
        }
      }

      // Check Teams authentication
      const teamsResponse = await fetch('/api/teams/status')
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json()
        if (teamsData.isAuthenticated) {
          setConnectedPlatforms((prev) => new Set(prev).add('teams'))
          fetchChannels('teams')
        }
      }

      // Check Outlook authentication
      const outlookResponse = await fetch('/api/outlook/status')
      if (outlookResponse.ok) {
        const outlookData = await outlookResponse.json()
        if (outlookData.isAuthenticated) {
          setConnectedPlatforms((prev) => new Set(prev).add('outlook'))
          fetchChannels('outlook')
        }
      }
    } catch (error) {
      console.error('Failed to check auth status:', error)
    }
  }

  const fetchChannels = async (platform: Platform) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/${platform}/channels`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch ${platform} channels`)
      }

      const data = await response.json()
      setChannels((prev) => [...prev.filter((c) => c.platform !== platform), ...data.channels])
    } catch (error) {
      console.error(`Failed to fetch ${platform} channels:`, error)
      setError(error instanceof Error ? error.message : `Failed to fetch ${platform} channels`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChannelSelect = async (channel: Channel) => {
    setSelectedChannel(channel)

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `/api/${channel.platform}/messages?channelId=${channel.id}&limit=50`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch messages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectPlatform = (platform: Platform) => {
    if (platform === 'slack') {
      router.push('/api/auth/slack')
    } else if (platform === 'teams') {
      router.push('/api/auth/microsoft?platform=teams')
    } else if (platform === 'outlook') {
      router.push('/api/auth/microsoft?platform=outlook')
    }
  }

  const handleSummarize = async () => {
    if (messages.length === 0) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      alert(`Summary:\n\n${data.summary}`)
    } catch (error) {
      console.error('Failed to summarize:', error)
      setError('Failed to generate AI summary. Make sure Claude API key is configured.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onChannelSelect={handleChannelSelect}
        onConnectPlatform={handleConnectPlatform}
        connectedPlatforms={connectedPlatforms}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              {selectedChannel ? (
                <div>
                  <h1 className="text-xl font-semibold">
                    {selectedChannel.isPrivate ? '🔒' : '#'} {selectedChannel.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedChannel.platform} channel
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-xl font-semibold">Welcome to OneUI</h1>
                  <p className="text-sm text-muted-foreground">
                    Connect your platforms to get started
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {isLoading && (
                <span className="text-sm text-muted-foreground">Loading...</span>
              )}
              <span className="text-sm font-medium text-primary">
                Phase 2: Core Features
              </span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden p-4">
          {error && (
            <div className="p-4 bg-destructive/10 border-l-4 border-destructive text-destructive mb-4">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {selectedChannel ? (
            isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-muted-foreground">Loading messages...</p>
                </div>
              </div>
            ) : (
              <UnifiedMessaging
                messages={messages}
                onSummarize={handleSummarize}
                isAIEnabled={true}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-semibold mb-2">
                  Connect Your Platforms
                </h2>
                <p className="text-muted-foreground mb-4">
                  Connect to Slack, Teams, or Outlook to view all your messages in one unified
                  interface
                </p>
                <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                  <p className="font-semibold mb-2">Phase 2 Features:</p>
                  <ul className="text-left space-y-1">
                    <li>✓ Multi-platform integration (Slack, Teams, Outlook)</li>
                    <li>✓ Unified messaging interface</li>
                    <li>✓ AI-powered message summaries</li>
                    <li>✓ Advanced search and filtering</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
