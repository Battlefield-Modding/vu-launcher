import { LoadoutJSON } from '@/config/config'
import { defaultLaunchArgumentInputTypes, LaunchArguments } from '../setup/LaunchArguments'
import { SwitchComponent } from '../../Startup/FormBuilder/SwitchComponent'
import { NumberComponent } from '../../Startup/FormBuilder/NumberComponent'
import { TextAreaComponent } from '../../Startup/FormBuilder/TextAreaComponent'
import { SelectComponent } from './SelectComponent'
import { TextComponent } from '../../Startup/FormBuilder/TextComponent'
import { useTranslation } from 'react-i18next'

export function LaunchArgumentFormBuilder({
  form,
  sectionNames,
  filteredArguments,
}: {
  form: any
  sectionNames: Array<keyof LaunchArguments>
  filteredArguments: Partial<LoadoutJSON>
}) {
  const { t } = useTranslation()
  return sectionNames.map((sectionName) => {
    // @ts-expect-error
    return Object.entries(filteredArguments[sectionName] ?? {}).map(([key, value]) => {
      // @ts-expect-error
      const fieldType = defaultLaunchArgumentInputTypes[sectionName][key]

      const label = t(`launchArgumentDescriptions.${sectionName as keyof LaunchArguments}.${key}`)
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
      if (fieldType === 'select') {
        return (
          <SelectComponent
            key={key}
            sectionName={sectionName}
            label={label}
            form={form}
            keyName={key}
          />
        )
      }
      if (fieldType === 'none') {
        return <div key={key}></div>
      }
    })
  })
}
