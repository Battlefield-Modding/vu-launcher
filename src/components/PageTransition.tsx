import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router'
import { menuOrder } from './Menu'

// animation keys
const slideUpIn = 'animate-slide-up-in'
const slideUpOut = 'animate-slide-up-out'
const slideDownIn = 'animate-slide-down-in'
const slideDownOut = 'animate-slide-down-out'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [prevLocation, setPrevLocation] = useState(location)
  const [currentLocation, setCurrentLocation] = useState(location)
  const [isAnimating, setIsAnimating] = useState(false)
  const directionRef = useRef<'up' | 'down'>('up')

  useEffect(() => {
    if (location !== currentLocation) {
      // determine direction
      const prevIndex = menuOrder.indexOf(currentLocation.pathname)
      const newIndex = menuOrder.indexOf(location.pathname)
      directionRef.current = newIndex > prevIndex ? 'up' : 'down'

      setPrevLocation(currentLocation)
      setCurrentLocation(location)
      setIsAnimating(true)
    }
  }, [location, currentLocation])

  const handleAnimationEnd = () => setIsAnimating(false)

  const getAnimationClass = (type: 'in' | 'out') => {
    if (type === 'in') return directionRef.current === 'up' ? slideUpIn : slideDownIn
    return directionRef.current === 'up' ? slideUpOut : slideDownOut
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {isAnimating && (
        <div
          className={`absolute inset-0 h-full w-full transform ${getAnimationClass('out')}`}
          style={{ willChange: 'transform, opacity' }}
          onAnimationEnd={handleAnimationEnd}
        >
          {children(prevLocation.pathname)}
        </div>
      )}

      <div
        className={`absolute inset-0 h-full w-full transform ${isAnimating ? getAnimationClass('in') : ''}`}
        style={{ willChange: 'transform, opacity' }}
      >
        {children(currentLocation.pathname)}
      </div>
    </div>
  )
}
