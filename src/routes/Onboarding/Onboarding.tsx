import { useEffect, useState } from 'react'
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
import vuIconRed from '@/assets/vu-icon-red.svg'
import { activateBf3LSX, finishOnboarding } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { QueryKey, routes, STALE } from '@/config/config'
import { toast } from 'sonner'
import { OnboardingCredentialsSheet } from './components/OnboardingCredentialsSheet'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '@/routes/Settings/components/LanguageSelector'
import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { invoke } from '@tauri-apps/api/core'
import { InstallStep } from './components/InstallStep'

export function Onboarding() {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const [selectedInstallPath, setSelectedInstallPath] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOnboarding(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: [QueryKey.IsVuInstalled],
    queryFn: async (): Promise<{ vuProduction: boolean; vuDevelopment: boolean }> => {
      try {
        const customBase = selectedInstallPath || undefined

        const isInstalled = await invoke<boolean>('is_vu_installed', { customBase })

        console.log(`VU installed check: ${isInstalled} (custom base: ${customBase || 'default'})`)

        return {
          vuProduction: isInstalled,
          vuDevelopment: isInstalled,
        }
      } catch (err: any) {
        console.error('Installation check error:', err)
        return { vuProduction: false, vuDevelopment: false }
      }
    },
    staleTime: STALE.never,
    refetchOnMount: false,
    enabled: showOnboarding,
  })

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
        setCurrentStep(0)
      }
    }
  }, [data, currentStep, showOnboarding])

  const isStepCompleted = () => {
    switch (currentStep) {
      case 0:
        return data?.vuProduction && data?.vuDevelopment
      case 1:
        return true
      case 2:
        return true
      default:
        return false
    }
  }

  const nextStep = async () => {
    if (isStepCompleted()) {
      if (currentStep < 2) {
        setCurrentStep((prev) => prev + 1)
      }
    } else {
      toast(t('onboarding.toast.completeStep', 'Please complete this step before proceeding'))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  function handleActivateLSX() {
    toast(t('onboarding.toast.activateBF3'))
    activateBf3LSX()
  }

  async function completeOnboarding() {
    const onboardingFinished = await finishOnboarding()
    if (onboardingFinished) {
      navigate(routes.HOME)
    } else {
      toast(t('onboarding.failure', 'Onboarding could not be completed'))
    }
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

  const pendingContent = (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <img src={vuIconRed} alt="VU Logo" className="mb-4 h-16 w-16 animate-ping" />
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <h1 className="text-xl font-semibold">{t('onboarding.loading')}</h1>
    </div>
  )

  const introScreen = (
    <div
      className={cn(
        'absolute inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700',
        !showOnboarding ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <img src={vuIconRed} alt="VU Logo" className="animate-logo-intro h-32 w-32" />
    </div>
  )

  const onboardingStructure = (
    <div
      className={cn(
        'flex h-full flex-col transition-opacity duration-700',
        showOnboarding ? 'opacity-100' : 'opacity-0',
      )}
    >
      <header className="flex shrink-0 items-center justify-center border-b px-4 py-4">
        <h1 className="text-center text-xl font-bold text-foreground sm:text-2xl">
          {t('onboarding.header')}
        </h1>
      </header>

      <div className="absolute bottom-4 left-4 z-40">
        <LanguageSelector />
      </div>

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
            <InstallStep
              vuProduction={vuProduction}
              vuDevelopment={vuDevelopment}
              setSelectedInstallPath={setSelectedInstallPath}
              refetch={refetch}
              data={data}
            />

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
                    <OnboardingCredentialsSheet />
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        )}
      </div>

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
              onClick={async () => {
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
          variant={currentStep > 1 ? 'default' : 'outline'}
          size="sm"
          onClick={currentStep === 2 ? completeOnboarding : nextStep}
          disabled={currentStep > 1 && !isStepCompleted()}
          className={cn('w-auto transition-colors', currentStep < 1 ? 'h-10 w-10 p-0' : 'px-4')}
        >
          {currentStep === 1 && <>{t('onboarding.button.skip')}</>}

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
    </div>
  )
}
