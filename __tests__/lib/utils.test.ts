import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('should handle conditional classes', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'ignored-class')
    expect(result).toContain('base-class')
    expect(result).toContain('conditional-class')
    expect(result).not.toContain('ignored-class')
  })

  it('should merge tailwind classes properly', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })
})
