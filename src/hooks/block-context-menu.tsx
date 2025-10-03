import { useEffect } from 'react'

export default function useBlockContextMenu() {
  function blockContextMenu(e: MouseEvent) {
    e.preventDefault()
  }

  useEffect(() => {
    // Only add in production
    if (process.env.NODE_ENV === 'production') {
      document.addEventListener('contextmenu', blockContextMenu)

      // Cleanup: Remove listener on unmount
      return () => {
        document.removeEventListener('contextmenu', blockContextMenu)
      }
    }
    // No-op in development (no listener added)
    return undefined
  }, []) // Empty deps: Run once on mount, cleanup on unmount
}
