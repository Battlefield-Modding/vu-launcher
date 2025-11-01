import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { setVUDevInstallLocationRegistry, setVUInstallLocationRegistry } from '@/api'
import { useTranslation } from 'react-i18next'
import { QueryKey, UserPreferences } from '@/config/config'
import { open } from '@tauri-apps/plugin-dialog'
import { TooltipWrapper } from '@/components/TooltipWrapper'
import { useQueryClient } from '@tanstack/react-query'

export function SetVuPathSheet({ preferences }: { preferences: UserPreferences }) {
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)

  const { t } = useTranslation()

  async function handlesetVUInstallLocationRegistry() {
    const defaultPath = preferences.venice_unleashed_shortcut_location
    const dir = await open({
      multiple: false,
      directory: false,
      defaultPath,
    })
    if (!dir) {
      return
    }
    if (!dir.toLowerCase().includes('vu.exe')) {
      alert(t('settings.setVuPath.alert.invalidPath'))
      return
    }
    const path_without_exe = dir.split('\\vu.exe')[0]
    const status = await setVUInstallLocationRegistry(path_without_exe)
    if (status) {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.IsVuInstalled],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKey.UserPreferences],
        refetchType: 'all',
      })
      toast(`${t('onboarding.install.prod.toast.chooseInstallDir.success')}: ${dir}`)
    } else {
      toast(t('onboarding.install.prod.toast.chooseInstallDir.failure'))
    }
  }

  async function handleChangeVuDevelopmentLocation() {
    const defaultPath = preferences.dev_venice_unleashed_shortcut_location
    const dir = await open({
      multiple: false,
      directory: false,
      defaultPath,
    })
    if (!dir) {
      return
    }
    if (!dir.toLowerCase().includes('vu.exe')) {
      alert(t('settings.setVuPath.alert.invalidPath'))
      return
    }
    const path_without_exe = dir.split('\\vu.exe')[0]
    const status = await setVUDevInstallLocationRegistry(path_without_exe)
    if (status) {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.IsVuInstalled],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKey.UserPreferences],
        refetchType: 'all',
      })
      toast(`${t('onboarding.install.prod.toast.chooseInstallDir.success')}: ${dir}`)
    } else {
      toast(t('onboarding.install.prod.toast.chooseInstallDir.failure'))
    }
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger className="w-fit">
        <Button variant={'secondary'}>{t('settings.setVuPath.trigger')}</Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-none">
        <SheetHeader>
          <SheetTitle className="text-center text-4xl">{t('settings.setVuPath.title')}</SheetTitle>
        </SheetHeader>

        <table className="m-auto mt-8 max-w-screen-md text-center">
          <tbody>
            <tr className="border border-secondary">
              <th className="h-auto border border-secondary p-2">
                {t('settings.setVuPath.table.headerOne')}
              </th>
              <th className="h-auto border border-secondary p-4">
                {t('settings.setVuPath.table.headerTwo')}
              </th>
            </tr>

            <tr className="border border-secondary">
              <td className="h-auto border border-secondary p-2">
                {t('settings.setVuPath.table.rowOneLabel')}
              </td>
              <td className="h-auto border border-secondary p-4">
                <TooltipWrapper text={t('settings.setVuPath.tooltip.production')}>
                  <Button variant={'secondary'} onClick={handlesetVUInstallLocationRegistry}>
                    {preferences.venice_unleashed_shortcut_location}
                  </Button>
                </TooltipWrapper>
              </td>
            </tr>

            <tr className="border border-secondary">
              <td className="h-auto border border-secondary p-2">
                {t('settings.setVuPath.table.rowTwoLabel')}
              </td>
              <td className="h-auto border border-secondary p-4">
                <TooltipWrapper text={t('settings.setVuPath.tooltip.development')}>
                  <Button variant={'secondary'} onClick={handleChangeVuDevelopmentLocation}>
                    {preferences.dev_venice_unleashed_shortcut_location}
                  </Button>
                </TooltipWrapper>
              </td>
            </tr>
          </tbody>
        </table>
        <SheetFooter className="fixed bottom-4 left-4 m-0 p-0">
          <SheetClose asChild>
            <Button className="w-24" variant="outline">
              {t('button.back')}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
