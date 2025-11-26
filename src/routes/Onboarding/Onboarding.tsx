import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, CheckCircle, AlertCircle, User, Zap, ArrowLeft, ArrowRight } from 'lucide-react'
import { finishOnboarding } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { QueryKey, routes, STALE } from '@/config/config'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '@/routes/Settings/components/LanguageSelector'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { invoke } from '@tauri-apps/api/core'
import { InstallStep } from './components/InstallStep'
import { IntroScreen } from './components/IntroScreen'
import vuIconRed from '@/assets/vu-icon-red.svg'
import { ActivateStep } from './components/ActivateStep'
import { CredentialsStep } from './components/CredentialsStep'
import OnboardingLoader from './components/OnboardingLoader'

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
      toast(t('onboarding.toast.completeStep'))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  async function completeOnboarding() {
    const onboardingFinished = await finishOnboarding()
    if (onboardingFinished) {
      navigate(routes.HOME)
    } else {
      toast(t('onboarding.failure'))
    }
  }

  const { vuProduction, vuDevelopment } = data || { vuProduction: false, vuDevelopment: false }

  const steps = [
    {
      id: 1,
      title: t('onboarding.steps.install.title'),
      icon: Download,
      subtitle: t('onboarding.steps.install.description'),
    },
    {
      id: 2,
      title: t('onboarding.steps.activate.title'),
      icon: Zap,
      subtitle: t('onboarding.steps.activate.description'),
    },
    {
      id: 3,
      title: t('onboarding.steps.account.title'),
      icon: User,
      subtitle: t('onboarding.account.description'),
    },
  ]

  const errorContent = (
    <div className="flex h-screen flex-col items-center justify-center gap-4 p-4">
      <img src={vuIconRed} alt="VU Logo" className="mb-4 h-16 w-16 animate-pulse" />
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{t('onboarding.error')}</h1>
        <p className="text-muted-foreground">{error?.message || t('onboarding.unknownError')}</p>
      </div>
    </div>
  )

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      <IntroScreen showOnboarding={showOnboarding} />

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

        <div className="absolute left-4 top-4 z-40">
          <LanguageSelector />
        </div>

        <div className="relative flex-1 overflow-hidden">
          {isError ? (
            <div className="flex h-full items-center justify-center">{errorContent}</div>
          ) : isPending ? (
            <OnboardingLoader />
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

              <ActivateStep />

              <CredentialsStep />
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
    </div>
  )
}
