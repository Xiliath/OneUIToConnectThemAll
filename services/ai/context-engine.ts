import type { Message } from '@/types'

export interface SummaryOptions {
  maxLength?: number
  style?: 'concise' | 'detailed' | 'bullet-points'
}

export interface ContextAnalysis {
  summary: string
  topics: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  priority: 'low' | 'medium' | 'high'
  actionItems?: string[]
}

/**
 * Context Engine for AI-powered message analysis and summarization
 */
export class ContextEngine {
  private apiKey: string | null = null
  private apiUrl: string = 'https://api.anthropic.com/v1/messages'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.CLAUDE_API_KEY || null
  }

  /**
   * Set the Claude API key
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  /**
   * Check if the engine is configured with an API key
   */
  public isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0
  }

  /**
   * Summarize a thread of messages
   */
  public async summarizeThread(
    messages: Message[],
    options: SummaryOptions = {}
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Context Engine not configured. Please set Claude API key.')
    }

    const { maxLength = 200, style = 'concise' } = options

    const messagesText = messages
      .map((msg) => `[${msg.author.name}]: ${msg.content}`)
      .join('\n')

    const stylePrompts = {
      concise: 'Provide a brief, concise summary in 1-2 sentences.',
      detailed: 'Provide a detailed summary covering all important points.',
      'bullet-points': 'Provide a bullet-point summary of key points.',
    }

    const prompt = `Summarize the following conversation thread. ${stylePrompts[style]} Maximum length: ${maxLength} characters.\n\nConversation:\n${messagesText}`

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.content[0].text
    } catch (error) {
      console.error('[ContextEngine] Summarization error:', error)
      throw error
    }
  }

  /**
   * Analyze messages for context, sentiment, and action items
   */
  public async analyzeContext(messages: Message[]): Promise<ContextAnalysis> {
    if (!this.isConfigured()) {
      throw new Error('Context Engine not configured. Please set Claude API key.')
    }

    const messagesText = messages
      .map((msg) => `[${msg.author.name}]: ${msg.content}`)
      .join('\n')

    const prompt = `Analyze the following conversation and provide:
1. A brief summary
2. Main topics discussed (comma-separated)
3. Overall sentiment (positive/neutral/negative)
4. Priority level (low/medium/high)
5. Any action items mentioned

Format your response as JSON with these exact keys: summary, topics (array), sentiment, priority, actionItems (array).

Conversation:
${messagesText}`

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
      }

      const data = await response.json()
      const text = data.content[0].text

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response')
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('[ContextEngine] Analysis error:', error)
      throw error
    }
  }

  /**
   * Group messages by topic using AI
   */
  public async groupMessagesByTopic(messages: Message[]): Promise<Map<string, Message[]>> {
    if (!this.isConfigured()) {
      throw new Error('Context Engine not configured. Please set Claude API key.')
    }

    const messagesWithIndex = messages.map((msg, idx) => ({
      index: idx,
      text: `[${idx}] [${msg.author.name}]: ${msg.content}`,
    }))

    const messagesText = messagesWithIndex.map((m) => m.text).join('\n')

    const prompt = `Analyze these messages and group them by topic. Return a JSON array where each item has:
- topic: the topic name
- messageIndices: array of message indices belonging to this topic

Messages:
${messagesText}`

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
      }

      const data = await response.json()
      const text = data.content[0].text

      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response')
      }

      const groups = JSON.parse(jsonMatch[0]) as Array<{
        topic: string
        messageIndices: number[]
      }>

      const result = new Map<string, Message[]>()

      groups.forEach((group) => {
        const groupMessages = group.messageIndices
          .map((idx) => messages[idx])
          .filter((msg) => msg !== undefined)
        result.set(group.topic, groupMessages)
      })

      return result
    } catch (error) {
      console.error('[ContextEngine] Grouping error:', error)
      throw error
    }
  }

  /**
   * Suggest responses based on conversation context
   */
  public async suggestResponse(messages: Message[]): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('Context Engine not configured. Please set Claude API key.')
    }

    const messagesText = messages
      .map((msg) => `[${msg.author.name}]: ${msg.content}`)
      .join('\n')

    const prompt = `Based on this conversation, suggest 3 appropriate response options. Return them as a JSON array of strings.

Conversation:
${messagesText}`

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 512,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
      }

      const data = await response.json()
      const text = data.content[0].text

      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response')
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('[ContextEngine] Suggestion error:', error)
      throw error
    }
  }
}

// Export a singleton instance
export const contextEngine = new ContextEngine()
