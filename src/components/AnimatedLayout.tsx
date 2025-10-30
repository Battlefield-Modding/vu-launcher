import { routes } from '@/config/config'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router'

type Props = {
  children: ReactNode
}

const variants = {
  hidden: { opacity: 0, y: 500 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -500 },
}

export function AnimatedLayout({ children }: Props): React.JSX.Element {
  const location = useLocation()
  if (
    location.pathname !== routes.ONBOARDING &&
    location.state &&
    location.state.direction !== undefined
  ) {
    return (
      <motion.div
        initial={location.state.direction < 0 ? 'exit' : 'hidden'}
        animate="enter"
        exit={location.state.direction < 0 ? 'hidden' : 'exit'}
        variants={variants}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={'enter'}
      animate="enter"
      exit={'exit'}
      variants={variants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
