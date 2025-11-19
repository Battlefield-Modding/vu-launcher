import { cn } from '@/lib/utils'
import vuIconRed from '@/assets/vu-icon-red.svg'

export function IntroScreen({ showOnboarding }: { showOnboarding: boolean }) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700',
        !showOnboarding ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <img src={vuIconRed} alt="VU Logo" className="animate-logo-intro h-32 w-32" />
    </div>
  )
}
