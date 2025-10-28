import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader, CheckCircle } from 'lucide-react'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { QueryKey } from '@/config/config'
import { InstallVU } from '@/routes/Home/components/InstallVU/InstallVU'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { listen } from '@tauri-apps/api/event'

export function InstallStep({
  vuProduction,
  vuDevelopment,
  setSelectedInstallPath,
  data,
  refetch,
}: {
  vuProduction: boolean
  vuDevelopment: boolean
  setSelectedInstallPath: Function
  data: any
  refetch: any
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isInstalling, setIsInstalling] = useState(false) // Tracks installation state from InstallVU events
  const [isVerifying, setIsVerifying] = useState(false)

  OnMount(addListeners(setIsInstalling))

  // Listen for VU install complete event to handle advancement and base path
  useEffect(() => {
    clearListeners(setSelectedInstallPath, queryClient)
  }, [queryClient])

  const handleVerifyInstall = async () => {
    setIsVerifying(true)
    try {
      await refetch() // Use refetch for immediate update
      if (data) {
        showVerifyFeedback(data.vuProduction)
      } else {
        toast.error(t('onboarding.verify.error'))
      }
    } catch (err) {
      console.error('Verify error:', err)
      toast.error(t('onboarding.verify.error'))
    } finally {
      setIsVerifying(false)
    }
  }

  // Helper function to show verify feedback based on status
  const showVerifyFeedback = (vuInstalled: boolean) => {
    if (vuInstalled) {
      toast.success(t('onboarding.verify.installed'))
    } else {
      toast.warning(t('onboarding.verify.notInstalled'))
    }
  }

  return (
    <section className="flex w-full flex-shrink-0 flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        {!vuProduction || !vuDevelopment ? (
          <Card className="w-full max-w-md rounded-md border-border/50 p-4 shadow-md">
            {!isInstalling && (
              <div className="flex flex-col items-center space-x-3 text-center">
                <Download className="m-4 h-12 w-12 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{t('onboarding.install.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('onboarding.install.description')}
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
                      onClick={() => toast(t('onboarding.toast.learnMore'))}
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
                        <Loader className="animate-spin mr-1 h-3 w-3" />
                      ) : (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      )}
                      {t('onboarding.button.verify')}
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
                  {t('onboarding.install.complete')}
                </h3>
                <p className="text-sm text-muted-foreground">{t('onboarding.install.success')}</p>
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
                    <Loader className="animate-spin mr-1 h-4 w-4" />
                  ) : (
                    <CheckCircle className="mr-1 h-4 w-4" />
                  )}
                  {t('onboarding.button.refresh')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}

function OnMount(fn: Function) {
  useEffect(() => {
    fn()
  }, [])
}

// Listen for VU install status events to hide/show header when installing
function addListeners(setIsInstalling: Function) {
  let unlistenStatus: (() => void) | null = null
  const setupStatusListener = async () => {
    unlistenStatus = await listen<VuInstallStatusEvent>('vu-install-status', (event) => {
      // @ts-expect-error
      setIsInstalling(event.payload.installing)
      // @ts-expect-error
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
}

function clearListeners(setSelectedInstallPath: Function, queryClient: QueryClient) {
  let unlistenComplete: (() => void) | null = null
  const setupCompleteListener = async () => {
    unlistenComplete = await listen<VuInstallCompleteEvent>(
      'vu-install-complete',
      async (event) => {
        // @ts-expect-error
        if (event.payload.success) {
          console.log('VU install completed successfully – advancing to next step')
          // @ts-expect-error
          setSelectedInstallPath(event.payload.path || null) // Base path from backend
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
}

interface VuInstallStatusEvent {
  payload: {
    installing: boolean // Whether VU installation is active
  }
}

interface VuInstallCompleteEvent {
  payload: {
    success: boolean // Whether installation completed successfully
    path?: string // Optional: User-decided base install path (for verification)
  }
}
