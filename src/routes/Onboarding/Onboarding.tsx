import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FolderOpen, Loader, CheckCircle, AlertCircle, User, Zap, ArrowLeft, ArrowRight } from 'lucide-react'
import vuIconRed from '@/assets/vu-icon-red.svg' // Animated logo import
import {
  activateBf3LSX,
  finishOnboarding,
  getLauncherInstallPath,
} from '@/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryKey, routes, STALE } from '@/config/config'
import { InstallVU } from '@/routes/Home/components/InstallVU/InstallVU'
import { open } from '@tauri-apps/plugin-dialog'
import { exists } from '@tauri-apps/plugin-fs' // Tauri FS plugin v2 for existence checks
import { InstallVuDevDialog } from './InstallVuDevDialog'
import { toast } from 'sonner'
import PlayerCredentialsSheet from '@/routes/Home/components/PlayerCredentialsSheet/PlayerCredentialsSheet'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '@/routes/Settings/components/LanguageSelector'
import { useSidebar } from '../../components/ui/sidebar'
import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function Onboarding() {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [vuDevInstallPath, setVuDevInstallPath] = useState('')
  const [isActivated, setIsActivated] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false) // Controls reveal of onboarding steps
  const navigate = useNavigate()
  const dialogRef = useRef(null)
  const sidebar = useSidebar()
  const queryClient = useQueryClient()

  useEffect(() => {
    sidebar.toggleSidebar()
  }, [])

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
        const installPath = await getLauncherInstallPath()
        if (!installPath) {
          return { vuProduction: false, vuDevelopment: false }
        }

        // Enhanced Prod Check: Verify VeniceUnleashed folder and vu.exe existence
        const prodFolder = `${installPath}\\VeniceUnleashed`
        const prodFolderExists = await exists(prodFolder)
        let vuProduction = false
        if (prodFolderExists) {
          const vuExeProd = `${prodFolder}\\vu.exe`
          vuProduction = await exists(vuExeProd)
        }

        // Enhanced Dev Check: Verify VeniceUnleashedDev folder and vu.exe existence (same parent)
        const devFolder = `${installPath}\\VeniceUnleashedDev`
        const devFolderExists = await exists(devFolder)
        let vuDevelopment = false
        if (devFolderExists) {
          const vuExeDev = `${devFolder}\\vu.exe`
          vuDevelopment = await exists(vuExeDev)
        }

        // If vuDevInstallPath is set (custom), prioritize checking that over default
        if (vuDevInstallPath && vuDevInstallPath !== installPath) {
          const customDevFolder = `${vuDevInstallPath}\\VeniceUnleashedDev`
          const customDevFolderExists = await exists(customDevFolder)
          if (customDevFolderExists) {
            const customVuExeDev = `${customDevFolder}\\vu.exe`
            vuDevelopment = await exists(customVuExeDev)
          }
        }

        return {
          vuProduction,
          vuDevelopment,
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
  const showVerifyFeedback = (vuProduction: boolean, vuDevelopment: boolean) => {
    if (vuProduction && vuDevelopment) {
      toast.success(t('onboarding.verify.bothInstalled', 'Both Production and Development VU are installed correctly!'))
    } else if (vuProduction && !vuDevelopment) {
      toast.info(t('onboarding.verify.onlyProd', 'Production VU is installed. Please set up the Development version next.'))
    } else if (!vuProduction && vuDevelopment) {
      toast.warning(t('onboarding.verify.onlyDev', 'Development VU detected, but Production is missing. Install Production first.'))
    } else {
      toast.warning(t('onboarding.verify.noneInstalled', 'Neither Production nor Development VU found. Start by installing Production VU.'))
    }
  }

  const handleVerifyInstall = async () => {
    setIsVerifying(true)
    try {
      await refetch() // Use refetch for immediate update
      if (data) {
        showVerifyFeedback(data.vuProduction, data.vuDevelopment)
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

  async function handleCopyVuProdToDev() {
    const defaultPath = await getLauncherInstallPath()
    const installPath = await open({
      multiple: false,
      directory: true,
      defaultPath,
    })
    if (installPath) {
      try {
        // Security Check 1: Ensure the selected directory exists (though open() should guarantee, but verify)
        const dirExists = await exists(installPath)
        if (!dirExists) {
          toast.error(t('onboarding.error.invalidDir', 'Selected directory does not exist'))
          return
        }

        // Security Check 2: Ensure the Production VU folder exists within the selected path
        // Assuming user selects the parent directory containing 'VeniceUnleashed' (Prod folder)
        const prodVuFolder = `${installPath}\\VeniceUnleashed`
        const prodVuExists = await exists(prodVuFolder)
        if (!prodVuExists) {
          toast.error(t('onboarding.error.prodNotFound', 'Production VU folder (VeniceUnleashed) not found in the selected directory'))
          return
        }

        // Security Check 3: Ensure vu.exe exists in Prod VU to confirm it's a valid installation
        const vuExeProd = `${prodVuFolder}\\vu.exe`
        const vuExeExists = await exists(vuExeProd)
        if (!vuExeExists) {
          toast.error(t('onboarding.error.vuExeNotFound', 'vu.exe not found in Production VU installation. Ensure the installation is complete.'))
          return
        }

        // Optional: Check if Dev folder already exists (warn about potential overwrite)
        const devVuFolder = `${installPath}\\VeniceUnleashedDev`
        const devVuExists = await exists(devVuFolder)
        if (devVuExists) {
          const confirmOverwrite = window.confirm(t('onboarding.warn.devExists', 'Development VU folder already exists. Overwrite? This may delete existing files.'))
          if (!confirmOverwrite) {
            return
          }
        }

        // All checks passed: Proceed
        setVuDevInstallPath(installPath)
        if (dialogRef.current) {
          const element = dialogRef.current as HTMLDialogElement
          element.click()
        }
      } catch (err) {
        console.error('Path validation error:', err)
        toast.error(t('onboarding.error.validationFailed', 'Failed to validate selected path'))
      }
    }
  }

  function handleActivateLSX() {
    toast(t('onboarding.toast.activateBF3'))
    activateBf3LSX()
    setIsActivated(true)
  }

  const { vuProduction, vuDevelopment } = data || { vuProduction: false, vuDevelopment: false }

  const steps = [
    { id: 1, title: t('onboarding.steps.install', 'Install VU'), icon: Download, subtitle: t('onboarding.subtitle', 'Set up Production and Development versions') },
    { id: 2, title: t('onboarding.steps.activate', 'Activate LSX'), icon: Zap, subtitle: t('onboarding.activate.description', 'Follow these steps to enable the mod') },
    { id: 3, title: t('onboarding.steps.account', 'Add Account'), icon: User, subtitle: t('onboarding.account.description', 'Link your player credentials') },
  ]

  // Shared Error Content (post-reveal)
  const errorContent = (
    <div className="h-screen flex flex-col items-center justify-center gap-4 p-4">
      <img
        src={vuIconRed}
        alt="VU Logo"
        className="h-16 w-16 animate-pulse mb-4"
      />
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{t('onboarding.error')}</h1>
        <p className="text-muted-foreground">{error?.message || t('onboarding.unknownError', 'An unknown error occurred')}</p>
      </div>
    </div>
  )

  // Shared Pending Content (post-reveal)
  const pendingContent = (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
      <img
        src={vuIconRed}
        alt="VU Logo"
        className="h-16 w-16 animate-ping mb-4" // Subtle ping instead of spin for loading
      />
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <h1 className="text-xl font-semibold">{t('onboarding.loading')}</h1>
    </div>
  )

  // Intro Logo Screen Overlay
  const introScreen = (
    <div className={cn(
      "absolute inset-0 flex flex-col items-center justify-center bg-background z-50 transition-opacity duration-700",
      !showOnboarding ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    )}>
      <img
        src={vuIconRed}
        alt="VU Logo"
        className="h-32 w-32 animate-logo-intro" // New grow/fade animation
      />
    </div>
  )

  // Main Onboarding Structure (under overlay)
  const onboardingStructure = (
    <div className={cn(
      "flex flex-col h-full transition-opacity duration-700",
      showOnboarding ? "opacity-100" : "opacity-0"
    )}>
      {/* Fixed Header (appears on reveal) */}
      <header className="flex items-center justify-center py-4 px-4 border-b shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center">
          {t('onboarding.header')}
        </h1>
      </header>

      {/* Language Selector (appears on reveal) */}
      <div className="absolute top-4 right-4 z-40">
        <LanguageSelector />
      </div>

      {/* Content Body: Error / Pending / Main Steps */}
      <div className="flex-1 relative overflow-hidden">
        {isError ? (
          <div className="h-full flex items-center justify-center">
            {errorContent}
          </div>
        ) : isPending ? (
          pendingContent
        ) : (
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentStep * 100}%)` }}
          >
            {/* Step 0: Install Panel - Single Card Mirroring InstallVU Structure */}
            <section className="w-full flex-shrink-0 flex flex-col items-center justify-center p-4">
              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
                {(!vuProduction) ? (
                  <Card className="w-full max-w-md rounded-md border-border/50 shadow-md p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Download className="h-12 w-12 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold">
                          {t('onboarding.install.prod.title', 'Download Production VU')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('onboarding.install.prod.description', 'Launch the official installer to download and set up the base VU software.')}
                        </p>
                      </div>
                    </div>
                    <CardContent className="relative p-0">
                      <div className="p-4 space-y-4">
                        <InstallVU />
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toast(t('onboarding.toast.learnMore', 'Learn more about VU Production'))}
                        >
                          ?
                        </Button>
                      </div>
                      <div className="p-4 pt-0 flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[100px]"
                          onClick={handleVerifyInstall}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <Loader className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {t('onboarding.button.verify', 'Verify')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (!vuDevelopment) ? (
                  <Card className="w-full max-w-md rounded-md border-border/50 shadow-md p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <FolderOpen className="h-12 w-12 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold">
                          {t('onboarding.install.dev.title', 'Set Up Development VU')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('onboarding.install.dev.description', 'Select the installation path to copy the development version from your Production setup.')}
                        </p>
                      </div>
                    </div>
                    <CardContent className="relative p-0">
                      <div className="p-4 space-y-4">
                        <Button
                          variant="default"
                          size="lg"
                          className="w-full"
                          onClick={handleCopyVuProdToDev}
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          {t('onboarding.install.dev.button', 'Browse Production Folder')}
                        </Button>
                        <InstallVuDevDialog dialogRef={dialogRef} vuDevInstallPath={vuDevInstallPath} />
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toast(t('onboarding.toast.manualSetup', 'Manual setup instructions available'))}
                        >
                          ℹ️
                        </Button>
                      </div>
                      <div className="p-4 pt-0 flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[100px]"
                          onClick={handleVerifyInstall}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <Loader className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {t('onboarding.button.verify', 'Verify')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="w-full max-w-md rounded-md border-border/50 shadow-md p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="h-12 w-12 text-green-500 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-600">
                          {t('onboarding.install.complete', 'Installation Complete!')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Both Production and Development versions are ready. VU is set up successfully.
                        </p>
                      </div>
                    </div>
                    <CardContent className="p-0">
                      <div className="p-4 pt-0 flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleVerifyInstall}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <Loader className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
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
            <section className="w-full flex-shrink-0 flex flex-col items-center justify-center p-4">
              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
                <Card className="w-full max-w-md rounded-md border-border/50 shadow-md p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="h-12 w-12 text-primary flex-shrink-0" />
                    <div>
                      <h2 className="text-lg font-semibold">
                        {t('onboarding.activate.header')}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {t('onboarding.activate.description', 'Follow these steps to enable the LSX mod for BF3.')}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-0 space-y-4 max-h-[300px] overflow-y-auto">
                    <div className="space-y-3">
                      {[
                        { icon: CheckCircle, text: t('onboarding.activate.step1') },
                        { icon: CheckCircle, text: t('onboarding.activate.step2') },
                        { icon: CheckCircle, text: t('onboarding.activate.step3') },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 pl-6">
                          <item.icon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                          <p className="text-sm leading-relaxed flex-1">{item.text}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full"
                      onClick={handleActivateLSX}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {t('onboarding.activate.button')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Step 2: Account Panel - Single Card for Form + Button */}
            <section className="w-full flex-shrink-0 flex flex-col items-center justify-center p-4">
              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
                <Card className="w-full max-w-md rounded-md border-border/50 shadow-md p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <User className="h-12 w-12 text-primary flex-shrink-0" />
                    <div>
                      <h2 className="text-lg font-semibold">
                        {t('onboarding.account.header', 'Add Your Account')}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {t('onboarding.account.description', 'Enter your player credentials to complete setup.')}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-0 space-y-4 max-h-[300px] overflow-y-auto">
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
                      <CheckCircle className="h-4 w-4 mr-2" />
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
      <footer className="flex items-center justify-between p-4 border-t bg-background shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={prevStep}
          className={cn("w-10 h-10 p-0", {
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
                "h-2 w-2 rounded-full transition-colors",
                index < currentStep ? "bg-primary opacity-80" :
                index === currentStep ? "bg-primary" : "bg-muted",
                index > currentStep && "opacity-50 cursor-not-allowed"
              )}
            />
          ))}
        </div>

        <Button
          variant={currentStep === 2 ? "default" : "outline"}
          size="sm"
          onClick={currentStep === 2 ? undefined : nextStep}
          disabled={currentStep !== 2 && !isStepCompleted()}
          className={cn(
            "w-auto transition-colors",
            currentStep < 2 ? "w-10 h-10 p-0" : "px-4"
          )}
        >
          {currentStep === 2 ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
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
    <div className="h-screen flex flex-col overflow-hidden bg-background relative">
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