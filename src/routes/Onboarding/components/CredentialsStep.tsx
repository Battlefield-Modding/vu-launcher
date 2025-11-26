import { User } from 'lucide-react'
import { OnboardingCredentialsSheet } from './OnboardingCredentialsSheet'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

export function CredentialsStep() {
  const { t } = useTranslation()
  return (
    <section className="flex w-full flex-shrink-0 flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <Card className="w-full max-w-md rounded-md border-border/50 p-4 shadow-md">
          <div className="mb-4 flex items-center space-x-3">
            <User className="h-12 w-12 flex-shrink-0 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">{t('onboarding.account.add')}</h2>
              <p className="text-sm text-muted-foreground">{t('onboarding.account.description')}</p>
            </div>
          </div>
          <CardContent className="max-h-[300px] space-y-4 overflow-y-auto p-0">
            <OnboardingCredentialsSheet />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
