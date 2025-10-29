import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, Message, Channel, Platform, UserAuth } from '@/types'

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      auth: {},
      messages: [],
      selectedChannel: null,
      isLoading: false,
      error: null,
      theme: 'light',

      // Auth actions
      setAuth: (platform: Platform, auth: UserAuth) =>
        set((state) => ({
          auth: { ...state.auth, [platform]: auth },
        })),

      clearAuth: (platform: Platform) =>
        set((state) => {
          const newAuth = { ...state.auth }
          delete newAuth[platform]
          return { auth: newAuth }
        }),

      // Message actions
      setMessages: (messages: Message[]) =>
        set({ messages }),

      addMessage: (message: Message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      // Channel actions
      setSelectedChannel: (channel: Channel | null) =>
        set({ selectedChannel: channel }),

      // UI actions
      setLoading: (isLoading: boolean) =>
        set({ isLoading }),

      setError: (error: string | null) =>
        set({ error }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'oneui-storage',
      partialize: (state) => ({
        auth: state.auth,
        theme: state.theme
      }),
    }
  )
)
