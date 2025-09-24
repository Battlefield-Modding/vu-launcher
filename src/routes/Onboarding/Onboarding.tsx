import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Download,
  Loader,
  CheckCircle,
  AlertCircle,
  User,
  Zap,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import vuIconRed from '@/assets/vu-icon-red.svg' // Animated logo import
import { activateBf3LSX, finishOnboarding, getLauncherInstallPath } from '@/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryKey, routes, STALE } from '@/config/config'
import { InstallVU } from '@/routes/Home/components/InstallVU/InstallVU'
import { open } from '@tauri-apps/plugin-dialog'
import { exists } from '@tauri-apps/plugin-fs' // Tauri FS plugin v2 for existence checks
import { toast } from 'sonner'
import PlayerCredentialsSheet from '@/routes/Home/components/PlayerCredentialsSheet/PlayerCredentialsSheet'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '@/routes/Settings/components/LanguageSelector'
import { useSidebar } from '../../components/ui/sidebar'
import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { listen } from '@tauri-apps/api/event'

interface VuInstallStatusEvent {
  payload: {
    installing: boolean // Whether VU installation is active
  }
}

interface VuInstallCompleteEvent {
  payload: {
    success: boolean // Whether installation completed successfully
    path?: string // Optional: Installed path (for verification)
  }
}

export function Onboarding() {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [isActivated, setIsActivated] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false) // Controls reveal of onboarding steps
  const [isInstalling, setIsInstalling] = useState(false) // Tracks installation state from InstallVU events
  const [selectedInstallPath, setSelectedInstallPath] = useState<string | null>(null) // Tracks user-selected install path
  const navigate = useNavigate()
  const sidebar = useSidebar()
  const queryClient = useQueryClient()

  useEffect(() => {
    sidebar.toggleSidebar()
  }, [])

  // Listen for VU install status events to hide/show header when installing
  useEffect(() => {
    let unlistenStatus: (() => void) | null = null
    const setupStatusListener = async () => {
      unlistenStatus = await listen<VuInstallStatusEvent>('vu-install-status', (event) => {
        setIsInstalling(event.payload.installing)
        if (event.payload.installing) {
          console.log('VU install started – hiding download header')
        } else {
          console.log('VU install ended – showing download header')
        }
      })
    }
    setupStatusListener().catch(console.error)

    return () => {
      if (unlistenStatus) {
        unlistenStatus()
      }
    }
  }, [])

  // Listen for VU install complete event to handle advancement and path
  useEffect(() => {
    let unlistenComplete: (() => void) | null = null
    const setupCompleteListener = async () => {
      unlistenComplete = await listen<VuInstallCompleteEvent>(
        'vu-install-complete',
        async (event) => {
          if (event.payload.success) {
            console.log('VU install completed successfully – advancing to next step')
            setSelectedInstallPath(event.payload.path || null)
            // Invalidate and refetch immediately to verify custom path
            await queryClient.invalidateQueries({
              queryKey: [QueryKey.IsVuInstalled],
              refetchType: 'all',
            })
            // Manual refetch to ensure update
            queryClient.refetchQueries({ queryKey: [QueryKey.IsVuInstalled] })
          } else {
            console.log('VU install failed – no advancement')
            setSelectedInstallPath(null)
          }
        },
      )
    }
    setupCompleteListener().catch(console.error)

    return () => {
      if (unlistenComplete) {
        unlistenComplete()
      }
    }
  }, [queryClient])

  // Intro Animation: Show logo for 3 seconds, then reveal onboarding
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOnboarding(true)
    }, 3000) // 3s animation delay; adjust as needed (e.g., tie to animation end if using listener)

    return () => clearTimeout(timer)
  }, [])

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: [QueryKey.IsVuInstalled],
    queryFn: async (): Promise<{ vuProduction: boolean; vuDevelopment: boolean }> => {
      try {
        let installPath = await getLauncherInstallPath() // Default path
        let vuInstalled = false

        // If a custom path was selected during install, check it first
        if (selectedInstallPath) {
          console.log(`Checking custom install path: ${selectedInstallPath}`)
          const folder = `${selectedInstallPath}\\VeniceUnleashed`
          const folderExists = await exists(folder)
          if (folderExists) {
            const vuExe = `${folder}\\vu.exe`
            vuInstalled = await exists(vuExe)
            if (vuInstalled) {
              console.log('VU found at custom path – marking as installed')
              return { vuProduction: true, vuDevelopment: true } // Success – early return
            }
          }
          // If custom check fails, fallback to default (but log)
          console.log('Custom path check failed, falling back to default')
        }

        if (!installPath) {
          return { vuProduction: false, vuDevelopment: false }
        }

        // Check default path
        console.log(`Checking default install path: ${installPath}`)
        const folder = `${installPath}\\VeniceUnleashed`
        const folderExists = await exists(folder)
        if (folderExists) {
          const vuExe = `${folder}\\vu.exe`
          vuInstalled = await exists(vuExe)
        }

        return {
          vuProduction: vuInstalled,
          vuDevelopment: vuInstalled, // Both installed together
        }
      } catch (err) {
        console.error('Installation check error:', err)
        return { vuProduction: false, vuDevelopment: false }
      }
    },
    staleTime: STALE.never,
    refetchOnMount: false, // Disable auto-refetch on mount to avoid during intro; manual trigger below
    enabled: showOnboarding, // Only run query after reveal
  })

  // Initial refetch after intro (to avoid overlapping with logo animation)
  useEffect(() => {
    if (showOnboarding) {
      refetch()
    }
  }, [showOnboarding])

  useEffect(() => {
    if (data && currentStep === 0 && showOnboarding) {
      if (data.vuProduction && data.vuDevelopment) {
        setCurrentStep(1)
      } else {
        // Explicitly stay or reset to step 0 if not fully installed (prevents false skips)
        setCurrentStep(0)
      }
    }
  }, [data, currentStep, showOnboarding])

  // Helper function to show verify feedback based on status
  const showVerifyFeedback = (vuInstalled: boolean) => {
    if (vuInstalled) {
      toast.success(t('onboarding.verify.installed', 'Venice Unleashed is installed correctly!'))
    } else {
      toast.warning(
        t(
          'onboarding.verify.notInstalled',
          'Venice Unleashed not found. Please install it to proceed.',
        ),
      )
    }
  }

  const handleVerifyInstall = async () => {
    setIsVerifying(true)
    try {
      await refetch() // Use refetch for immediate update
      if (data) {
        showVerifyFeedback(data.vuProduction)
      } else {
        toast.error(t('onboarding.verify.error', 'Failed to verify installation status'))
      }
    } catch (err) {
      console.error('Verify error:', err)
      toast.error(t('onboarding.verify.error', 'Failed to verify installation status'))
    } finally {
      setIsVerifying(false)
    }
  }

  const isStepCompleted = () => {
    switch (currentStep) {
      case 0:
        return data?.vuProduction && data?.vuDevelopment
      case 1:
        return isActivated
      case 2:
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (isStepCompleted()) {
      if (currentStep < 2) {
        setCurrentStep((prev) => prev + 1)
      }
    } else {
      toast(t('onboarding.toast.completeStep', 'Please complete this step before proceeding'))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1)) // Ensure can't go below 0, but always allow back
  }

  function handleActivateLSX() {
    toast(t('onboarding.toast.activateBF3'))
    activateBf3LSX()
    setIsActivated(true)
  }

  const { vuProduction, vuDevelopment } = data || { vuProduction: false, vuDevelopment: false }

  const steps = [
    {
      id: 1,
      title: t('onboarding.steps.install', 'Install VU'),
      icon: Download,
      subtitle: t('onboarding.subtitle', 'Download Venice Unleashed'),
    },
    {
      id: 2,
      title: t('onboarding.steps.activate', 'Activate LSX'),
      icon: Zap,
      subtitle: t('onboarding.activate.description', 'Follow these steps to enable the mod'),
    },
    {
      id: 3,
      title: t('onboarding.steps.account', 'Add Account'),
      icon: User,
      subtitle: t('onboarding.account.description', 'Link your player credentials'),
    },
  ]

  // Shared Error Content (post-reveal)
  const errorContent = (
    <div className="flex h-screen flex-col items-center justify-center gap-4 p-4">
      <img src={vuIconRed} alt="VU Logo" className="mb-4 h-16 w-16 animate-pulse" />
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{t('onboarding.error')}</h1>
        <p className="text-muted-foreground">
          {error?.message || t('onboarding.unknownError', 'An unknown error occurred')}
        </p>
      </div>
    </div>
  )

  // Shared Pending Content (post-reveal)
  const pendingContent = (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <img
        src={vuIconRed}
        alt="VU Logo"
        className="mb-4 h-16 w-16 animate-ping" // Subtle ping instead of spin for loading
      />
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <h1 className="text-xl font-semibold">{t('onboarding.loading')}</h1>
    </div>
  )

  // Intro Logo Screen Overlay
  const introScreen = (
    <div
      className={cn(
        'absolute inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700',
        !showOnboarding ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <img
        src={vuIconRed}
        alt="VU Logo"
        className="animate-logo-intro h-32 w-32" // New grow/fade animation
      />
    </div>
  )

  // Main Onboarding Structure (under overlay)
  const onboardingStructure = (
    <div
      className={cn(
        'flex h-full flex-col transition-opacity duration-700',
        showOnboarding ? 'opacity-100' : 'opacity-0',
      )}
    >
      {/* Fixed Header (appears on reveal) */}
      <header className="flex shrink-0 items-center justify-center border-b px-4 py-4">
        <h1 className="text-center text-xl font-bold text-foreground sm:text-2xl">
          {t('onboarding.header')}
        </h1>
      </header>

      {/* Language Selector (appears on reveal) */}
      <div className="absolute right-4 top-4 z-40">
        <LanguageSelector />
      </div>

      {/* Content Body: Error / Pending / Main Steps */}
      <div className="relative flex-1 overflow-hidden">
        {isError ? (
          <div className="flex h-full items-center justify-center">{errorContent}</div>
        ) : isPending ? (
          pendingContent
        ) : (
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentStep * 100}%)` }}
          >
            {/* Step 0: Install Panel - Single Card for Download Venice Unleashed */}
            <section className="flex w-full flex-shrink-0 flex-col items-center justify-center p-4">
              <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
                {!vuProduction || !vuDevelopment ? (
                  <Card className="w-full max-w-md rounded-md border-border/50 p-4 shadow-md">
                    {!isInstalling && (
                      <div className="flex flex-col items-center space-x-3 text-center">
                        <Download className="m-4 h-12 w-12 flex-shrink-0 text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold">
                            {t('onboarding.install.title', 'Download Venice Unleashed')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t(
                              'onboarding.install.description',
                              'Download the latest version of Venice Unleashed',
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    <CardContent className="relative p-0">
                      <div className="space-y-4 p-4">
                        <InstallVU />
                      </div>
                      {!isInstalling && (
                        <div>
                          <div className="absolute bottom-4 right-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                toast(
                                  t(
                                    'onboarding.toast.learnMore',
                                    'Learn more about Venice Unleashed',
                                  ),
                                )
                              }
                            >
                              ?
                            </Button>
                          </div>
                          <div className="flex justify-center p-4 pt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-w-[100px]"
                              onClick={handleVerifyInstall}
                              disabled={isVerifying}
                            >
                              {isVerifying ? (
                                <Loader className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              )}
                              {t('onboarding.button.verify', 'Verify')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="w-full max-w-md rounded-md border-border/50 p-4 shadow-md">
                    <div className="mb-4 flex items-center space-x-3">
                      <CheckCircle className="h-12 w-12 flex-shrink-0 text-green-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-600">
                          {t('onboarding.install.complete', 'Installation Complete!')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Venice Unleashed is ready. VU is set up successfully.
                        </p>
                      </div>
                    </div>
                    <CardContent className="p-0">
                      <div className="flex justify-center p-4 pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleVerifyInstall}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <Loader className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-1 h-4 w-4" />
                          )}
                          {t('onboarding.button.refresh', 'Refresh Check')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* Step 1: Activate Panel - Single Card for List + Button */}
            <section className="flex w-full flex-shrink-0 flex-col items-center justify-center p-4">
              <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
                <Card className="w-full max-w-md rounded-md border-border/50 p-4 shadow-md">
                  <div className="mb-4 flex items-center space-x-3">
                    <Zap className="h-12 w-12 flex-shrink-0 text-primary" />
                    <div>
                      <h2 className="text-lg font-semibold">{t('onboarding.activate.header')}</h2>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          'onboarding.activate.description',
                          'Follow these steps to enable the LSX mod for BF3.',
                        )}
                      </p>
                    </div>
                  </div>
                  <CardContent className="max-h-[300px] space-y-4 overflow-y-auto p-0">
                    <div className="space-y-3">
                      {[
                        { icon: CheckCircle, text: t('onboarding.activate.step1') },
                        { icon: CheckCircle, text: t('onboarding.activate.step2') },
                        { icon: CheckCircle, text: t('onboarding.activate.step3') },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 pl-6">
                          <item.icon className="mt-1 h-4 w-4 flex-shrink-0 text-green-500" />
                          <p className="flex-1 text-sm leading-relaxed">{item.text}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full"
                      onClick={handleActivateLSX}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      {t('onboarding.activate.button')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Step 2: Account Panel - Single Card for Form + Button */}
            <section className="flex w-full flex-shrink-0 flex-col items-center justify-center p-4">
              <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
                <Card className="w-full max-w-md rounded-md border-border/50 p-4 shadow-md">
                  <div className="mb-4 flex items-center space-x-3">
                    <User className="h-12 w-12 flex-shrink-0 text-primary" />
                    <div>
                      <h2 className="text-lg font-semibold">
                        {t('onboarding.account.header', 'Add Your Account')}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          'onboarding.account.description',
                          'Enter your player credentials to complete setup.',
                        )}
                      </p>
                    </div>
                  </div>
                  <CardContent className="max-h-[300px] space-y-4 overflow-y-auto p-0">
                    <PlayerCredentialsSheet />
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full"
                      onClick={async (e) => {
                        e.preventDefault()
                        const onboardingFinished = await finishOnboarding()
                        if (onboardingFinished) {
                          sidebar.toggleSidebar()
                          navigate(routes.HOME)
                        } else {
                          toast(t('onboarding.failure', 'Onboarding could not be completed'))
                        }
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('onboarding.button.complete', 'Complete Onboarding')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Footer (appears on reveal) */}
      <footer className="flex shrink-0 items-center justify-between border-t bg-background p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={prevStep}
          className={cn('h-10 w-10 p-0', {
            invisible: currentStep === 0,
          })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (index <= currentStep || index === 0) {
                  setCurrentStep(index)
                }
              }}
              disabled={index > currentStep && index !== 0}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                index < currentStep
                  ? 'bg-primary opacity-80'
                  : index === currentStep
                    ? 'bg-primary'
                    : 'bg-muted',
                index > currentStep && 'cursor-not-allowed opacity-50',
              )}
            />
          ))}
        </div>

        <Button
          variant={currentStep === 2 ? 'default' : 'outline'}
          size="sm"
          onClick={currentStep === 2 ? undefined : nextStep}
          disabled={currentStep !== 2 && !isStepCompleted()}
          className={cn('w-auto transition-colors', currentStep < 2 ? 'h-10 w-10 p-0' : 'px-4')}
        >
          {currentStep === 2 ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('onboarding.button.complete', 'Complete')}
            </>
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      </footer>
    </div>
  )

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      {introScreen}
      {onboardingStructure}
      {/* Global Styles for Animations */}
      <style jsx>{`
        @keyframes logo-intro {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(0.8);
          }
        }
        .animate-logo-intro {
          animation: logo-intro 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
