import { useTranslation } from 'react-i18next'
import { i18nLanguageCodes, SupportedLanguages } from '@/i18n/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { CIcon } from '@coreui/icons-react'
import * as icon from '@coreui/icons'
import { toast } from 'sonner'

const formSchema = z.object({
  language: z.string(),
})

const languageCodesToFlags = {
  [i18nLanguageCodes.English]: icon.flagSet.cifUs,
  [i18nLanguageCodes.German]: icon.flagSet.cifDe,
  [i18nLanguageCodes.Chinese]: icon.flagSet.cifCn,
  [i18nLanguageCodes.Russian]: icon.flagSet.cifRu,
} as const

type LanguageCodeToFlag = typeof languageCodesToFlags

export function LanguageSelector() {
  const { i18n, t } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { language: i18n.language },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.languageSelector.title')}</FormLabel>
              <Select
                onValueChange={(e) => {
                  // TODO: make this part of user preferences
                  i18n.changeLanguage(e)
                  toast(`${t('settings.languageSelector.toast')}: ${e}`)
                  field.onChange(e)
                }}
                defaultValue={field.value}
              >
                <FormControl className="w-fit">
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SupportedLanguages.map((x, index) => {
                    return (
                      <SelectItem value={x} key={`language-selector-${index}-${x}`}>
                        <div className="flex flex-row items-center gap-2">
                          <CIcon
                            icon={languageCodesToFlags[x as keyof LanguageCodeToFlag]}
                            className="h-5 w-5"
                          />
                          <div>{x}</div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
