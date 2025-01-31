import { formBuilderInputTypes, StartupDescriptions } from '../Setup/DefaultStartupConfig'
import { StartupArgs } from '../Setup/StartupTypes'
import { CheckBoxComponent } from './CheckBoxComponent'
import { NumberComponent } from './NumberComponent'
import { LoadoutJSON } from '@/config/config'
import { TextAreaComponent } from './TextAreaComponent'

export function FormBuilder({
  form,
  sectionNames,
  filteredArguments,
}: {
  form: any
  sectionNames: Array<keyof StartupArgs>
  filteredArguments: Partial<LoadoutJSON>
}) {
  return sectionNames.map((sectionName) => {
    // @ts-expect-error
    return Object.entries(filteredArguments[sectionName]).map(([key, value]) => {
      // @ts-expect-error
      const fieldType = formBuilderInputTypes[sectionName][key]

      // @ts-expect-error
      const fieldDescription = StartupDescriptions[sectionName as keyof StartupArgs][key]
      if (fieldType === 'checkbox') {
        return (
          <CheckBoxComponent
            defaultChecked={value as boolean}
            key={key}
            description={fieldDescription}
            sectionName={sectionName}
            form={form}
            keyValue={key}
          />
        )
      }
      if (fieldType === 'number') {
        return (
          <NumberComponent
            key={key}
            defaultvalue={value}
            sectionName={sectionName}
            description={fieldDescription}
            form={form}
            keyValue={key}
          />
        )
      }
      if (fieldType === 'textarea') {
        return (
          <TextAreaComponent
            key={key}
            defaultvalue={value}
            sectionName={sectionName}
            description={fieldDescription}
            form={form}
            keyValue={key}
          />
        )
      }
      if (fieldType === 'none') {
        return <div key={key}></div>
      }
    })
  })
}
