import { Button } from '@/components/ui/button'
import { CheckCircle, Zap } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { activateBf3LSX } from '@/api'

export function ActivateStep({}) {
  const { t } = useTranslation()

  function handleActivateLSX() {
    toast(t('onboarding.toast.activateBF3'))
    activateBf3LSX()
  }

  return (
    <section className="flex w-full flex-shrink-0 flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <Card className="w-full max-w-md rounded-md border-border/50 p-4 shadow-md">
          <div className="mb-4 flex items-center space-x-3">
            <Zap className="h-12 w-12 flex-shrink-0 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">{t('onboarding.activate.header')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.activate.description')}
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
            <Button variant="default" size="lg" className="w-full" onClick={handleActivateLSX}>
              <Zap className="mr-2 h-4 w-4" />
              {t('onboarding.activate.button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
