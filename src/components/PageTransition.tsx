import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router'
import { menuOrder } from './Menu'
import { routes } from '@/config/config'

const slideUpIn = 'animate-slide-up-in'
const slideUpOut = 'animate-slide-up-out'
const slideDownIn = 'animate-slide-down-in'
const slideDownOut = 'animate-slide-down-out'

enum Mode {
  LightMode = 0,
  DarkMode = 1,
}

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

  const isDarkRef = useRef(false)
  const [bgOpacity, setBgOpacity] = useState(Mode.LightMode)

  const normalizePath = (path: string) => {
    const parts = path.split('/')
    const base = parts[1] || ''
    return '/' + base || path
  }

  function handleDarkMode() {
    const isDarkMode = currentLocation.pathname !== routes.HOME
    setBgOpacity(isDarkMode ? Mode.DarkMode : Mode.LightMode)
    isDarkRef.current = isDarkMode
  }

  // --- Handle page animations ---
  useEffect(() => {
    handleDarkMode()
    const normalizedCurrent = normalizePath(currentLocation.pathname)
    const normalizedLocation = normalizePath(location.pathname)

    if (normalizedLocation !== normalizedCurrent) {
      // @ts-ignore
      const prevIndex = menuOrder.indexOf(normalizedCurrent)
      // @ts-ignore
      const newIndex = menuOrder.indexOf(normalizedLocation)

      if (location.state?.skipAnimation || prevIndex === -1 || newIndex === -1) {
        setCurrentLocation(location)
        pendingLocationRef.current = null
        return
      }

      if (isAnimating) {
        pendingLocationRef.current = location
        return
      }

      directionRef.current = newIndex > prevIndex ? 'up' : 'down'
      setPrevLocation(currentLocation)
      setCurrentLocation(location)
      setIsAnimating(true)

      animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), 800)
    }

    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current)
    }
  }, [location, currentLocation.pathname])

  function handleAnimationEnd() {
    setIsAnimating(false)
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current)

    if (
      pendingLocationRef.current &&
      normalizePath(pendingLocationRef.current.pathname) !== normalizePath(currentLocation.pathname)
    ) {
      const pending = pendingLocationRef.current
      pendingLocationRef.current = null
      setPrevLocation(currentLocation)
      setCurrentLocation(pending)
      setIsAnimating(true)
      animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), 800)
    }
  }

  function getAnimationClass(type: 'in' | 'out') {
    if (type === 'in') return directionRef.current === 'up' ? slideUpIn : slideDownIn
    return directionRef.current === 'up' ? slideUpOut : slideDownOut
  }

  return (
    <div className="hide-scrollbar relative min-h-screen w-full overflow-y-auto">
      <div
        className="absolute inset-0 z-0 bg-black bg-opacity-60 transition-opacity duration-500 ease-in-out"
        style={{ opacity: bgOpacity }}
      />

      {isAnimating && (
        <div
          key={prevLocation.pathname}
          className={`absolute inset-0 z-10 min-h-full w-full transform ${getAnimationClass('out')}`}
          style={{ willChange: 'transform, opacity' }}
          onAnimationEnd={handleAnimationEnd}
        >
          {children(prevLocation.pathname)}
        </div>
      )}

      <div
        key={currentLocation.pathname}
        className={`absolute inset-0 z-20 min-h-full w-full transform ${
          isAnimating ? getAnimationClass('in') : ''
        }`}
        style={{ willChange: 'transform, opacity' }}
      >
        {children(currentLocation.pathname)}
      </div>
    </div>
  )
}
