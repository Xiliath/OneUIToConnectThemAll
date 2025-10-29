'use client'

import { Slack, Hash, Lock, Mail, MessageSquare } from 'lucide-react'
import type { Channel, Platform } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  channels: Channel[]
  selectedChannel: Channel | null
  onChannelSelect: (channel: Channel) => void
  onConnectPlatform: (platform: Platform) => void
  connectedPlatforms: Set<Platform>
}

const platformIcons: Record<Platform, any> = {
  slack: Slack,
  teams: MessageSquare,
  outlook: Mail,
  other: Hash,
}

const platformColors: Record<Platform, string> = {
  slack: 'text-purple-600 dark:text-purple-400',
  teams: 'text-blue-600 dark:text-blue-400',
  outlook: 'text-sky-600 dark:text-sky-400',
  other: 'text-gray-600 dark:text-gray-400',
}

export function Sidebar({
  channels,
  selectedChannel,
  onChannelSelect,
  onConnectPlatform,
  connectedPlatforms,
}: SidebarProps) {
  // Group channels by platform
  const channelsByPlatform = channels.reduce((acc, channel) => {
    if (!acc[channel.platform]) {
      acc[channel.platform] = []
    }
    acc[channel.platform].push(channel)
    return acc
  }, {} as Record<Platform, Channel[]>)

  const platforms: Platform[] = ['slack', 'teams', 'outlook']

  return (
    <div className="w-72 bg-card border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">OneUI</h2>
        <p className="text-xs text-muted-foreground">Unified Communications</p>
      </div>

      {/* Platform connections */}
      <div className="p-4 border-b border-border space-y-2">
        <h3 className="text-sm font-semibold mb-2">Platforms</h3>
        {platforms.map((platform) => {
          const Icon = platformIcons[platform]
          const isConnected = connectedPlatforms.has(platform)
          return (
            <Button
              key={platform}
              onClick={() => !isConnected && onConnectPlatform(platform)}
              variant={isConnected ? 'outline' : 'default'}
              className="w-full justify-start"
              size="sm"
              disabled={isConnected}
            >
              <Icon className="w-4 h-4 mr-2" />
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
              {isConnected && (
                <span className="ml-auto text-xs text-green-600 dark:text-green-400">
                  ✓
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Channels list */}
      <div className="flex-1 overflow-y-auto">
        {channels.length === 0 ? (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Connect to platforms above to view your channels and messages
            </p>
          </div>
        ) : (
          <div className="py-2">
            {Object.entries(channelsByPlatform).map(([platform, platformChannels]) => (
              <div key={platform} className="mb-4">
                <div className="px-4 py-2">
                  <h4 className={cn('text-xs font-semibold uppercase', platformColors[platform as Platform])}>
                    {platform}
                  </h4>
                </div>
                {platformChannels.map((channel) => (
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
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p>OneUI v0.2.0</p>
          <p>Phase 2: Core Features</p>
        </div>
      </div>
    </div>
  )
}
