'use client'

import { useState, useEffect } from 'react'
import { Slack, Hash, Lock } from 'lucide-react'
import type { Channel } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  channels: Channel[]
  selectedChannel: Channel | null
  onChannelSelect: (channel: Channel) => void
  onConnectSlack: () => void
}

export function Sidebar({
  channels,
  selectedChannel,
  onChannelSelect,
  onConnectSlack,
}: SidebarProps) {
  const [hasSlackToken, setHasSlackToken] = useState(false)

  useEffect(() => {
    // Check if user is connected to Slack
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'slack_connected') {
      setHasSlackToken(true)
    }
  }, [])

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Channels</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasSlackToken && channels.length === 0 ? (
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Connect to Slack to view your channels
            </p>
            <Button onClick={onConnectSlack} className="w-full" size="sm">
              <Slack className="w-4 h-4 mr-2" />
              Connect Slack
            </Button>
          </div>
        ) : (
          <div className="py-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel)}
                className={cn(
                  'w-full flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent transition-colors',
                  selectedChannel?.id === channel.id && 'bg-accent'
                )}
              >
                {channel.isPrivate ? (
                  <Lock className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Hash className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="flex-1 truncate text-left">
                  {channel.name}
                </span>
                {channel.unreadCount > 0 && (
                  <span className="flex-shrink-0 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {channel.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p>OneUI v0.1.0</p>
          <p>Phase 1: Foundation</p>
        </div>
      </div>
    </div>
  )
}
