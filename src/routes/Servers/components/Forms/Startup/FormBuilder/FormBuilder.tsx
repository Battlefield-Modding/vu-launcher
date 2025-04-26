import { formBuilderInputTypes } from '../Setup/DefaultStartupConfig'
import { StartupArgs } from '../Setup/StartupTypes'
import { SwitchComponent } from './SwitchComponent'
import { NumberComponent } from './NumberComponent'
import { LoadoutJSON } from '@/config/config'
import { TextAreaComponent } from './TextAreaComponent'
import { ReservedSlotsComponent } from './ReservedSlotsComponent'
import { SetTeamTicketCountComponent } from './SetTeamTicketCountComponent'
import { TextComponent } from './TextComponent'
import { useTranslation } from 'react-i18next'
import { StringArrayComponent } from './StringArrayComponent'

export function FormBuilder({
  form,
  sectionNames,
  filteredArguments,
}: {
  form: any
  sectionNames: Array<keyof StartupArgs>
  filteredArguments: Partial<LoadoutJSON>
}) {
  const { t } = useTranslation()
  return sectionNames.map((sectionName) => {
    if (sectionName === 'reservedSlots') {
      return <ReservedSlotsComponent key={`${sectionName}-key`} form={form} />
    }

    // @ts-expect-error
    return Object.entries(filteredArguments[sectionName] ?? {}).map(([key, value]) => {
      // @ts-expect-error
      const fieldType = formBuilderInputTypes[sectionName][key]

      const label = t(`startupDescriptions.${sectionName as keyof StartupArgs}.${key}`)
      if (fieldType === 'checkbox') {
        return (
          <SwitchComponent
            key={key}
            label={label}
            sectionName={sectionName}
            form={form}
            keyName={key}
          />
        )
      }
      if (fieldType === 'number') {
        return (
          <NumberComponent
            key={key}
            defaultvalue={value}
            sectionName={sectionName}
            label={label}
            form={form}
            keyName={key}
          />
        )
      }
      if (fieldType === 'textarea') {
        return (
          <TextAreaComponent
            key={key}
            sectionName={sectionName}
            label={label}
            form={form}
            keyName={key}
          />
        )
      }
      if (fieldType === 'text') {
        return (
          <TextComponent
            key={key}
            sectionName={sectionName}
            label={label}
            form={form}
            keyName={key}
          />
        )
      }
      if (fieldType === 'stringArray') {
        return (
          <StringArrayComponent
            key={key}
            defaultvalue={value}
            sectionName={sectionName}
            label={label}
            form={form}
            keyName={key}
          />
        )
      }
      if (fieldType === 'setTeamTicketCount') {
        return <SetTeamTicketCountComponent key={key} form={form} />
      }
      if (fieldType === 'none') {
        return <div key={key}></div>
      }
    })
  })
}
