import { LoadoutJSON } from '@/config/config'
import {
  defaultLaunchArgumentInputTypes,
  LaunchArgumentDescriptions,
  LaunchArguments,
} from '../setup/LaunchArguments'
import { CheckBoxComponent } from '../../Startup/FormBuilder/CheckBoxComponent'
import { NumberComponent } from '../../Startup/FormBuilder/NumberComponent'
import { TextAreaComponent } from '../../Startup/FormBuilder/TextAreaComponent'
import { SelectComponent } from './SelectComponent'
import { TextComponent } from '../../Startup/FormBuilder/TextComponent'

export function LaunchArgumentFormBuilder({
  form,
  sectionNames,
  filteredArguments,
}: {
  form: any
  sectionNames: Array<keyof LaunchArguments>
  filteredArguments: Partial<LoadoutJSON>
}) {
  return sectionNames.map((sectionName) => {
    // @ts-expect-error
    return Object.entries(filteredArguments[sectionName] ?? {}).map(([key, value]) => {
      // @ts-expect-error
      const fieldType = defaultLaunchArgumentInputTypes[sectionName][key]

      // @ts-expect-error
      const label = LaunchArgumentDescriptions[sectionName as keyof LaunchArguments][key]
      if (fieldType === 'checkbox') {
        return (
          <CheckBoxComponent
            defaultChecked={value as boolean}
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
            defaultvalue={value}
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
            defaultvalue={value}
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
