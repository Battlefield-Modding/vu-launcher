import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router'
import { menuOrder } from './Menu'
import { routes } from '@/config/config' // Add import for routes

// Animation keys (Tailwind classes for sliding)
const slideUpIn = 'animate-slide-up-in'
const slideUpOut = 'animate-slide-up-out'
const slideDownIn = 'animate-slide-down-in'
const slideDownOut = 'animate-slide-down-out'

export default function PageTransition({
  children,
}: {
  children: (pathname: string) => React.ReactNode
}) {
  const location = useLocation()
  const [prevLocation, setPrevLocation] = useState(location)
  const [currentLocation, setCurrentLocation] = useState(location)
  const [isAnimating, setIsAnimating] = useState(false)
  const directionRef = useRef<'up' | 'down'>('up')
  const pendingLocationRef = useRef<null | typeof location>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Normalize path to handle dynamic URLs (e.g., /mods/subroute -> /mods)
  const normalizePath = (path: string) => {
    const parts = path.split('/')
    const base = parts[1] || ''
    return '/' + base || path
  }

  useEffect(() => {
    const normalizedCurrent = normalizePath(currentLocation.pathname)
    const normalizedLocation = normalizePath(location.pathname)

    if (normalizedLocation !== normalizedCurrent) {
      console.log('Navigation detected:', {
        from: normalizedCurrent,
        to: normalizedLocation,
        isAnimating,
        skip: location.state?.skipAnimation,
        fromMods: normalizedCurrent === routes.MODS, // Now routes.MODS is defined
      })

      // Skip animation if flagged or invalid routes
      if (location.state?.skipAnimation) {
        console.log('Skipping animation: skipAnimation flag')
        setCurrentLocation(location)
        pendingLocationRef.current = null
        return
      }

      // Check indices for valid routes
      const prevIndex = menuOrder.indexOf(normalizedCurrent)
      const newIndex = menuOrder.indexOf(normalizedLocation)

      if (prevIndex === -1 || newIndex === -1) {
        console.log('Skipping animation: invalid route indices', {
          prevIndex,
          newIndex,
          from: normalizedCurrent,
          to: normalizedLocation,
        })
        setCurrentLocation(location)
        pendingLocationRef.current = null
        return
      }

      if (isAnimating) {
        // Queue only the latest pending location
        pendingLocationRef.current = location
        console.log('Queueing navigation:', normalizedLocation)
        return
      }

      directionRef.current = newIndex > prevIndex ? 'up' : 'down'

      console.log('Starting animation:', {
        direction: directionRef.current,
        prev: normalizedCurrent,
        next: normalizedLocation,
        prevIndex,
        newIndex,
        fromMods: normalizedCurrent === routes.MODS,
      })

      setPrevLocation(currentLocation)
      setCurrentLocation(location)
      setIsAnimating(true)

      // Fallback timeout to prevent stuck state
      animationTimeoutRef.current = setTimeout(() => {
        if (isAnimating) {
          console.warn('Animation timeout triggered, resetting isAnimating', {
            current: normalizedCurrent,
            pending: pendingLocationRef.current?.pathname,
          })
          setIsAnimating(false)
        }
      }, 800) // Match animation duration (0.7s) + buffer
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [location, currentLocation.pathname, routes.MODS])

  const handleAnimationEnd = () => {
    console.log('Animation ended:', {
      current: normalizePath(currentLocation.pathname),
      pending: pendingLocationRef.current
        ? normalizePath(pendingLocationRef.current.pathname)
        : null,
      fromMods: normalizePath(prevLocation.pathname) === routes.MODS,
    })

    setIsAnimating(false)
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Process pending location if any
    if (
      pendingLocationRef.current &&
      normalizePath(pendingLocationRef.current.pathname) !== normalizePath(currentLocation.pathname)
    ) {
      const pending = pendingLocationRef.current
      pendingLocationRef.current = null

      if (pending.state?.skipAnimation) {
        console.log('Applying queued skipAnimation navigation:', pending.pathname)
        setCurrentLocation(pending)
        return
      }

      const prevIndex = menuOrder.indexOf(normalizePath(currentLocation.pathname))
      const newIndex = menuOrder.indexOf(normalizePath(pending.pathname))

      if (prevIndex === -1 || newIndex === -1) {
        console.log('Skipping queued animation: invalid route indices', {
          prevIndex,
          newIndex,
          from: normalizePath(currentLocation.pathname),
          to: normalizePath(pending.pathname),
        })
        setCurrentLocation(pending)
        return
      }

      directionRef.current = newIndex > prevIndex ? 'up' : 'down'

      console.log('Starting queued animation:', {
        direction: directionRef.current,
        prev: normalizePath(currentLocation.pathname),
        next: normalizePath(pending.pathname),
        prevIndex,
        newIndex,
        fromMods: normalizePath(currentLocation.pathname) === routes.MODS,
      })

      setPrevLocation(currentLocation)
      setCurrentLocation(pending)
      setIsAnimating(true)

      animationTimeoutRef.current = setTimeout(() => {
        if (isAnimating) {
          console.warn('Queued animation timeout triggered, resetting isAnimating')
          setIsAnimating(false)
        }
      }, 800)
    }
  }

  const getAnimationClass = (type: 'in' | 'out') => {
    if (type === 'in') return directionRef.current === 'up' ? slideUpIn : slideDownIn
    return directionRef.current === 'up' ? slideUpOut : slideDownOut
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {isAnimating && (
        <div
          key={prevLocation.pathname} // Ensure unique key for outgoing page
          className={`absolute inset-0 h-full w-full transform ${getAnimationClass('out')}`}
          style={{ willChange: 'transform, opacity' }}
          onAnimationEnd={handleAnimationEnd}
        >
          {children(prevLocation.pathname)}
        </div>
      )}

      <div
        key={currentLocation.pathname} // Ensure unique key for incoming page
        className={`absolute inset-0 h-full w-full transform ${isAnimating ? getAnimationClass('in') : ''}`}
        style={{ willChange: 'transform, opacity' }}
      >
        {children(currentLocation.pathname)}
      </div>
    </div>
  )
}
